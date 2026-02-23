import { test, expect } from '@playwright/test';
import { mockAuthMe, mockReports, setLanguage, type MockReport } from './helpers';

const NOW = new Date().toISOString();

const SAMPLE_REPORTS: MockReport[] = [
  {
    id: 'report-1',
    userId: 'civilian-1',
    latitude: 33.531,
    longitude: -5.105,
    description: 'Smoke near the road.',
    images: [],
    status: 'PENDING',
    cause: 'CIGARETTE',
    createdAt: NOW,
    updatedAt: NOW,
    user: {
      id: 'civilian-1',
      cin: 'CIVILIAN123',
      phone: '+212600000002',
      role: 'CIVILIAN',
      createdAt: NOW,
      updatedAt: NOW,
    },
  },
];

test('reports list renders and updates status without errors', async ({ page }) => {
  await setLanguage(page, 'en');
  await mockAuthMe(page, 'OFFICIAL');
  await mockReports(page, SAMPLE_REPORTS);

  await page.goto('/reports-list');

  await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
  await expect(page.getByText('Smoke near the road.')).toBeVisible();

  const pendingButton = page.getByRole('button', { name: 'Pending' });
  const inProgressButton = page.getByRole('button', { name: 'In progress' });

  await expect(pendingButton).toBeDisabled();
  await expect(inProgressButton).toBeEnabled();

  await inProgressButton.click();

  await expect(inProgressButton).toBeDisabled();
  await expect(pendingButton).toBeEnabled();
});

test('skeleton visible during load', async ({ page }) => {
  await setLanguage(page, 'en');
  await mockAuthMe(page, 'OFFICIAL');

  // Delay the /api/reports response by 300ms
  await page.route('**/api/reports', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await new Promise((r) => setTimeout(r, 300));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: SAMPLE_REPORTS,
        pagination: { cursor: null, hasMore: false, total: SAMPLE_REPORTS.length },
      }),
    });
  });

  await page.goto('/reports-list');

  // Skeleton should be visible during load
  const skeleton = page.locator('[aria-busy="true"]');
  await expect(skeleton).toBeVisible();

  // After data arrives, skeleton should be gone and content visible
  await expect(page.getByText('Smoke near the road.')).toBeVisible({ timeout: 5000 });
  await expect(skeleton).not.toBeVisible();
});

test('timeout shows retry', async ({ page }) => {
  await setLanguage(page, 'en');
  await mockAuthMe(page, 'OFFICIAL');

  // Never respond to /api/reports — let it hang
  await page.route('**/api/reports', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    // Never fulfill — simulate a hang
    await new Promise(() => {});
  });

  await page.goto('/reports-list');

  // After ~5s the timeout alert should appear
  const alert = page.locator('role=alert');
  await expect(alert).toBeVisible({ timeout: 10000 });
  await expect(alert).toContainText('Unable to load reports');
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

test('retry reloads data after timeout', async ({ page }) => {
  await setLanguage(page, 'en');
  await mockAuthMe(page, 'OFFICIAL');

  let callCount = 0;

  await page.route('**/api/reports', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    callCount++;
    if (callCount === 1) {
      // First call: hang forever (will be aborted by timeout)
      await new Promise(() => {});
    } else {
      // Second call: return data
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: SAMPLE_REPORTS,
          pagination: { cursor: null, hasMore: false, total: SAMPLE_REPORTS.length },
        }),
      });
    }
  });

  await page.goto('/reports-list');

  // Wait for timeout
  const retryButton = page.getByRole('button', { name: 'Retry' });
  await expect(retryButton).toBeVisible({ timeout: 10000 });

  // Click retry
  await retryButton.click();

  // Data should now be visible
  await expect(page.getByText('Smoke near the road.')).toBeVisible({ timeout: 10000 });
});
