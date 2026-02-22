import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { validateGeometry } from '@/lib/validation/geojson';
import { logger } from '@/lib/observability/logger';
import { withRetry } from '@/lib/database/withRetry';

export const GET = withApiHandler(async (request: Request) => {
  const user = await getCurrentUser(request);
  if (!user) throw new AppError(2000);
  if (!user.scopes.includes('map:read')) throw new AppError(2001);

  const basins = await withRetry(
    () => prisma.riskBasin.findMany({ orderBy: { riskLevel: 'desc' } }),
    'geo:risk_basins:fetch'
  );

  const features = basins
    .map((basin) => {
      const geometry = validateGeometry(basin.geometry);
      if (!geometry) {
        logger.warn({ event: 'invalid_risk_basin_geometry', meta: { riskBasinId: basin.id } });
        return null;
      }
      return {
        type: 'Feature' as const,
        geometry,
        properties: {
          id: basin.id,
          name: basin.name,
          riskLevel: basin.riskLevel,
          description: basin.description ?? undefined,
        },
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const response = NextResponse.json({ type: 'FeatureCollection', features });
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60');
  return response;
});
