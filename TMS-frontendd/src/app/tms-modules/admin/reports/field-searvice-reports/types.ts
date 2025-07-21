export interface Traveler {
  id: number;
  name: string;
}

export interface FieldService {
  id: number;
  startingPlace: string;
  destinationPlace: string;
  travelers: Traveler[];
  travelReason: string;
  carType: string;
  travelDistance: number | null;
  startingDate: string;
  returnDate: string;
  department: string;
  jobStatus: string;
  claimantName: string;
  teamLeaderName: string;
  approvement: string | null;
  status: 'PENDING' | 'APPROVED' | 'ASSIGNED' | 'COMPLETED' | 'FINISHED' | 'REJECTED';
  serviceProviderName: string | null;
  assignedCarType: string | null;
  assignedDriver: string | null;
  vehicleDetails: string | null;
  actualStartingDate: string | null;
  actualReturnDate: string | null;
  startingKilometers: number | null;
  endingKilometers: number | null;
  kmDifference: number | null;
  cargoType: string | null;
  cargoWeight: number | null;
  numberOfPassengers: number | null;
  createdAt: string;
  createdBy: string;
  authorizerName: string | null;
  assemblerName: string | null;
  tripExplanation: string | null;
  accountNumber: number | null;
}

export interface FieldServiceReportFilters {
  claimantName: string;
  status: string;
  start: string;
  end: string;
  plateNumber?: string;
  department?: string;  // ✅ Added
  jobStatus?: string;
}