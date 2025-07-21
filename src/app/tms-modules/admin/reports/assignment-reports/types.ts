// types.ts
export interface CarAssignmentFilters {
  plateNumber: string;
  status: string;
  position: string;
  start?: string;
  end?: string;
}

export interface AssignmentHistory {
  id: number;
  requestLetterNo: string;
  requestDate: string;
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
  status: string;
  plateNumber: string;
  numberOfCar: string | null;
  model: string | null;
  car: any | null;
  rentCar: any | null;
  assignedDate: string;
  multipleCars: any[];
  multipleRentCars: any[];
  allPlateNumbers: string;
  allCarModels: string;
}

export interface WeeklyData {
  week: string;
  count: number;
  dateRange: string;
}