// types.ts
export interface Car {
    id: number;
    plateNumber: string;
    ownerName: string;
    ownerPhone: string;
    model: string;
    carType: string;
    manufactureYear: number;
    motorCapacity: string;
    kmPerLiter: number;
    totalKm: number;
    fuelType: string;
    status: 'Active' | 'Maintenance' | 'Inactive';
    registeredDate: Date;
    parkingLocation: string;
  }
  
  export interface RentCar {
    id: number;
    plateNumber: string;
    companyName: string;
    rentalStartDate: Date;
    rentalEndDate: Date;
    // Add other rent car properties as needed
  }
  
  export interface AssignmentHistory {
    id: number;
    requestLetterNo: string;
    requestDate: Date;
    requesterName: string;
    rentalType: string;
    position: string;
    department: string;
    phoneNumber: string;
    travelWorkPercentage: string;
    shortNoticePercentage: string;
    mobilityIssue: string;
    gender: string;
    totalPercentage: number;
    car?: Car;
    rentCar?: RentCar;
    assignedDate: Date;
    status: 'Active' | 'Completed' | 'Upcoming';
  }
  
  // Additional types for form handling
  export interface AssignmentFormValues {
    id?: number;
    requestLetterNo: string;
    requesterName: string;
    rentalType: string;
    position: string;
    department: string;
    phoneNumber: string;
    travelWorkPercentage: string;
    shortNoticePercentage: string;
    mobilityIssue: string;
    gender: string;
    carId?: number;
    rentCarId?: number;
    assignedDate: Date;
    status: 'Active' | 'Completed' | 'Upcoming';
  }
  
  // Type for table filters
  export type AssignmentFilter = 'Active' | 'Completed' | 'Upcoming' | null;
  
  // Type for API responses
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
  }