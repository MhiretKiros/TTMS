 
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface TravelRequestData {
  id?: number;
  startingPlace: string;
  destinationPlace: string;
  travelerName: string;
  travelReason: string;
  carType?: string;
  travelDistance?: number;
  startingDate: string;
  returnDate?: string;
  department: string;
  jobStatus: string;
  claimantName: string;
  teamLeaderName: string;
  approvement?: string;
}

export const TravelApi = {
  // Create or Update a travel request
  async saveTravelRequest(data: TravelRequestData): Promise<TravelRequestData> {
    try {
      const url = data.id ? `/travel-requests/${data.id}` : '/travel-requests';
      const method = data.id ? 'put' : 'post';
      
      const response = await api[method](url, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to save travel request');
      } else {
        throw new Error('Network error. Please try again later.');
      }
    }
  },

  // Get a single travel request by ID
  async getTravelRequestById(id: number): Promise<TravelRequestData> {
    try {
      const response = await api.get(`/travel-requests/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch travel request');
    }
  }
};