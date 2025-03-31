// src/app/true-modules/admin/car-management/types.ts
export interface Car {
    id: number; // Changed from string to number to match your backend
    plateNumber: string;
    ownerName: string;
    ownerPhone: string;
    model: string;
    carType: 'Minibus' | 'Bus' | 'Sedan' | 'SUV' | 'Truck';
    manufactureYear: string;
    motorCapacity: string;
    kmPerLiter: string;
    totalKm: string;
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    status: 'Active' | 'Maintenance' | 'Inactive';
    registeredDate: string;
    parkingLocation: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface CarReqRes {
    success: boolean;
    message?: string;
    data: Car | Car[] | null;
  }