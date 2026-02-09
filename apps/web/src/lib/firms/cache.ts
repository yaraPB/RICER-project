import { logger } from '@/lib/observability/logger';
import type { GeoFeatureCollection, GeoFirmsDetectionProps } from '@/types';

type CacheEntry = {
  data: GeoFeatureCollection<GeoFirmsDetectionProps>;
  expiresAt: number;
  cachedAt: number;
};

const firmsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCacheKey(bbox: string, source: string, dayRange: number): string {
  return `firms:${source}:${bbox}:${dayRange}d`;
}

export async function getCachedFirmsDetections(
  bbox: string,
  source: string,
  dayRange: number
): Promise<{ data: GeoFeatureCollection<GeoFirmsDetectionProps>; cachedAt: number } | null> {
  const key = getCacheKey(bbox, source, dayRange);
  const entry = firmsCache.get(key);

  if (!entry) return null;

  const now = Date.now();
  if (now > entry.expiresAt) {
    firmsCache.delete(key);
    logger.info({ event: 'firms_cache_expired', meta: { bbox, source, dayRange } });
    return null;
  }

  logger.info({
    event: 'firms_cache_hit',
    meta: { bbox, source, dayRange, ageSeconds: Math.floor((now - entry.cachedAt) / 1000) }
  });
  return { data: entry.data, cachedAt: entry.cachedAt };
}

export async function setCachedFirmsDetections(
  bbox: string,
  source: string,
  dayRange: number,
  data: GeoFeatureCollection<GeoFirmsDetectionProps>
): Promise<void> {
  const key = getCacheKey(bbox, source, dayRange);
  const now = Date.now();
  firmsCache.set(key, {
    data,
    expiresAt: now + CACHE_TTL_MS,
    cachedAt: now,
  });
  logger.info({
    event: 'firms_cached',
    meta: {
      bbox,
      source,
      dayRange,
      ttlMs: CACHE_TTL_MS,
      detectionCount: data.features.length
    }
  });
}

export function clearFirmsCache(): void {
  const size = firmsCache.size;
  firmsCache.clear();
  logger.info({ event: 'firms_cache_cleared', meta: { entriesCleared: size } });
}

export function getFirmsCacheStats(): { entries: number; totalDetections: number } {
  let totalDetections = 0;
  firmsCache.forEach((entry) => {
    totalDetections += entry.data.features.length;
  });
  return { entries: firmsCache.size, totalDetections };
}
