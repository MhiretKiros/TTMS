import axios from 'axios';
import { FieldService } from '../field-searvice-reports/types';
import { DailyService } from '../daily-service-reports/types';

import { types } from 'util';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
    dailyServices?: T[];

}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  dailyServices?: T[];
}

export async function fetchAllDailyServices(): Promise<ApiResponse<DailyService>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/daily-requests/all`);
    
    // Handle different response structures
    const data = response.data?.data || 
                 response.data?.dailyServices || 
                 (Array.isArray(response.data) ? response.data : []);

    return {
      success: true,
      dailyServices: data
    };
  } catch (error) {
    console.error('Error fetching daily services:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch daily services'
    };
  }
}
export async function fetchAllFieldServices(): Promise<{
  success: boolean;
  message?: string;
  fieldServices?: FieldService[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/travel-requests/corporator`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      success: true,
      fieldServices: data
    };
  } catch (error) {
    console.error('Error fetching field services:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch field services',
    };
  }
}


// fetchAllInspections.ts

export async function fetchInspections() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/inspections/get-all`);

    if (response.data && Array.isArray(response.data.inspections)) {
      return {
        success: true,
        inspections: response.data.inspections,
      };
    } else {
      return {
        success: false,
        message: 'Invalid inspections format',
        inspections: [],
      };
    }
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return {
      success: false,
      message: 'Failed to fetch inspections',
      error: axios.isAxiosError(error) && error.message ? error.message : 'Unknown error',
      inspections: [],
    };
  }
}


export const fetchAllCars = async (): Promise<ApiResponse<{
  regularCars: any;
  organizationCars: any;
  rentalCars: any;
}>> => {
  try {
    const [regularCars, orgCars, rentCars] = await Promise.all([
      axios.get(`${API_BASE_URL}/auth/car/all`),
      axios.get(`${API_BASE_URL}/auth/organization-car/all`),
      axios.get(`${API_BASE_URL}/auth/rent-car/all`),
    ]);
    
    return {
      success: true,
      data: {
        regularCars: regularCars.data,
        organizationCars: orgCars.data,
        rentalCars: rentCars.data,
      }
    };
  } catch (error) {
    console.error('Error fetching car data:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch car data'
    };
  }
};

// assignmentReports.ts
// assignmentReports.ts

export async function fetchAssignmentHistories() {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/assignment/all`);
    return {
      success: true,
      message: 'Assignment histories retrieved successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching assignment histories:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Unknown error occurred',
      data: null
    };
  }
}

export const fetchCarAssignments = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/assignment/all`);
    
    // Handle different response structures
    const data = response.data?.data || 
                 response.data?.assignmentHistoryList || 
                 (Array.isArray(response.data) ? response.data : []);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch assignments'
    };
  }
};

export const fetchAssignmentHistory = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/assignment/all`);
    
    // Handle different response structures
    const data = response.data?.data || 
                 response.data?.assignmentHistoryList || 
                 (Array.isArray(response.data) ? response.data : []);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch assignment history'
    };
  }
};