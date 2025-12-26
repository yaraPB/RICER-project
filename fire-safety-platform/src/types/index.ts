export interface User {
  id: string;
  cin: string;
  phone: string;
  role: 'CIVILIAN' | 'OFFICIAL';
  department?: string;
  position?: string;
}

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  cause: FireCause;
  severity: number;
  status: ReportStatus;
  description?: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  description: string;
  images: string[];
  status: ReportStatus;
  cause?: FireCause;
  createdAt: Date;
  user?: User;
}

export interface Equipment {
  id: string;
  category: string;
  name: string;
  quantity: number;
  condition: string;
  lastMaintenance?: Date;
  location?: string;
}

export interface Infrastructure {
  id: string;
  type: string;
  name: string;
  latitude?: number;
  longitude?: number;
  status: string;
  description?: string;
}

export interface TruckDeployment {
  id: string;
  truckId: string;
  truckName: string;
  latitude: number;
  longitude: number;
  status: string;
  assignedTo?: string;
}

export interface RetardantProduct {
  id: string;
  productName: string;
  acquisitionDate: Date;
  storageLocation: string;
  quantity: number;
}

export type FireCause =
  | 'CAMPFIRE_UNATTENDED'
  | 'CIGARETTE'
  | 'AGRICULTURAL_BURNING'
  | 'ELECTRICAL'
  | 'LIGHTNING'
  | 'ARSON'
  | 'EQUIPMENT_MALFUNCTION'
  | 'OTHER'
  | 'UNKNOWN';

export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
}
