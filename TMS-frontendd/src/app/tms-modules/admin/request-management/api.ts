// app/tms-modules/admin/request-management/api.ts
"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  codStatus: number;
  message: string;
  error: string | null;
  travelRequest?: T;
  travelRequestList?: T[];
}

// Updated Travel Request API functions
export const fetchTravelRequests = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/travel-requests/all`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching travel requests:', error);
    throw new Error('Failed to fetch travel requests');
  }
};

export const fetchTravelRequestById = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/travel-requests/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Ensure the response matches the expected structure
    if (!data.travelRequest) {
      throw new Error('Invalid response structure');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching travel request ${id}:`, error);
    throw new Error('Failed to fetch travel request');
  }
};

export const assignCarToTravelRequest = async (
  requestId: number, 
  carPlateNumber: string, 
  driver?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/travel-requests/${requestId}/assign-car`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assignedCar: carPlateNumber,
        driverName: driver,
        status: 'Approved'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error assigning car:', error);
    throw new Error('Failed to assign car');
  }
};