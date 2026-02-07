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
