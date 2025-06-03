// src/types/vehicleAcceptance.ts
export interface VehicleData {
  id?: string;
  plateNumber: string;
  carType: string;
  km: string;
  inspectionItems: Record<string, boolean>;
  attachments: string[];
  carImages: (File | string)[];
  physicalContent: string[];
  notes: string[];
  assignmentHistoryId?: number;
  signatures: Signature[];
}

export interface Signature {
  role: string;
  name: string;
  signature: string;
  date: string;
}

export interface VehicleAcceptanceResponse {
  success: boolean;
  data?: VehicleData;
  error?: string;
}