import { test, expect } from '@playwright/test';
import { mockAuthMe, mockReports, setLanguage, type MockReport } from './helpers';

test('reports list renders and updates status without errors', async ({ page }) => {
  await setLanguage(page, 'en');
  await mockAuthMe(page, 'OFFICIAL');

  const now = new Date().toISOString();
  const reports: MockReport[] = [
    {
      id: 'report-1',
      userId: 'civilian-1',
      latitude: 33.531,
      longitude: -5.105,
      description: 'Smoke near the road.',
      images: [],
      status: 'PENDING',
      cause: 'CIGARETTE',
      createdAt: now,
      updatedAt: now,
      user: {
        id: 'civilian-1',
        cin: 'CIVILIAN123',
        phone: '+212600000002',
        role: 'CIVILIAN',
        createdAt: now,
        updatedAt: now,
      },
    },
  ];

  await mockReports(page, reports);

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

