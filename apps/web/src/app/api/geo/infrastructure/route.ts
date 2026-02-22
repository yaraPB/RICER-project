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

  const items = await withRetry(
    () => prisma.infrastructure.findMany({ orderBy: { createdAt: 'desc' } }),
    'geo:infrastructure:fetch'
  );

  let validCount = 0;
  let invalidCount = 0;
  const invalidIds: string[] = [];

  const features = items
    .map((infra) => {
      const geometry = validateGeometry(infra.geometry);
      if (!geometry) {
        invalidCount++;
        if (invalidIds.length < 5) invalidIds.push(infra.id); // Only store first 5 samples
        return null;
      }
      validCount++;
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

  // Single summary log instead of individual warnings
  if (invalidCount > 0) {
    logger.warn({
      event: 'invalid_infrastructure_filtered',
      meta: {
        total: items.length,
        valid: validCount,
        invalid: invalidCount,
        sampleIds: invalidIds,
      }
    });
  }

  const response = NextResponse.json({ type: 'FeatureCollection', features });
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60');
  response.headers.set('X-Data-Quality', `${validCount}/${items.length}`);
  return response;
});
