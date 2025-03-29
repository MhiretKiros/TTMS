// src/app/true-modules/admin/car-management/api/carService.ts
import { Car, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/auth/car'; // Update with your actual backend URL


export interface CarReqRes {
  success: boolean;
  message?: string;
  data: Car | Car[] | null;
}

export const fetchCars = async (): Promise<ApiResponse<Car[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/all`);
    if (!response.ok) throw new Error('Failed to fetch cars');
    const result = await response.json();
    
    return {
      success: result.codStatus === 200,
      data: result.carList || [],
      message: result.message
    };
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch cars'
    };
  }
};

// Keep all other API functions the same...

export const fetchCarById = async (id: number): Promise<{
  codStatus: number;
  message: string;
  car: Car | null;
}> => {
  try {
    const response = await fetch(`http://localhost:8080/auth/car/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching car:', error);
    return {
      codStatus: 500,
      message: 'Failed to fetch car',
      car: null
    };
  }
};
export const createCar = async (carData: Omit<Car, 'id'>): Promise<ApiResponse<Car>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    if (!response.ok) throw new Error('Failed to create car');
    const result: CarReqRes = await response.json();
    return {
      success: result.success,
      data: result.data && typeof result.data === 'object' && !Array.isArray(result.data) 
        ? result.data 
        : {} as Car,
      message: result.message
    };
  } catch (error) {
    console.error('Error creating car:', error);
    return {
      success: false,
      data: {} as Car,
      message: error instanceof Error ? error.message : 'Failed to create car'
    };
  }
};

export const updateCar = async (id: number, carData: Partial<Car>): Promise<ApiResponse<Car>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    if (!response.ok) throw new Error('Failed to update car');
    const result: CarReqRes = await response.json();
    return {
      success: result.success,
      data: result.data && typeof result.data === 'object' && !Array.isArray(result.data) 
        ? result.data 
        : {} as Car,
      message: result.message
    };
  } catch (error) {
    console.error('Error updating car:', error);
    return {
      success: false,
      data: {} as Car,
      message: error instanceof Error ? error.message : 'Failed to update car'
    };
  }
};

export const deleteCar = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete car');
    const result: CarReqRes = await response.json();
    return {
      success: result.success,
      data: null,
      message: result.message
    };
  } catch (error) {
    console.error('Error deleting car:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to delete car'
    };
  }
};

export const searchCars = async (query: string): Promise<ApiResponse<Car[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search cars');
    const result: CarReqRes = await response.json();
    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data : [],
      message: result.message
    };
  } catch (error) {
    console.error('Error searching cars:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to search cars'
    };
  }
};