import { test, expect } from '@playwright/test';
import { mockAuthMe, mockGeoRoutes, setLanguage } from './helpers';

test.describe('Report Fire', () => {
  test.beforeEach(async ({ page }) => {
    await setLanguage(page, 'en');
    await mockAuthMe(page, 'CIVILIAN');
    await mockGeoRoutes(page);
  });

  test('page loads with form elements', async ({ page }) => {
    await page.goto('/report');

    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible();
    // Use first() to avoid strict mode violation since "fire location" appears in both label and description
    await expect(page.getByText(/fire location/i).first()).toBeVisible();
    await expect(page.getByText(/fire description/i).first()).toBeVisible();
    await expect(page.getByText(/probable cause|likely cause/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /submit report/i })).toBeVisible();
  });

  test('shows error when submitting without location', async ({ page }) => {
    await page.goto('/report');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible({ timeout: 10000 });

    // Fill only description, skip location - use textarea locator to avoid matching search input
    await page.locator('textarea').fill('There is a fire near the road');

    await page.getByRole('button', { name: /submit report/i }).click();

    // Should show location required error - look for the error div specifically
    await expect(page.locator('.bg-red-50')).toBeVisible();
  });

  test('shows error when submitting without description', async ({ page }) => {
    await page.goto('/report');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible({ timeout: 10000 });

    // Wait for map-ready sentinel before clicking
    await page.locator('[data-map-ready="true"]').first().waitFor({ timeout: 30000 });
    const mapCanvas = page.locator('canvas').first();
    await mapCanvas.click({ position: { x: 200, y: 200 }, force: true });

    // Wait for location to be selected
    await page.waitForTimeout(500);

    // Submit without description
    await page.getByRole('button', { name: /submit report/i }).click();

    // Should show description required error (in any language)
    await expect(page.getByText(/description.*required|add.*description|يرجى إضافة وصف/i)).toBeVisible();
  });

  test('can select location on map', async ({ page }) => {
    await page.goto('/report');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible({ timeout: 10000 });

    // Wait for LocationPicker map canvas to be ready
    const mapCanvas = page.locator('canvas.maplibregl-canvas').first();
    await expect(mapCanvas).toBeVisible({ timeout: 15000 });

    // Also wait for the data-map-ready attribute (set by onLoad)
    await page.locator('[data-map-ready="true"]').first().waitFor({ timeout: 10000 }).catch(() => {
      // If the attribute isn't set, continue anyway - canvas is visible
    });

    // Wait a bit more for map tiles to load
    await page.waitForTimeout(2000);

    // Click on map to set location - use force to bypass pointer interception on mobile
    await mapCanvas.click({ position: { x: 200, y: 200 }, force: true });

    // Wait a moment for the location to register
    await page.waitForTimeout(1000);

    // Should display selected coordinates (uses translation key 'selectedLocation')
    await expect(page.getByText(/selected location|emplacement sélectionné|الموقع المحدد/i)).toBeVisible({ timeout: 10000 });
  });

  test('can select fire cause from dropdown', async ({ page }) => {
    await page.goto('/report');

    const causeSelect = page.locator('select');
    await expect(causeSelect).toBeVisible();

    // Select a cause
    await causeSelect.selectOption('CIGARETTE');

    // Verify selection
    await expect(causeSelect).toHaveValue('CIGARETTE');
  });

  test('displays all cause options', async ({ page }) => {
    await page.goto('/report');

    const causeSelect = page.locator('select');
    await expect(causeSelect).toBeVisible();

    // Check for expected cause options (at least 5 causes)
    const optionCount = await causeSelect.locator('option').count();
    expect(optionCount).toBeGreaterThanOrEqual(5);
  });

  test('successfully submits report and shows success message', async ({ page }) => {
    await page.route('**/api/reports', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          report: {
            id: 'new-report-1',
            userId: 'civilian-1',
            latitude: 33.531,
            longitude: -5.105,
            description: 'Test fire report',
            cause: 'CIGARETTE',
            status: 'PENDING',
            images: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('/report', { waitUntil: 'networkidle' });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible({ timeout: 15000 });

    // Wait for map-ready sentinel before clicking
    await page.locator('[data-map-ready="true"]').first().waitFor({ timeout: 30000 });
    const mapCanvas = page.locator('canvas').first();

    // Click on map to set location - use force to bypass pointer interception on mobile
    await mapCanvas.click({ position: { x: 200, y: 200 }, force: true });
    await page.waitForTimeout(1000);

    // Fill description - use textarea locator to avoid matching search input
    await page.locator('textarea').fill('Smoke visible from the highway');

    // Select cause
    await page.locator('select').selectOption('CIGARETTE');

    // Submit
    await page.getByRole('button', { name: /submit report/i }).click();

    // Should show success message (translations: reportSuccess)
    await expect(page.getByText(/report.*submitted|success|تم إرسال/i)).toBeVisible({ timeout: 15000 });
  });

  test('cancel button navigates back', async ({ page }) => {
    // First navigate to map so we have navigation history
    await page.goto('/map');
    await expect(page.getByRole('heading', { name: /fire map/i })).toBeVisible({ timeout: 10000 });

    // Then navigate to report
    await page.goto('/report');
    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible({ timeout: 10000 });

    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible();

    // Click cancel should navigate away
    await cancelButton.click();

    // Should no longer be on report page
    await expect(page).not.toHaveURL(/\/report$/);
  });

  test('shows loading state while submitting', async ({ page }) => {
    // Delay the API response to see loading state
    await page.route('**/api/reports', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          report: {
            id: 'new-report-1',
            userId: 'civilian-1',
            latitude: 33.531,
            longitude: -5.105,
            description: 'Test fire report',
            cause: 'UNKNOWN',
            status: 'PENDING',
            images: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });

    await page.goto('/report', { waitUntil: 'networkidle' });

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible({ timeout: 15000 });

    // Wait for map-ready sentinel before clicking
    await page.locator('[data-map-ready="true"]').first().waitFor({ timeout: 30000 });
    const mapCanvas = page.locator('canvas').first();
    await mapCanvas.click({ position: { x: 200, y: 200 }, force: true });
    await page.waitForTimeout(1000);

    // Fill description
    await page.locator('textarea').fill('Fire report description');

    // Submit and check for loading state (button text changes to "Submitting..." / t('submitting'))
    const submitButton = page.getByRole('button', { name: /submit report/i });
    await submitButton.click();

    // Verify loading state appears - button text should change
    await expect(page.getByRole('button').filter({ hasText: /submitting|envoi|جاري/i })).toBeVisible({ timeout: 5000 });
  });

  test('handles API error gracefully', async ({ page }) => {
    await page.route('**/api/reports', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 1000,
            userMessage: 'Server error occurred',
            requestId: 'test-123',
          },
        }),
      });
    });

    await page.goto('/report');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /report.*fire/i })).toBeVisible({ timeout: 10000 });

    // Wait for map-ready sentinel before clicking
    await page.locator('[data-map-ready="true"]').first().waitFor({ timeout: 30000 });
    const mapCanvas = page.locator('canvas').first();
    await mapCanvas.click({ position: { x: 200, y: 200 }, force: true });
    await page.waitForTimeout(500);

    // Fill description
    await page.locator('textarea').fill('Fire report description');

    // Submit
    await page.getByRole('button', { name: /submit report/i }).click();

    // Should show error message
    await expect(page.getByText(/server error|error occurred/i)).toBeVisible();
  });
});
