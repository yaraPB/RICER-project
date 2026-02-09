export type Role = 'CIVILIAN' | 'OFFICIAL';
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  cin: string;
  phone: string;
  role: Role;
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  description: string;
  images: string[];
  status: Status;
  cause?: string;
  incidentId?: string | null;
  incident?: Incident | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export type IncidentStatus = 'VIGILANCE' | 'ALERTE' | 'INTERVENTION' | 'MAITRISE' | 'ETEINT';

export interface Incident {
  id: string;
  location: { type: 'Point'; coordinates: [number, number] };
  cause: string;
  severity: number;
  status: IncidentStatus;
  description?: string;
  reportId?: string | null;
  report?: Report | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncidentInput {
  reportId?: string;
  latitude: number;
  longitude: number;
  cause: string;
  severity: number;
  status?: IncidentStatus;
  description?: string;
}

export interface UpdateIncidentInput {
  status?: IncidentStatus;
  severity?: number;
  description?: string;
}

export type ResourceType = 'TRUCK' | 'AIRCRAFT' | 'PERSONNEL' | 'EQUIPMENT';

export type InfrastructureType = 'WATCHTOWER' | 'WATER_POINT' | 'FIREBREAK' | 'STATION';

export interface GeoFeature<P> {
  type: 'Feature';
  geometry: { type: string; coordinates: unknown };
  properties: P;
}

export interface GeoFeatureCollection<P> {
  type: 'FeatureCollection';
  features: GeoFeature<P>[];
}

export interface GeoIncidentProps {
  id: string;
  cause: string;
  severity: number;
  status: IncidentStatus;
  description?: string;
  createdAt: string;
}

export type GeoIncident = GeoFeature<GeoIncidentProps>;

export interface GeoResourceProps {
  id: string;
  type: ResourceType;
  name: string;
  status: string;
  assignedTo?: string;
}

export type GeoResource = GeoFeature<GeoResourceProps>;

export interface GeoInfrastructureProps {
  id: string;
  type: InfrastructureType;
  name: string;
  status: string;
  description: string;
}

export type GeoInfrastructure = GeoFeature<GeoInfrastructureProps>;

export interface RiskBasinProps {
  id: string;
  name: string;
  riskLevel: number;
  description?: string;
}

export type GeoRiskBasin = GeoFeature<RiskBasinProps>;

export interface Equipment {
  id: string;
  category: string;
  name: string;
  quantity: number;
  condition: string;
  lastMaintenance?: Date;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetardantProduct {
  id: string;
  productName: string;
  acquisitionDate: Date;
  storageLocation: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Infrastructure {
  id: string;
  type: string;
  name: string;
  latitude?: number;
  longitude?: number;
  status: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TruckDeployment {
  id: string;
  truckId: string;
  truckName: string;
  latitude: number;
  longitude: number;
  status: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  timestamp: string;
}

/**
 * NASA FIRMS fire detection from satellite (MODIS/VIIRS)
 * Raw CSV format from FIRMS API
 */
export interface FirmsDetection {
  id: string; // Generated: `${lat},${lon},${acq_time}`
  latitude: number;
  longitude: number;
  brightness: number; // Brightness temperature (Kelvin)
  scan: number; // Pixel size E-W (km)
  track: number; // Pixel size N-S (km)
  acq_date: string; // Acquisition date: YYYY-MM-DD
  acq_time: string; // Acquisition time: HHMM (UTC)
  satellite: string; // e.g., "N" (Suomi-NPP), "T" (Terra), "A" (Aqua)
  instrument: string; // VIIRS or MODIS
  confidence: 'low' | 'nominal' | 'high' | number; // Confidence level (0-100 or category)
  version: string; // Data version
  bright_t31: number; // Brightness temperature channel 31
  frp: number; // Fire Radiative Power (MW) - fire intensity
  daynight: 'D' | 'N'; // Day or night detection
}

/**
 * GeoJSON properties for FIRMS detection visualization
 * Simplified from raw detection for frontend rendering
 */
export interface GeoFirmsDetectionProps {
  id: string;
  brightness: number; // Kelvin
  frp: number; // Fire Radiative Power in MW
  confidence: 'low' | 'nominal' | 'high' | number;
  satellite: string;
  instrument: string;
  acqDateTime: string; // Combined date + time for display (e.g., "2024-02-09 13:45")
  daynight: 'D' | 'N';
  isRecent: boolean; // True if detected within last 12 hours (for pulsing animation)
}

/**
 * GeoJSON Feature for FIRMS detection
 */
export type GeoFirmsDetection = GeoFeature<GeoFirmsDetectionProps>;

/**
 * FIRMS detection cluster properties (for clustered map markers)
 */
export interface FirmsClusterProps {
  cluster: true;
  point_count: number;
  point_count_abbreviated: string;
}
