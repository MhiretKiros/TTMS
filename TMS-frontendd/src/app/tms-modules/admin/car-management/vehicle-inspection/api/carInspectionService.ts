// src/app/tms-modules/vehicle-inspection/api/carInspectionService.ts
import { CarInspectionResultPage } from '../result/page';

const API_BASE_URL = 'http://localhost:8080/api/inspections';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StoredInspectionResult {
  id?: number;
  plateNumber: string;
  inspectorName: string;
  inspection: CarInspectionResultPage;
  notes: string;
  status: 'Approved' | 'Rejected';
  bodyScore: number;
  interiorScore: number;
  inspectionDate: string;
}

export const fetchAllInspections = async (): Promise<ApiResponse<StoredInspectionResult[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-all`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch inspections',
        data: []
      };
    }

    return {
      success: true,
      message: 'Inspections fetched successfully',
      data: data
    };
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch inspections',
      data: []
    };
  }
};

export const fetchInspectionsByCar = async (plateNumber: string): Promise<ApiResponse<StoredInspectionResult[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/by-plate/${encodeURIComponent(plateNumber)}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch car inspections',
        data: []
      };
    }

    return {
      success: true,
      message: 'Car inspections fetched successfully',
      data: data
    };
  } catch (error) {
    console.error('Error fetching car inspections:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch car inspections',
      data: []
    };
  }
};

export const createInspection = async (
  inspectionData: Omit<StoredInspectionResult, 'id'>
): Promise<ApiResponse<StoredInspectionResult>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inspectionData)
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to create inspection',
        data: {} as StoredInspectionResult
      };
    }

    return {
      success: true,
      message: 'Inspection created successfully',
      data: data
    };
  } catch (error) {
    console.error('Error creating inspection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create inspection',
      data: {} as StoredInspectionResult
    };
  }
};

export const updateInspection = async (
  id: number,
  inspectionData: Partial<StoredInspectionResult>
): Promise<ApiResponse<StoredInspectionResult>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inspectionData)
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update inspection',
        data: {} as StoredInspectionResult
      };
    }

    return {
      success: true,
      message: 'Inspection updated successfully',
      data: data
    };
  } catch (error) {
    console.error('Error updating inspection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update inspection',
      data: {} as StoredInspectionResult
    };
  }
};

export const deleteInspection = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to delete inspection',
        data: null
      };
    }

    return {
      success: true,
      message: 'Inspection deleted successfully',
      data: null
    };
  } catch (error) {
    console.error('Error deleting inspection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete inspection',
      data: null
    };
  }
};

export const fetchInspectionById = async (id: number): Promise<{
  codStatus: number;
  message: string;
  inspection: StoredInspectionResult | null;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      codStatus: 200,
      message: 'Inspection fetched successfully',
      inspection: data
    };
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return {
      codStatus: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch inspection',
      inspection: null
    };
  }
};

export const updateCarInspectionStatus = async (
  plateNumber: string,
  inspected: boolean,
  result: 'Approved' | 'Rejected'
): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`http://localhost:8080/auth/car/update-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plateNumber, inspected, result })
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update car inspection status',
        data: null
      };
    }

    return {
      success: true,
      message: 'Car inspection status updated successfully',
      data: null
    };
  } catch (error) {
    console.error('Error updating car inspection status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update car inspection status',
      data: null
    };
  }
};