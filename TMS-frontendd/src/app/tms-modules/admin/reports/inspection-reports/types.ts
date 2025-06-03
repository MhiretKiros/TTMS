// types.ts
export interface InspectionReportFilters {
  plateNumber: string;
  status: string;
  start?: string;
  end?: string;
}

export interface Inspection {
  id: number;
  plateNumber: string;
  inspectionDate: string;
  inspectorName: string;
  inspectionStatus: string;
  serviceStatus: string;
  bodyScore: number;
  interiorScore: number;
  notes: string;
  mechanical: {
    engineCondition: boolean;
    enginePower: boolean;
    suspension: boolean;
    brakes: boolean;
    steering: boolean;
    gearbox: boolean;
    mileage: boolean;
    fuelGauge: boolean;
    tempGauge: boolean;
    oilGauge: boolean;
  };
  body: {
    bodyCollision: { problem: boolean; severity: string; notes: string };
    bodyScratches: { problem: boolean; severity: string; notes: string };
    paintCondition: { problem: boolean; severity: string; notes: string };
    breakages: { problem: boolean; severity: string; notes: string };
    cracks: { problem: boolean; severity: string; notes: string };
  };
  interior: {
    [key: string]: { problem: boolean; severity: string; notes: string };
  };
}