// src/app/tms-modules/admin/request-management/api/fuelApi.ts
import { FuelRequest, FuelReturn, TravelRequest } from '../types/fuelTypes';

const API_BASE = '/api';

export const FuelApi = {
  // Fuel Request operations
  getRequests: async (): Promise<FuelRequest[]> => {
    const response = await fetch(`${API_BASE}/fuel/requests`);
    return response.json();
  },
  
  searchRequests: async (query: string): Promise<FuelRequest[]> => {
    const response = await fetch(`${API_BASE}/fuel/requests/search?q=${query}`);
    return response.json();
  },
  
  createRequest: async (data: Omit<FuelRequest, 'id' | 'status' | 'dateRequested'>): Promise<FuelRequest> => {
    const response = await fetch(`${API_BASE}/fuel/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  completeRequest: async (id: string, returnData: Omit<FuelReturn, 'id' | 'dateReturned'>): Promise<{request: FuelRequest, return: FuelReturn}> => {
    const response = await fetch(`${API_BASE}/fuel/requests/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData)
    });
    return response.json();
  },
  
  // Fuel Return operations
  getReturns: async (): Promise<FuelReturn[]> => {
    const response = await fetch(`${API_BASE}/fuel/returns`);
    return response.json();
  }
};

export const TravelApi = {
  getRequestById: async (id: number): Promise<TravelRequest> => {
    const response = await fetch(`${API_BASE}/travel/requests/${id}`);
    return response.json();
  },
  
  searchRequests: async (query: string): Promise<TravelRequest[]> => {
    const response = await fetch(`${API_BASE}/travel/requests/search?q=${query}`);
    return response.json();
  },
  
  getRequests: async (actorType: 'user' | 'manager' | 'corporator'): Promise<TravelRequest[]> => {
    const response = await fetch(`${API_BASE}/travel/requests?actor=${actorType}`);
    return response.json();
  }
};