import axios from 'axios';

const API_URL = 'http://localhost:8080/auth/rent-car';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchRentCars = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to fetch rent cars',
        data: []
      };
    }

    return {
      success: true,
      message: data.message || 'Rent cars fetched successfully',
      data: data.rentCarList || data.data || []
    };
  } catch (error) {
    console.error('Error fetching rent cars:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch rent cars',
      data: []
    };
  }
};

export const createRentCar = async (carData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(`${API_URL}/register`, carData);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to create rent car',
        data: {}
      };
    }

    return {
      success: true,
      message: data.message || 'Rent car created successfully',
      data: data
    };
  } catch (error) {
    console.error('Error creating rent car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create rent car',
      data: {}
    };
  }
};

export const updateRentCar = async (id: number, carData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put(`${API_URL}/update/${id}`, carData);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to update rent car',
        data: {}
      };
    }

    return {
      success: true,
      message: data.message || 'Rent car updated successfully',
      data: data
    };
  } catch (error) {
    console.error('Error updating rent car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update rent car',
      data: {}
    };
  }
};

export const deleteRentCar = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${id}`);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to delete rent car',
        data: null
      };
    }

    return {
      success: true,
      message: data.message || 'Rent car deleted successfully',
      data: null
    };
  } catch (error) {
    console.error('Error deleting rent car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete rent car',
      data: null
    };
  }
};

export const fetchRentCarById = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to fetch rent car',
        data: null
      };
    }

    return {
      success: true,
      message: data.message || 'Rent car fetched successfully',
      data: data
    };
  } catch (error) {
    console.error('Error fetching rent car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch rent car',
      data: null
    };
  }
};