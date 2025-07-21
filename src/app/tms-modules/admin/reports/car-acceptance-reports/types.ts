// types.ts
export interface VehicleTransfer {
  transferId: number;
  transferDate: string;
  transferNumber: string;
  assignmentHistoryId: number;
  oldKmReading: number;
  designatedOfficial: string;
  driverName: string;
  transferReason: string;
  oldFuelLiters: string;
  newKmReading: number;
  currentDesignatedOfficial: string;
  newFuelLiters: string;
  verifyingBodyName: string;
  authorizingOfficerName: string;
}

export interface VehicleAcceptance {
  id: number;
  plateNumber: string;
  carType: string;
  km: string;
  inspectionItems: Record<string, boolean>;
  attachments: string[];
  carImages: string[];
  physicalContent: string[];
  notes: string[];
  signatures: {
    role: string;
    name: string;
    signature: string;
    date: string;
  }[];
  createdAt: string;
  updatedAt: string;
  assignmentHistoryId: number | null;
}

export interface CarReportsFilters {
  plateNumber: string;
  start: string;
  end: string;
}