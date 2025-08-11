export interface CarReportFilters {
  carType: string;
  status: string;
  model: string;
  start?: string;
  end?: string;
}

export interface Car {
  id: string | number;
  plateNumber: string;
  carType: string;
  model: string;
  manufactureYear: string | number;
  status: string;
  fuelType: string;
  parkingLocation: string;
  inspected: boolean;
  registeredDate: string;
  createdAt?: string;
  createdBy?: string;
  ownerName?: string;
  ownerPhone?: string;
  motorCapacity?: string;
  kmPerLiter?: number;
  totalKm?: string;
  color?: string;
  companyName?: string;
  frameNo?: string;
  motorNumber?: string;
  cc?: string;
  transmission?: string;
  km?: string;
  dateOfIn?: string;
  dateOfOut?: string;
  driverName?: string;
  driverAttributes?: string;
  driverAddress?: string;
  loadCapacity?: string;
}