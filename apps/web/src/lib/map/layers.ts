/**
 * Deck.gl layer factory functions for map visualization
 */

import { IconLayer, PathLayer } from '@deck.gl/layers';
import { RESOURCE_TYPE_COLORS } from './colors';
import { circleIcon } from './helpers';
import type { GeoFeatureCollection, GeoResourceProps, GeoInfrastructureProps } from '@/types';

/**
 * Creates icon layer for resource markers (trucks, aircraft, personnel, equipment)
 */
export function createResourceLayer(
  resources: GeoFeatureCollection<GeoResourceProps>,
  isActive: boolean
): IconLayer | null {
  if (!isActive || resources.features.length === 0) return null;

  const data = resources.features.map((f) => ({
    coordinates: f.geometry.coordinates as [number, number],
    color: RESOURCE_TYPE_COLORS[f.properties.type] ?? '#6b7280',
  }));

  return new IconLayer({
    id: 'resource-icons',
    data,
    getPosition: (d: (typeof data)[0]) => d.coordinates,
    getIcon: (d: (typeof data)[0]) => ({
      url: circleIcon(d.color),
      width: 24,
      height: 24,
    }),
    getSize: () => 32,
  });
}

/**
 * Creates icon and path layers for infrastructure (watchtowers, water points, stations, firebreaks)
 */
export function createInfrastructureLayers(
  infrastructure: GeoFeatureCollection<GeoInfrastructureProps>,
  isActive: boolean
): (IconLayer | PathLayer)[] {
  if (!isActive || infrastructure.features.length === 0) return [];

  const layers: (IconLayer | PathLayer)[] = [];

  const iconColorMap: Record<string, string> = {
    WATCHTOWER: '#7c3aed',
    WATER_POINT: '#0ea5e9',
    STATION: '#14b8a6',
  };

  // Point infrastructure (watchtowers, water points, stations)
  const pointFeatures = infrastructure.features.filter(
    (f) =>
      f.properties.type === 'WATCHTOWER' ||
      f.properties.type === 'WATER_POINT' ||
      f.properties.type === 'STATION',
  );

  if (pointFeatures.length > 0) {
    const data = pointFeatures.map((f) => ({
      coordinates: f.geometry.coordinates as [number, number],
      color: iconColorMap[f.properties.type] ?? '#6b7280',
    }));

    layers.push(
      new IconLayer({
        id: 'infra-icons',
        data,
        getPosition: (d: (typeof data)[0]) => d.coordinates,
        getIcon: (d: (typeof data)[0]) => ({
          url: circleIcon(d.color),
          width: 24,
          height: 24,
        }),
        getSize: () => 28,
      })
    );
  }

  // Firebreak paths
  const firebreaks = infrastructure.features.filter(
    (f) => f.properties.type === 'FIREBREAK',
  );

  if (firebreaks.length > 0) {
    const paths = firebreaks.map((f) => ({
      path: f.geometry.coordinates as [number, number][],
    }));

    layers.push(
      new PathLayer({
        id: 'firebreak-paths',
        data: paths,
        getPath: (d: (typeof paths)[0]) => d.path,
        getColor: () => [139, 92, 246],
        getWidth: () => 4,
      })
    );
  }

  return layers;
}
