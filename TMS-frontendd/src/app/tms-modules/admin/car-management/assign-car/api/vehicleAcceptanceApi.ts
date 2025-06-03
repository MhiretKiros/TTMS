// src/api/vehicleAcceptanceApi.ts
import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
const API_BASE_URLS = 'http://localhost:8080'; // Replace with env var in production
interface ApiResponseError {
  message?: string;
  [key: string]: any;
}

interface ApiError {
  message: string;
  status?: number;
  data?: ApiResponseError;
}

interface VehicleAcceptanceResponse {
  id: string;
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
  assignmentHistoryId?: number;
  createdAt?: string;
  updatedAt?: string;
}

const handleApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    const responseData = error.response.data as ApiResponseError;
    return {
      message: responseData?.message || 'An error occurred',
      status: error.response.status,
      data: responseData,
    };
  } else if (error.request) {
    return {
      message: 'No response received from server',
      status: 500,
    };
  } else {
    return {
      message: error.message || 'An unknown error occurred',
      status: 500,
    };
  }
};

// Use axios.post for creating
export const createVehicleAcceptance = async (
  formData: FormData
): Promise<{ data?: VehicleAcceptanceResponse; error?: ApiError }> => {
  try {
    const response: AxiosResponse<VehicleAcceptanceResponse> = await axios.post(
      `${API_BASE_URL}/vehicle-acceptance`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5000,
      }
    );
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error as AxiosError) };
  }
};

// Use axios.put for updating
export const updateVehicleAcceptance = async (
  id: string,
  formData: FormData
): Promise<{ data?: VehicleAcceptanceResponse; error?: ApiError }> => {
  try {
    const response: AxiosResponse<VehicleAcceptanceResponse> = await axios.put(
      `${API_BASE_URL}/vehicle-acceptance/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5000,
      }
    );
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error as AxiosError) };
  }
};

// Get by assignment ID
export const getVehicleAcceptanceByAssignment = async (
  assignmentId: number
): Promise<{ data?: VehicleAcceptanceResponse; error?: ApiError }> => {
  try {
    const response: AxiosResponse<VehicleAcceptanceResponse> = await axios.get(
      `${API_BASE_URL}/vehicle-acceptance/assignment/${assignmentId}`,
      {
        timeout: 5000,
      }
    );
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error as AxiosError) };
  }
};

// Get by acceptance ID
export const getVehicleAcceptanceById = async (
  id: string
): Promise<{ data?: VehicleAcceptanceResponse; error?: ApiError }> => {
  try {
    const response: AxiosResponse<VehicleAcceptanceResponse> = await axios.get(
      `${API_BASE_URL}/vehicle-acceptance/${id}`,
      {
        timeout: 5000,
      }
    );
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error as AxiosError) };
  }
};



export const updateCarStatus = async (plateNumber: string, status: string) => {
  try {
    const response = await axios.put(`${API_BASE_URLS}/auth/car/status/${plateNumber}`, { status }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update car status');
  }
};

export const updateRentCarStatus = async (plateNumber: string, status: string) => {
  try {
    const response = await axios.put(`${API_BASE_URLS}/auth/rent-car/status/${plateNumber}`, { status }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update rent car status');
  }
};

export const updateAssignmentStatus = async (assignmentId: number, status: string) => {
  try {
    const response = await axios.put(`${API_BASE_URLS}/auth/assignment/status/${assignmentId}`, { status }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update assignment status');
  }
};


export const getLatestVehicleAcceptanceByPlate = async (
  plateNumber: string
): Promise<{ data?: any; error?: ApiError }> => {
  try {
    const response: AxiosResponse = await axios.get(
      `${API_BASE_URL}/vehicle-acceptance/plate/${plateNumber}`,
      { timeout: 5000 }
    );
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error as AxiosError) };
  }
};

// Delete
export const deleteVehicleAcceptance = async (
  id: string
): Promise<{ data?: { success: boolean }; error?: ApiError }> => {
  try {
    const response: AxiosResponse<{ success: boolean }> = await axios.delete(
      `${API_BASE_URL}/vehicle-acceptance/${id}`,
      {
        timeout: 5000,
      }
    );
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error as AxiosError) };
  }
};
