import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { validateGeometry } from '@/lib/validation/geojson';
import { logger } from '@/lib/observability/logger';

export const GET = withApiHandler(async (request: Request) => {
  const user = await getCurrentUser(request);
  if (!user) throw new AppError(2000);
  if (!user.scopes.includes('map:read')) throw new AppError(2001);

  const items = await prisma.infrastructure.findMany({ orderBy: { createdAt: 'desc' } });

  const features = items
    .map((infra) => {
      const geometry = validateGeometry(infra.geometry);
      if (!geometry) {
        logger.warn({ event: 'invalid_infrastructure_geometry', meta: { infrastructureId: infra.id } });
        return null;
      }
      return {
        type: 'Feature' as const,
        geometry,
        properties: {
          id: infra.id,
          type: infra.type,
          name: infra.name,
          status: infra.status,
          description: infra.description,
        },
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const response = NextResponse.json({ type: 'FeatureCollection', features });
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60');
  return response;
});
