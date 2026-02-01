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
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  cause: string;
  severity: number;
  status: Status;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
