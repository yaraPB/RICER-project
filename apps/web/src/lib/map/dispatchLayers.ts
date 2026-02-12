/**
 * Dispatch layer factories for map visualization - MVP Phase
 * Creates Deck.gl layers for routes and dispatch-related features
 */

import { PathLayer, IconLayer } from '@deck.gl/layers';
import { circleIcon } from './helpers';
import type { RouteResponse } from '@/lib/routing/types';

export interface RouteLayerData {
  route: RouteResponse;
  routeId: string;
  isPrimary: boolean;
}

export interface ActiveTeamLayerData {
  teamId: string;
  teamName: string;
  status: string;
  coordinates: [number, number];
}

/**
 * Creates PathLayer for dispatch routes
 * MVP: Simple solid blue lines for primary routes
 * V1: Will add animated dash flow for Tier A GPU
 */
export function createRouteLayer(
  routes: RouteLayerData[],
  isActive: boolean
): PathLayer | null {
  if (!isActive || routes.length === 0) return null;

  const data = routes.map((r) => ({
    path: r.route.primary.coordinates,
    routeId: r.routeId,
    isPrimary: r.isPrimary,
    distance_km: r.route.primary.distance_km,
    duration_min: r.route.primary.duration_min,
  }));

  return new PathLayer({
    id: 'dispatch-routes',
    data,
    getPath: (d: (typeof data)[0]) => d.path,
    getColor: (d: (typeof data)[0]) => (d.isPrimary ? [37, 99, 235, 255] : [249, 115, 22, 200]), // Blue for primary, orange for alternatives
    getWidth: (d: (typeof data)[0]) => (d.isPrimary ? 4 : 3),
    widthMinPixels: 2,
    widthMaxPixels: 8,
    pickable: true,
    onHover: (info: any) => {
      const tooltip = document.getElementById('map-tooltip');
      if (!tooltip) return false;

      if (info.object) {
        const { routeId, distance_km, duration_min, isPrimary } = info.object;
        const routeType = isPrimary ? 'Primary Route' : 'Alternative Route';
        tooltip.innerHTML = `
          <div><strong>${routeType}</strong></div>
          <div>Distance: ${distance_km.toFixed(2)} km</div>
          <div>Duration: ${duration_min.toFixed(0)} min</div>
        `;
        tooltip.style.left = `${info.x}px`;
        tooltip.style.top = `${info.y}px`;
        tooltip.style.display = 'block';
        return true;
      } else {
        tooltip.style.display = 'none';
        return false;
      }
    },
  });
}

/**
 * Creates IconLayer for active teams (teams currently dispatched)
 * Reuses existing resource layer pattern
 */
export function createActiveTeamsLayer(
  teams: ActiveTeamLayerData[],
  isActive: boolean
): IconLayer | null {
  if (!isActive || teams.length === 0) return null;

  const statusColorMap: Record<string, string> = {
    EN_ROUTE: '#eab308', // Yellow
    ON_SCENE: '#22c55e', // Green
    RETURNING: '#3b82f6', // Blue
    AVAILABLE: '#6b7280', // Gray
    UNAVAILABLE: '#dc2626', // Red
  };

  const data = teams.map((team) => ({
    coordinates: team.coordinates,
    color: statusColorMap[team.status] ?? '#6b7280',
    teamId: team.teamId,
    teamName: team.teamName,
    status: team.status,
  }));

  return new IconLayer({
    id: 'active-teams',
    data,
    getPosition: (d: (typeof data)[0]) => d.coordinates,
    getIcon: (d: (typeof data)[0]) => ({
      url: circleIcon(d.color),
      width: 24,
      height: 24,
    }),
    getSize: () => 36, // Slightly larger than regular resources
    pickable: true,
    onHover: (info: any) => {
      const tooltip = document.getElementById('map-tooltip');
      if (!tooltip) return false;

      if (info.object) {
        const { teamName, status } = info.object;
        const statusLabel = status.replace('_', ' ');
        tooltip.innerHTML = `
          <div><strong>${teamName}</strong></div>
          <div>Status: ${statusLabel}</div>
        `;
        tooltip.style.left = `${info.x}px`;
        tooltip.style.top = `${info.y}px`;
        tooltip.style.display = 'block';
        return true;
      } else {
        tooltip.style.display = 'none';
        return false;
      }
    },
  });
}

/**
 * Transform route response to layer data format
 */
export function transformRouteToLayerData(
  route: RouteResponse,
  routeId: string,
  isPrimary = true
): RouteLayerData {
  return {
    route,
    routeId,
    isPrimary,
  };
}

/**
 * Transform team data to active teams layer format
 */
export function transformTeamToLayerData(team: {
  id: string;
  name: string;
  status: string;
  location: { type: 'Point'; coordinates: [number, number] };
}): ActiveTeamLayerData {
  return {
    teamId: team.id,
    teamName: team.name,
    status: team.status,
    coordinates: team.location.coordinates,
  };
}
