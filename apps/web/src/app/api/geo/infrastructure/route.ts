import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { validateGeometry } from '@/lib/validation/geojson';
import { logger } from '@/lib/observability/logger';
import { logRetryAttempt } from '@/lib/errors/context';

// Add retry helper function
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 2
): Promise<T> {
  const startedAt = performance.now();

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isPrismaError = error && typeof error === 'object' &&
        'name' in error && String(error.name).includes('Prisma');

      if (attempt > maxRetries || !isPrismaError) {
        // Final failure
        logger.error({
          event: 'retry_exhausted',
          meta: {
            operation: operationName,
            totalAttempts: attempt,
            cumulativeDurationMs: performance.now() - startedAt,
          },
        });
        throw error;
      }

      // Log retry attempt
      logRetryAttempt({
        operation: operationName,
        attempt,
        maxAttempts: maxRetries + 1,
        cumulativeDurationMs: performance.now() - startedAt,
        lastError: (error as Error)?.message,
        classification: isPrismaError ? 'database' : 'unknown',
      });

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
  throw new Error('Unreachable');
}

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
