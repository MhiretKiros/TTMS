// src/api/handlers.ts
import axios from 'axios';

const API_BASE_URL = '${process.env.NEXT_PUBLIC_API_BASE_URL}/api/travel-requests';

export interface TravelRequest {
  id?: number;
  startingPlace: string;
  destinationPlace: string;
  travelers: string[];
  travelReason: string;
  carType?: string;
  travelDistance?: number;
  startingDate: string; // ISO format "2025-04-10T09:00:00"
  returnDate?: string;  // ISO format "2025-04-10T18:00:00"
  department: string;
  jobStatus: string;
  claimantName: string;
  teamLeaderName: string;
  approvement?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  serviceProviderName?: string;
  assignedCarType?: string;
  assignedDriver?: string;
  vehicleDetails?: string;
  actualStartingDate?: string;
  actualReturnDate?: string;
  startingKilometers?: number;
  endingKilometers?: number;
  kmDifference?: number;
  cargoType?: string;
  cargoWeight?: number;
  numberOfPassengers?: number;
}

export const TravelApi = {
  async getRequests(actorType: 'user' | 'manager' | 'corporator'): Promise<TravelRequest[]> {
    try {
      const endpoint = actorType === 'user' ? '/user' : 
                      actorType === 'manager' ? '/manager' : '/corporator';
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      return response.data.map((req: any) => ({
        ...req,
        travelers: Array.isArray(req.travelers) ? req.travelers : []
      }));
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to load requests');
    }
  },

  async getRequestById(id: number): Promise<TravelRequest> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return {
        ...response.data,
        travelers: Array.isArray(response.data.travelers) 
          ? response.data.travelers 
          : response.data.travelers ? [response.data.travelers] : []
      };
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to load request');
    }
  },

  async createRequest(requestData: Omit<TravelRequest, 'id'>): Promise<TravelRequest> {
    try {
      const payload = {
        ...requestData,
        startingDate: this.formatDateTime(requestData.startingDate),
        returnDate: requestData.returnDate ? this.formatDateTime(requestData.returnDate) : undefined,
        travelers: requestData.travelers.filter(t => t.trim())
      };
      
      const response = await axios.post(API_BASE_URL, payload);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to create request');
    }
  },

  async updateRequestStatus(id: number, status: 'Approved' | 'Rejected'): Promise<TravelRequest> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/status`, null, {
        params: { status: status.toUpperCase() }
      });
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to update status');
    }
  },

  completeTravelRequest: async (data: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/travel-requests/${data.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      const responseText = await response.text();
  
      if (responseText.startsWith('<!DOCTYPE html>')) {
        throw new Error('Server returned HTML error page. Check the endpoint URL.');
      }
  
      try {
        const json = responseText ? JSON.parse(responseText) : {};
        if (!response.ok) {
          throw new Error(json.error || `Request failed with status ${response.status}`);
        }
        return json;
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
  
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  ,

   formatDateTime(dateString: string): string {
    if (!dateString) return '';
    // If already in ISO format with time, return as-is
    if (dateString.includes('T') && dateString.includes(':')) {
      return dateString;
    }
    // If just date (YYYY-MM-DD), add default time
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return `${dateString}T00:00:00`;
    }
    // Try to parse as date
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString();
  }
};