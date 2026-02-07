/**
 * Map utility helper functions
 */

/**
 * Creates a circular SVG icon data URL for map markers
 * @param color - Hex color code for the circle fill
 * @returns Data URL string for use in image sources
 */
export function circleIcon(color: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/></svg>`,
  )}`;
}

/**
 * Type-safe GeoJSON caster for use with map libraries
 * @param fc - Feature collection to cast
 * @returns The feature collection as any type for library compatibility
 */
export function asGeoJSON(fc: unknown): any {
  return fc as any;
}

/**
 * Formats coordinates to a readable string
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted coordinate string
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}
