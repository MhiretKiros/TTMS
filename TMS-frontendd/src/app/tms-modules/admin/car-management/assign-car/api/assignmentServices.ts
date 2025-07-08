// api/assignmentServices.ts
import axios from 'axios';
import { API_BASE_URL } from 'D:/my git projects/TMS/TMS-frontendd/src/config';
import { AssignmentHistory, ApiResponse } from '../types';

const BASE_URL = `${API_BASE_URL}/auth/assignment`;

export const fetchAllAssignments = async (): Promise<ApiResponse<AssignmentHistory[]>> => {
  try {
    const response = await axios.get(`${BASE_URL}/all`);
    
    // Handle success response
    if (response.data.codStatus === 200) {
      return {
        success: true,
        data: response.data.assignmentHistoryList
      };
    }
    
    // Handle backend-defined errorsa
    return {
      success: false,
      message: response.data.message || 'Request failed'
    };

  } catch (error) {
    // Handle network/axios errors
    return {
      success: false,
      message: axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to fetch assignments'
    };
  }
};

export const getAssignment = async (id: number): Promise<ApiResponse<AssignmentHistory>> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch assignment');
    }
    const data = await response.json();
    return { success: true, data: data.assignmentHistory };
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch assignment'
    };
  }
};

export const updateAssignmentStatus = async (id: number): Promise<ApiResponse<AssignmentHistory>> => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch assignment');
    }
    const data = await response.json();
    return { success: true, data: data.assignmentHistory };
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch assignment'
    };
  }
};

export const createAssignment = async (request: AssignmentRequest): Promise<ApiResponse<AssignmentHistory>> => {
  try {
    const response = await fetch('/api/auth/car/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create assignment');
    }

    return { success: true, data: data.assignmentHistory };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to create assignment'
    };
  }
};

export const updateAssignment = async (id: number, request: AssignmentRequest): Promise<ApiResponse<AssignmentHistory>> => {
  try {
    const response = await fetch(`${BASE_URL}/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update assignment');
    }

    return { success: true, data: data.assignmentHistory };
  } catch (error) {
    console.error('Error updating assignment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update assignment'
    };
  }
};

export const deleteAssignment = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${BASE_URL}/delete/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete assignment');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete assignment'
    };

  }

  
};
