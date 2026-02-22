/**
 * Map utility helper functions
 */

/**
 * Creates a circular SVG icon data URL for map markers
 * @param color - Hex color code for the circle fill
 * @returns Data URL string for use in image sources
 */
const iconCache = new Map<string, string>();

export function circleIcon(color: string): string {
  let cached = iconCache.get(color);
  if (!cached) {
    cached = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/></svg>`,
    )}`;
    iconCache.set(color, cached);
  }
  return cached;
}

/**
 * Type-safe GeoJSON caster for use with map libraries
 * @param fc - Feature collection to cast
 * @returns The feature collection as any type for library compatibility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asGeoJSON(fc: unknown): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * Converts a hex color string to an RGBA tuple for use with deck.gl layers
 * @param hex - Hex color string (e.g. '#ef4444' or 'ef4444')
 * @param alpha - Alpha channel 0-255 (default 255)
 * @returns [r, g, b, a] tuple
 */
const HEX_RE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export function hexToRgba(hex: string, alpha = 255): [number, number, number, number] {
  const r = HEX_RE.exec(hex);
  return r
    ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16), alpha]
    : [100, 100, 100, alpha];
}
