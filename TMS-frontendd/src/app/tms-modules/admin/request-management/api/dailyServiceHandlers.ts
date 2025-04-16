// src/api/dailyServiceHandlers.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/daily-requests';

export interface DailyServiceRequest {
  id?: number;
  dateTime: string; // ISO format with time
  travelers: string[];
  startingPlace: string;
  endingPlace: string;
  claimantName: string;
  driverName?: string;
  startKm?: number;
  endKm?: number;
  kmDifference?: number;
  carType?: string;
  plateNumber?: string;
  status: 'PENDING' | 'COMPLETED' | 'FINISHED';
}

export const DailyServiceApi = {
  async createRequest(requestData: Omit<DailyServiceRequest, 'id'>): Promise<DailyServiceRequest> {
    try {
      const response = await axios.post(API_BASE_URL, requestData);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to create request');
    }
  },

  async getPendingRequests(): Promise<DailyServiceRequest[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/pending`);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch requests');
    }
  },

  async assignRequest(id: number, data: { driverName: string; carType: string; plateNumber: string }): Promise<DailyServiceRequest> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/assign`, {
        ...data,
        status: 'COMPLETED'
      });
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to assign request');
    }
  },

  async completeRequest(id: number, data: { startKm: number; endKm: number }): Promise<DailyServiceRequest> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/complete`, {
        ...data,
        kmDifference: data.endKm - data.startKm,
        status: 'FINISHED'
      });
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to complete request');
    }
  },

  async getDriverRequests(driverName: string): Promise<DailyServiceRequest[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/driver/${encodeURIComponent(driverName)}`);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch driver requests');
    }
  }
};