import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { validatePoint } from '@/lib/validation/geojson';
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

  const incidents = await withRetry(
    () => prisma.incident.findMany({ orderBy: { createdAt: 'desc' } }),
    'geo:incidents:fetch'
  );

  let validCount = 0;
  let invalidCount = 0;
  const invalidIds: string[] = [];

  const features = incidents
    .map((inc) => {
      const location = validatePoint(inc.location);
      if (!location) {
        invalidCount++;
        if (invalidIds.length < 5) invalidIds.push(inc.id); // Only store first 5 samples
        return null;
      }
      validCount++;
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

  // Single summary log instead of individual warnings
  if (invalidCount > 0) {
    logger.warn({
      event: 'invalid_incidents_filtered',
      meta: {
        total: incidents.length,
        valid: validCount,
        invalid: invalidCount,
        sampleIds: invalidIds,
      }
    });
  }

  const response = NextResponse.json({ type: 'FeatureCollection', features });
  response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=5');
  response.headers.set('X-Data-Quality', `${validCount}/${incidents.length}`);
  return response;
});
