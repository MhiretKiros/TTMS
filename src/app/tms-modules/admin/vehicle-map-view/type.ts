// types/index.ts
export type LatLngTuple = [number, number];

// types/user.ts
export type UserRole = 'ADMIN' | 'DISTRIBUTOR' | 'HEAD_OF_DISTRIBUTOR' | 'DRIVER' | 'EMPLOYEE' | 'GUEST';

export interface User {
  name: string;
  email: string;
  myUsername: string;
  role: UserRole;
  avatar: string;
}
export type OrganizationCar = {
  id?: string;
  organizationCar?: {
    id?: string;
    plateNumber?: string;
    model?: string;
    lat?: string | number;
    lng?: string | number;
  };
};

export type RentCar = {
  id?: string;
  plateNumber?: string;
  model?: string;
  lat?: string | number;
  lng?: string | number;
};

export type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  status: string;
  position: LatLngTuple;
  type: 'organization' | 'rented';
  model: string;
  distanceFromReference?: number;
  original: OrganizationCar | RentCar;
};

// export type Vehicle = {
//   id: string;
//   name: string;
//   plateNumber: string;
//   status: "Available" | "In Use" | "Maintenance";
//   position: [number, number]; // [lat, lng]
//   type: "organization" | "rented";
//   model: string;
//   speed?: number; // km/h (for simulation)
//   heading?: number; // 0-359 degrees (for simulation)
//   distanceFromReference?: number;
// };