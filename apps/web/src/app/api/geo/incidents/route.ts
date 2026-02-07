import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { validatePoint } from '@/lib/validation/geojson';
import { logger } from '@/lib/observability/logger';

export const GET = withApiHandler(async (request: Request) => {
  const user = await getCurrentUser(request);
  if (!user) throw new AppError(2000);
  if (!user.scopes.includes('map:read')) throw new AppError(2001);

  const incidents = await prisma.incident.findMany({ orderBy: { createdAt: 'desc' } });

  const features = incidents
    .map((inc) => {
      const location = validatePoint(inc.location);
      if (!location) {
        logger.warn({ event: 'invalid_incident_location', meta: { incidentId: inc.id } });
        return null;
      }
      return {
        type: 'Feature' as const,
        geometry: location,
        properties: {
          id: inc.id,
          cause: inc.cause,
          severity: inc.severity,
          status: inc.status,
          description: inc.description ?? undefined,
          createdAt: inc.createdAt.toISOString(),
        },
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const response = NextResponse.json({ type: 'FeatureCollection', features });
  response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=5');
  return response;
});
