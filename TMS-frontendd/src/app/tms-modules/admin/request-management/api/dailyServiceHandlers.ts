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
  startingKilometers?: number;
  endingKilometers?: number;
  kmDifference?: number;
  carType?: string;
  plateNumber?: string;
  reason?: string;
  returnDateTime: string; // ISO format with time
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED  ';
}
const parseDates = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Try to parse ISO dates
      const dateMatch = obj[key].match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
      if (dateMatch) {
        obj[key] = dateMatch[0]; // Keep only the date-time part
      }
    } else if (typeof obj[key] === 'object') {
      parseDates(obj[key]);
    }
  }
  return obj;
};

export const DailyServiceApi = {
  async createRequest(requestData: Omit<DailyServiceRequest, 'id'>): Promise<DailyServiceRequest> {
    try {
      const response = await axios.post(`${API_BASE_URL}/create`, requestData);
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
      if (!id) throw new Error('Request ID is required');
      const response = await axios.patch(`${API_BASE_URL}/${id}/assign`, {
        ...data,
        status: 'ASSIGNED'
      });
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to assign request');
    }
  },

  async completeRequest(id: number, data: { startKm: number; endKm: number, reason: string }): Promise<DailyServiceRequest> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/complete`, {
        ...data,
        kmDifference: data.endKm - data.startKm,
        status: 'COMPLETED'
      });
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to complete request');
    }
  },

  async getDriverRequests(assignedDriver?: string): Promise<DailyServiceRequest[]> {
    try {
      const params = assignedDriver ? { params: { assignedDriver, status: 'ASSIGNED' } } : undefined;
      const response = await axios.get(`${API_BASE_URL}/driver`, params);
      return response.data.map((req: any) => ({
        ...parseDates(req),
        travelers: Array.isArray(req.travelers) ? req.travelers : []
      }));
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to load driver requests');
    }
  },
  async getAllCars() {
    return axios.get('http://localhost:8080/auth/car/all');
  },
  
  async getAllOrganizationCars() {
    return axios.get('http://localhost:8080/auth/organization-car/all');
  },
  
  async getAllRentCars() {
    return axios.get('http://localhost:8080/auth/rent-car/all');
  },
};