import { test, expect } from '@playwright/test';
import { mockAuthMe, mockReports, mockWeather, setLanguage, type MockReport } from './helpers';

test('map page loads KPIs and renders legend', async ({ page }) => {
  await setLanguage(page, 'en');
  await mockAuthMe(page, 'OFFICIAL');
  await mockWeather(page);

  const now = new Date().toISOString();
  const reports: MockReport[] = [
    {
      id: 'report-1',
      userId: 'civilian-1',
      latitude: 33.531,
      longitude: -5.105,
      description: 'Test report',
      images: [],
      status: 'PENDING',
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

  await page.goto('/map');

  await expect(page.getByRole('heading', { name: 'Fire Map' })).toBeVisible();
  await expect(page.getByText('Risk index')).toBeVisible();
  await expect(page.getByText('Legend')).toBeVisible();
});

