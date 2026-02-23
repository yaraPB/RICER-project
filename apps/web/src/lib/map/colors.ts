/**
 * Centralized color definitions for map visualizations
 * Single source of truth for all incident, resource, and equipment colors
 */

export const INCIDENT_STATUS_COLORS: Record<string, string> = {
  VIGILANCE: '#f59e0b',
  ALERTE: '#f97316',
  INTERVENTION: '#ef4444',
  MAITRISE: '#8b5cf6',
  ETEINT: '#6b7280',
};

export const RESOURCE_TYPE_COLORS: Record<string, string> = {
  TRUCK: '#22c55e',
  AIRCRAFT: '#3b82f6',
  PERSONNEL: '#f59e0b',
  EQUIPMENT: '#ec4899',
};

export const TRUCK_STATUS_COLORS: Record<string, string> = {
  'Disponible': '#22c55e',
  'En route': '#f97316',
  'En intervention': '#ef4444',
};

/**
 * FIRMS detection confidence level colors
 * High confidence = red (likely fire)
 * Nominal confidence = orange (probable fire)
 * Low confidence = gray (possible fire or false positive)
 */
export const FIRMS_CONFIDENCE_COLORS: Record<string, string> = {
  low: '#9ca3af', // gray-400 - low confidence detections
  nominal: '#f59e0b', // amber-500 - nominal confidence
  high: '#ef4444', // red-500 - high confidence fire
};

/**
 * Fire Radiative Power (FRP) gradient for intensity visualization
 * FRP measured in MegaWatts (MW)
 * Low: < 10 MW (smoldering, small fire)
 * Medium: 10-50 MW (active fire)
 * High: > 50 MW (intense fire)
 */
export const FIRMS_FRP_GRADIENT = {
  low: { threshold: 10, color: '#fef3c7' }, // amber-50
  medium: { threshold: 50, color: '#f59e0b' }, // amber-500
  high: { threshold: 100, color: '#dc2626' }, // red-600
  extreme: { threshold: 200, color: '#991b1b' }, // red-800
};

/**
 * EFFIS Fire Weather Index color ramp
 */
export const EFFIS_FWI_COLORS = {
  low: '#22c55e',      // green-500
  moderate: '#f59e0b',  // amber-500
  high: '#ef4444',      // red-500
  extreme: '#7f1d1d',   // red-900
};

/**
 * EFFIS Burned Area color
 */
export const EFFIS_BURNED_AREA_COLOR = '#7f1d1d'; // red-900

/**
 * Get color based on FRP value (for glow effects)
 */
export function getFRPColor(frp: number): string {
  if (frp >= FIRMS_FRP_GRADIENT.extreme.threshold) return FIRMS_FRP_GRADIENT.extreme.color;
  if (frp >= FIRMS_FRP_GRADIENT.high.threshold) return FIRMS_FRP_GRADIENT.high.color;
  if (frp >= FIRMS_FRP_GRADIENT.medium.threshold) return FIRMS_FRP_GRADIENT.medium.color;
  return FIRMS_FRP_GRADIENT.low.color;
}
