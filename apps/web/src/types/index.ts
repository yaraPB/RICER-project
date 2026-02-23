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
  /** Relative humidity 0–100%. Optional — not all weather providers return this field. */
  humidity?: number;
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

export type DetectionSource = 'FIRMS' | 'EFFIS' | 'FIRMS+EFFIS';

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
  source?: DetectionSource;
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

// ============================================
// Vehicle Types
// ============================================

export type VehicleType = 'FIRE_TRUCK' | 'WATER_TANKER' | 'COMMAND' | 'AMBULANCE' | 'HELICOPTER';
export type VehicleStatus = 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING' | 'OUT_OF_SERVICE';

export interface Vehicle {
  id: string;
  callSign: string;
  type: VehicleType;
  status: VehicleStatus;
  capabilities: string[];
  baseLocation?: { type: 'Point'; coordinates: [number, number] };
  location?: { type: 'Point'; coordinates: [number, number] };
  assignedTo?: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoVehicleProps {
  id: string;
  callSign: string;
  type: VehicleType;
  status: VehicleStatus;
  assignedTo?: string;
}

export type GeoVehicle = GeoFeature<GeoVehicleProps>;

// ============================================
// Fire Event Record Types
// ============================================

export type AlertSource = 'FIRMS_SATELLITE' | 'CITIZEN_REPORT' | 'PATROL' | 'PHONE_CALL' | 'RADIO' | 'OTHER';
export type RecordStatus = 'DRAFT' | 'VALIDATED' | 'APPROVED';
export type LockableSection = 'timeline' | 'agencyArrivals' | 'meansEngaged' | 'economicLoss' | 'perimeter';

export interface AgencyArrival {
  agencyName: string;
  arrivedAt: string;
  personnelCount: number;
}

export interface MeansEngaged {
  vehicleCount: number;
  aircraftCount: number;
  personnelCount: number;
  waterVolumeLiters: number;
  retardantVolumeLiters: number;
}

export interface EconomicLoss {
  forestAreaHa: number;
  infrastructureDamage: number;
  agricultureDamage: number;
  otherDamage: number;
  totalEstimate: number;
}

export interface AuditEntry {
  userId: string;
  cin: string;
  action: string;
  section?: string;
  changes?: Record<string, unknown>;
  timestamp: string;
}

export interface FireEventRecord {
  id: string;
  incidentId: string;
  alertSource: AlertSource;
  alertReceivedAt?: string | null;
  verifiedAt?: string | null;
  firstResponseAt?: string | null;
  onSceneAt?: string | null;
  containedAt?: string | null;
  extinguishedAt?: string | null;
  agencyArrivals?: AgencyArrival[] | null;
  meansEngaged?: MeansEngaged | null;
  economicLoss?: EconomicLoss | null;
  burnPerimeter?: { type: 'Polygon'; coordinates: [number, number][][] } | null;
  burnAreaHa?: number | null;
  burnCentroid?: [number, number] | null;
  burnBoundingBox?: [number, number, number, number] | null;
  recordStatus: RecordStatus;
  lockedSections: string[];
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFireRecordInput {
  incidentId: string;
  alertSource?: AlertSource;
}

export interface UpdateFireRecordInput {
  alertSource?: AlertSource;
  alertReceivedAt?: string;
  verifiedAt?: string;
  firstResponseAt?: string;
  onSceneAt?: string;
  containedAt?: string;
  extinguishedAt?: string;
  agencyArrivals?: AgencyArrival[];
  meansEngaged?: MeansEngaged;
  economicLoss?: EconomicLoss;
}
