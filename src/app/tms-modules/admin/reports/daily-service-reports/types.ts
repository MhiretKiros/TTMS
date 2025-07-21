// Add this to your types.ts file
export interface DailyService {
  id: number;
  dateTime: string;
  travelers: string[];
  startingPlace: string;
  endingPlace: string;
  claimantName: string;
  driverName: string;
  startKm: number | null;
  endKm: number | null;
  kmDifference: number | null;
  carType: string;
  plateNumber: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  createdAt: string;
  completedAt: string | null;
}

export interface DailyServiceReportFilters {
  claimantName: string;
  status: string;
  start: string;
  end: string;
  plateNumber?: string;
}