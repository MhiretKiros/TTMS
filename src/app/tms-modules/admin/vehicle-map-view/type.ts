// types/index.ts
export type UserRole = 'ADMIN' | 'DISTRIBUTOR' | 'HEAD_OF_DISTRIBUTOR' | 'DRIVER' | 'EMPLOYEE' | 'GUEST';

export interface User {
  name: string;
  email: string;
  myUsername: string;
  role: UserRole;
  avatar: string;
}

export interface OrganizationCar {
  id?: string;
  organizationCar?: {
    id?: string;
    plateNumber?: string;
    model?: string;
    lat?: string | number;
    lng?: string | number;
    driverName?: string;
    deviceImei?: string;
    status?: string;
  };
}

export interface RentCar {
  id?: string;
  plateNumber?: string;
  model?: string;
  lat?: string | number;
  lng?: string | number;
  driverName?: string;
  deviceImei?: string;
  status?: string;
}

export type LatLngTuple = [number, number];

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  status: string;
  position: LatLngTuple;
  type: 'organization' | 'rented';
  model: string;
  distanceFromReference?: number;
  deviceImei?: string;
  original: OrganizationCar | RentCar;
}

export interface VehicleHistoryPoint {
  position: LatLngTuple;
  timestamp: string;
  speed?: number;
}

export interface VehicleLocationUpdate {
  vehicleId: string;
  vehicleType: string;
  plateNumber: string;
  driverName: string;
  vehicleModel: string;
  vehicleStatus: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  deviceImei: string;
}