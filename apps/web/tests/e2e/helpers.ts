import type { Page } from '@playwright/test';

type Role = 'CIVILIAN' | 'OFFICIAL';

export async function setLanguage(page: Page, language: 'en' | 'fr' | 'ar') {
  await page.addInitScript((lang) => {
    const value = JSON.stringify({ state: { language: lang }, version: 0 });
    window.localStorage.setItem('ricer-language', value);
    document.cookie = `ricer-language=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, language);
}

export async function mockAuthMe(page: Page, role: Role = 'CIVILIAN') {
  const user =
    role === 'OFFICIAL'
      ? {
          id: 'official-1',
          cin: 'OFFICIAL123',
          phone: '+212600000001',
          role: 'OFFICIAL',
          department: 'Operations',
          position: 'Chief',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : {
          id: 'civilian-1',
          cin: 'CIVILIAN123',
          phone: '+212600000002',
          role: 'CIVILIAN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}

export async function mockGeoRoutes(page: Page) {
  const now = new Date().toISOString();

  // Incidents GeoJSON
  await page.route('**/api/geo/incidents', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-5.105, 33.531] },
            properties: { id: 'inc-1', cause: 'CIGARETTE', severity: 3, status: 'ALERTE', description: 'Forest fire near main road', createdAt: now },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-5.112, 33.528] },
            properties: { id: 'inc-2', cause: 'LIGHTNING', severity: 2, status: 'ETEINT', description: 'Small brush fire', createdAt: now },
          },
        ],
      }),
    });
  });

  // Resources GeoJSON (empty for civilians)
  await page.route('**/api/geo/resources', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ type: 'FeatureCollection', features: [] }),
    });
  });

  // Infrastructure GeoJSON
  await page.route('**/api/geo/infrastructure', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ type: 'FeatureCollection', features: [] }),
    });
  });

  // Risk basins GeoJSON
  await page.route('**/api/geo/risk-basins', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ type: 'FeatureCollection', features: [] }),
    });
  });

  // Block MapTiler tile requests with 1px blank PNG
  const blankPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
    'base64'
  );
  await page.route('**/tiles.maptiler.com/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: blankPng });
  });
  await page.route('**/tile.openstreetmap.org/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: blankPng });
  });
}

export type MockReport = {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  description: string;
  images: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  cause?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    cin: string;
    phone: string;
    role: Role;
    department?: string;
    position?: string;
    createdAt: string;
    updatedAt: string;
  };
};

export async function mockReports(page: Page, initialReports: MockReport[]) {
  let reports = [...initialReports];

  await page.route('**/api/reports', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reports }),
    });
  });

  await page.route('**/api/reports/*', async (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback();
    const url = new URL(route.request().url());
    const id = url.pathname.split('/').pop();
    let body: { status?: unknown } | null = null;
    try {
      body = route.request().postDataJSON() as { status?: unknown };
    } catch {
      body = null;
    }
    const status = typeof body?.status === 'string' ? body.status : null;
    if (!id || !status) {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { userMessage: 'Invalid request.' } }) });
      return;
    }

    reports = reports.map((r) => (r.id === id ? { ...r, status: status as MockReport['status'] } : r));
    const report = reports.find((r) => r.id === id);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ report }),
    });
  });
}

export async function mockWeather(page: Page) {
  await page.route('**/api/weather', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        temperature: 22,
        windSpeed: 14,
        windDirection: 90,
        timestamp: new Date().toISOString(),
      }),
    });
  });
}

export async function mockAnalytics(page: Page) {
  await page.route('**/api/analytics', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timeline: [{ date: new Date().toISOString().slice(0, 10), count: 1 }],
        causes: [{ cause: 'CIGARETTE', count: 1 }],
        stats: { totalIncidents: 1, daysWithFires: 1, dailyAverage: '1.0' },
      }),
    });
  });
}

export async function mockEquipment(page: Page) {
  await page.route('**/api/equipment', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        equipment: [
          {
            id: 'eq-1',
            category: 'Vehicles',
            name: 'Truck 1',
            quantity: 2,
            condition: 'Bon',
            location: 'Ifrane',
            lastMaintenance: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        retardantProducts: [],
        infrastructure: [],
        truckDeployments: [],
      }),
    });
  });

  await page.route('**/api/equipment/*', async (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        equipment: {
          id: 'eq-1',
          category: 'Vehicles',
          name: 'Truck 1',
          quantity: 3,
          condition: 'Bon',
          location: 'Ifrane',
          lastMaintenance: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  });
}

