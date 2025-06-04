export interface FuelRequest {
    id: string;
    serviceNumber: string;
    workLocation: string;
    travelerName: string;
    requiredService: string;
    travelDistance: number;
    vehicleType: string;
    licensePlate: string;
    assignedDriver: string;
    tripExplanation: string;
    requestedFuelAmount: number;
    authorizerName: string;
    accountNumber: string;
    status: 'pending' | 'approved' | 'completed';
    actualStartingDate: Date;
    actualReturnDate: Date;  }
  
  export interface FuelReturn {
    id: string;
    requestId: string;
    serviceDepartment: string;
    serviceNumber: string;
    requiredService: string;
    vehicleType: string;
    licensePlate: string;
    assignedDriver: string;
    departureTime: string;
    returnTime: string;
    dutyTravelKm: number;
    garageKm: number;
    assemblerName: string;
    actualStartingDate: Date;
    actualReturnDate: Date;
  }