import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';
import { getCircuitBreaker } from '@/lib/platform/circuitBreaker';
import { getCachedFirmsDetections, setCachedFirmsDetections } from '@/lib/firms/cache';
import { transformFirmsToGeoJSON, isFirmsCSVResponse, getFirmsStats } from '@/lib/firms/transform';
import { captureExternalApiError, type ExternalApiContext } from '@/lib/errors/context';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/observability/logger';

// Ifrane region with 10km buffer (±0.1° ≈ 11km)
// Core: 33.4°N - 33.6°N, -5.2°W - -5.0°W
// Buffer: 33.3°N - 33.7°N, -5.3°W - -4.9°W
const IFRANE_BBOX = {
  minLat: 33.3,
  maxLat: 33.7,
  minLon: -5.3,
  maxLon: -4.9,
};

const FIRMS_CONFIG = {
  baseUrl: 'https://firms.modaps.eosdis.nasa.gov/api/area',
  source: 'VIIRS_SNPP_NRT', // VIIRS from Suomi-NPP satellite (375m resolution, ~3hr updates)
  dayRange: 1, // Last 24 hours of detections
  timeout: 10000, // 10 second timeout
} as const;

export const GET = withApiHandler(async (request: Request) => {
  // 1. Authentication & Authorization
  const user = await getCurrentUser(request);
  if (!user) throw new AppError(2000); // Unauthorized
  if (!user.scopes.includes('map:read')) throw new AppError(2001); // Forbidden

  // 2. Validate API key configuration
  const apiKey = process.env.FIRMS_MAP_KEY;
  if (!apiKey) {
    logger.error({
      event: 'firms_api_key_missing',
      meta: { message: 'FIRMS_MAP_KEY environment variable not set' }
    });
    throw new AppError(5001, {
      message: 'FIRMS_MAP_KEY environment variable not configured',
      meta: { missingVar: 'FIRMS_MAP_KEY' },
    });
  }

  const bboxString = `${IFRANE_BBOX.minLat},${IFRANE_BBOX.minLon},${IFRANE_BBOX.maxLat},${IFRANE_BBOX.maxLon}`;

  // 3. Try cache first (15-minute TTL)
  const cached = await getCachedFirmsDetections(bboxString, FIRMS_CONFIG.source, FIRMS_CONFIG.dayRange);
  if (cached) {
    const stats = getFirmsStats(cached.data);
    const response = NextResponse.json(cached.data);
    response.headers.set('X-Cache', 'HIT');
    response.headers.set('X-Cache-Age', String(Math.floor((Date.now() - cached.cachedAt) / 1000)));
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=300'); // 15min + 5min stale
    response.headers.set('X-Detection-Count', String(cached.data.features.length));
    response.headers.set('X-High-Confidence-Count', String(stats.highConfidence));
    response.headers.set('X-Recent-Count', String(stats.recentCount));
    return response;
  }

  // 4. Check circuit breaker (prevents cascading failures)
  const breaker = getCircuitBreaker('nasa-firms');
  if (!breaker.canRequest()) {
    logger.warn({
      event: 'firms_circuit_breaker_open',
      meta: { reason: 'too_many_failures' }
    });
    throw new AppError(4002, {
      meta: { reason: 'circuit_breaker_open', provider: 'nasa-firms' },
      message: 'FIRMS service temporarily unavailable due to repeated failures',
    });
  }

  // 5. Build FIRMS API URL
  const apiUrl = new URL(FIRMS_CONFIG.baseUrl);
  apiUrl.searchParams.set('map_key', apiKey);
  apiUrl.searchParams.set('source', FIRMS_CONFIG.source);
  apiUrl.searchParams.set('area', bboxString);
  apiUrl.searchParams.set('day_range', String(FIRMS_CONFIG.dayRange));
  apiUrl.searchParams.set('date', ''); // Use current date

  const apiContext: ExternalApiContext = {
    provider: 'nasa-firms',
    url: apiUrl.toString().replace(apiKey, 'REDACTED'), // Never log API key
    method: 'GET',
    startedAt: performance.now(),
  };

  try {
    // 6. Fetch from FIRMS API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FIRMS_CONFIG.timeout);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent': 'RICER-Fire-Platform/2.1 (Ifrane-Morocco)',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    apiContext.responseStatus = response.status;
    apiContext.responseHeaders = Object.fromEntries(response.headers.entries());
    apiContext.durationMs = performance.now() - apiContext.startedAt;

    // 7. Handle HTTP errors
    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      apiContext.responseBodyPreview = bodyText.slice(0, 500);
      breaker.onFailure();

      logger.error({
        event: 'firms_api_error',
        meta: {
          status: response.status,
          body: bodyText.slice(0, 200),
          duration: apiContext.durationMs
        }
      });

      throw captureExternalApiError(
        apiContext,
        new Error(`FIRMS API returned HTTP ${response.status}: ${bodyText.slice(0, 100)}`)
      );
    }

    // 8. Parse CSV response
    const csvText = await response.text();

    if (!isFirmsCSVResponse(csvText)) {
      apiContext.responseBodyPreview = csvText.slice(0, 500);
      breaker.onFailure();

      logger.error({
        event: 'firms_invalid_response',
        meta: {
          bodyLength: csvText.length,
          bodyPreview: csvText.slice(0, 200)
        }
      });

      throw captureExternalApiError(
        apiContext,
        new Error('Invalid FIRMS API response structure - expected CSV format')
      );
    }

    // 9. Transform CSV to GeoJSON
    const geoJSON = transformFirmsToGeoJSON(csvText);
    const stats = getFirmsStats(geoJSON);

    // 10. Cache successful response
    await setCachedFirmsDetections(bboxString, FIRMS_CONFIG.source, FIRMS_CONFIG.dayRange, geoJSON);
    breaker.onSuccess();

    logger.info({
      event: 'firms_fetch_success',
      meta: {
        detections: geoJSON.features.length,
        highConfidence: stats.highConfidence,
        avgFRP: stats.avgFRP,
        duration: apiContext.durationMs
      }
    });

    // 11. Return successful response with metadata headers
    const apiResponse = NextResponse.json(geoJSON);
    apiResponse.headers.set('X-Cache', 'MISS');
    apiResponse.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=300');
    apiResponse.headers.set('X-Detection-Count', String(geoJSON.features.length));
    apiResponse.headers.set('X-High-Confidence-Count', String(stats.highConfidence));
    apiResponse.headers.set('X-Recent-Count', String(stats.recentCount));
    apiResponse.headers.set('X-API-Duration-Ms', String(Math.round(apiContext.durationMs)));
    apiResponse.headers.set('X-Avg-FRP', String(stats.avgFRP));

    return apiResponse;

  } catch (error) {
    // 12. Handle fetch errors (timeout, network, etc.)
    breaker.onFailure();

    if (error instanceof AppError) throw error;

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error({
        event: 'firms_timeout',
        meta: { timeout: FIRMS_CONFIG.timeout }
      });
      throw new AppError(5003, {
        message: `FIRMS API request timeout after ${FIRMS_CONFIG.timeout}ms`,
        meta: { timeout: FIRMS_CONFIG.timeout },
      });
    }

    // Generic external API error
    throw captureExternalApiError(apiContext, error);
  }
});

// Cache management endpoints (for admin/debugging)
export const DELETE = withApiHandler(async (request: Request) => {
  const user = await getCurrentUser(request);
  if (!user) throw new AppError(2000);
  if (user.role !== 'OFFICIAL') throw new AppError(2001);

  const { clearFirmsCache, getFirmsCacheStats } = await import('@/lib/firms/cache');
  const statsBefore = getFirmsCacheStats();
  clearFirmsCache();

  logger.info({
    event: 'firms_cache_manual_clear',
    meta: { clearedBy: user.cin, ...statsBefore }
  });

  return NextResponse.json({
    message: 'FIRMS cache cleared',
    cleared: statsBefore
  });
});
