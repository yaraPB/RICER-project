import { useState, useEffect, useRef } from 'react';

interface PopulationGridFeature {
  geometry: { coordinates: [number, number] };
  properties: { pop: number };
}

interface PopulationGrid {
  features: PopulationGridFeature[];
}

// Module-level singleton cache — loaded once, reused across all hook instances
let gridCache: PopulationGrid | null = null;
let gridPromise: Promise<PopulationGrid | null> | null = null;

function loadGrid(): Promise<PopulationGrid | null> {
  if (gridCache) return Promise.resolve(gridCache);
  if (gridPromise) return gridPromise;

  gridPromise = fetch('/data/ifrane-population-grid.json')
    .then((res) => (res.ok ? res.json() : null))
    .then((data: PopulationGrid | null) => {
      if (data) gridCache = data;
      return data;
    })
    .catch(() => null);

  return gridPromise;
}

/** Haversine distance in km between two [lon, lat] points */
function haversineKm(
  lon1: number, lat1: number,
  lon2: number, lat2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Computes estimated population within a given radius of a coordinate.
 *
 * @param center - [longitude, latitude] or null
 * @param radiusKm - search radius in km (default 5)
 * @returns { population, loading }
 */
export function usePopulationAtRisk(
  center: [number, number] | null,
  radiusKm = 5,
): { population: number | null; loading: boolean } {
  const [population, setPopulation] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const lastKey = useRef<string>('');

  useEffect(() => {
    if (!center) {
      setPopulation(null);
      lastKey.current = '';
      return;
    }

    const key = `${center[0].toFixed(4)},${center[1].toFixed(4)},${radiusKm}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    let cancelled = false;
    setLoading(true);

    loadGrid().then((grid) => {
      if (cancelled || !grid) {
        if (!cancelled) setLoading(false);
        return;
      }

      let total = 0;
      for (const f of grid.features) {
        const [lon, lat] = f.geometry.coordinates;
        if (haversineKm(center[0], center[1], lon, lat) <= radiusKm) {
          total += f.properties.pop;
        }
      }

      if (!cancelled) {
        setPopulation(total);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [center, radiusKm]);

  return { population, loading };
}
