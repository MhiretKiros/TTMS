// src/app/true-modules/admin/car-management/api/carService.ts
import { Car } from '../types';

const API_BASE_URL = 'http://localhost:8080/auth/car';

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
    const response = await fetch(`${API_BASE_URL}/register`, {
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
    const response = await fetch(`${API_BASE_URL}/update/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      // Attempt to get a more specific error message from the backend
      let errorMessage = `Failed to delete car. HTTP status: ${response.status}`;
      try {
        const errorBodyText = await response.text(); // Get body as text first
        if (errorBodyText) {
            try {
                const jsonData = JSON.parse(errorBodyText); // Try to parse if it's JSON
                errorMessage = jsonData.message || errorBodyText; // Use JSON message or full text
            } catch (jsonParseError) {
                errorMessage = errorBodyText; // Use text if not JSON
            }
        } else if (response.statusText) {
            errorMessage = `Failed to delete car. HTTP status: ${response.status} ${response.statusText}`;
        }
      } catch (e) {
        // Fallback if reading body text fails
        console.error('Error reading error response body during deleteCar:', e);
        errorMessage = `Failed to delete car. HTTP status: ${response.status} ${response.statusText || 'Server error'}`;
      }
      console.error('Server error response during deleteCar:', errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: null
      };
    }

    // Handle successful responses (e.g., 200 OK or 204 No Content)
    let successMessage = 'Car deleted successfully';
    // For DELETE, a 204 No Content is common and means success.
    // A 200 OK might also be returned, possibly with a success message in the body.
    if (response.status === 200 && response.headers.get("content-type")?.includes("application/json")) {
        try {
            const successData = await response.json();
            if (successData && successData.message) {
                successMessage = successData.message;
            }
        } catch (e) {
            console.warn('deleteCar: Response status 200 with JSON content-type, but failed to parse body:', e);
            // Keep default success message
        }
    }
    // If 204 No Content, or 200 without a JSON message, the default successMessage is used.

    return {
      success: true,
      message: successMessage,
      data: null
    };
  } catch (error) {
    console.error('Network or unexpected error in deleteCar:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred while deleting the car.';
    return {
      success: false,
      message: message,
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
