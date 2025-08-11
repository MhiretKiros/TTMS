// src/app/true-modules/admin/car-management/api/carService.ts
import { Car } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchCars = async (): Promise<ApiResponse<Car[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/car/all`);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch cars',
        data: []
      };
    }

    return {
      success: true,
      message: data.message || 'Cars fetched successfully',
      data: data.carList || []
    };
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch cars',
      data: []
    };
  }
};

export const createCar = async (carData: Omit<Car, 'id'>): Promise<ApiResponse<Car>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/car/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to create car',
        data: {} as Car
      };
    }

    return {
      success: true,
      message: data.message || 'Car created successfully',
      data: data
    };
  } catch (error) {
    console.error('Error creating car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create car',
      data: {} as Car
    };
  }
};

export const updateCar = async (id: number, carData: Partial<Car>): Promise<ApiResponse<Car>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/car/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData)
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update car',
        data: {} as Car
      };
    }

    return {
      success: true,
      message: data.message || 'Car updated successfully',
      data: data
    };
  } catch (error) {
    console.error('Error updating car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update car',
      data: {} as Car
    };
  }
};

export const deleteCar = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/car/delete/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to delete car',
        data: null
      };
    }

    return {
      success: true,
      message: data.message || 'Car deleted successfully',
      data: null
    };
  } catch (error) {
    console.error('Error deleting car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete car',
      data: null
    };
  }
};

export const fetchCarById = async (id: number): Promise<{
  codStatus: number;
  message: string;
  car: Car | null;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/car/${id}`);
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
