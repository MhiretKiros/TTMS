export interface Car {
    id: number; 
    plateNumber: string;
    ownerName: string;
    ownerPhone: string;
    model: string;
    carType: 'Minibus' | 'Bus' | 'Sedan' | 'SUV' | 'Truck';
    manufactureYear: string;
    motorCapacity: number;
    kmPerLiter: number;
    totalKm: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    status: 'NOT_INSPECTED' | 'InspectedAndReady' | 'Maintenance' | 'Inactive' | 'APPROVED' | 'Pending'|'Rejected';
    registeredDate: string;
    parkingLocation: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export type CarReqRes = ApiResponse<Car | Car[] | null>;