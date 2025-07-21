// Enums to match backend
export enum RequestStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    CHECKED = 'CHECKED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FULFILLED = 'FULFILLED',
}

export enum NezekStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

// DTOs to match backend
export interface FillDetailsDTO {
    measurement: string;
    amount: string; // Use string for form state
    price: string;  // Use string for form state
}

export interface RequestItemDTO {
    id?: number; // The ID of the RequestItem entity, crucial for updates
    type: string;
    requested: FillDetailsDTO;
    filled: FillDetailsDTO;
    details: string;
}

export interface FuelOilGreaseRequestDTO {
    id?: number;
    requestDate: string;
    carType: string;
    plateNumber: string;
    kmReading: string;
    shortExplanation: string;
    
    // Individual items for easy form binding
    fuel: RequestItemDTO | null;
    motorOil: RequestItemDTO | null;
    brakeFluid: RequestItemDTO | null;
    steeringFluid: RequestItemDTO;
    grease: RequestItemDTO;

    mechanicName: string;
    headMechanicName: string;
    headMechanicApproved: boolean | null; // Maps to ApprovalStatus on backend
    nezekOfficialName: string;
    nezekOfficialStatus: NezekStatus;
    isFulfilled: boolean;
    status: RequestStatus; // The overall status of the request
}

// Expanded Role type to match backend roles
export type Role = 'MECHANIC' | 'HEAD_MECHANIC' | 'NEZEK_OFFICIAL' | 'ADMIN' | 'STORE_KEEPER';