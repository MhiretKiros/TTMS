// src/api/handlers.ts
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/travel-requests`;

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'|'ENDED'|'ACCEPTED'| 'FINISHED'
 | 'SUCCESED'|'ASSIGNED';
  serviceProviderName?: string;
  assignedCarType?: string;
  assignedDriver?: string;
  driverPhone?: string;
  vehicleDetails?: string;
  startingKilometers?: number;
  endingKilometers?: number;
  kmDifference?: number;
  cargoType?: string;
  cargoWeight?: number;
  numberOfPassengers?: number;
  accountNumber?:string;
  authorizerName?:string;
  assemblerName?:string;
  actualStartingDate?: string;
  actualReturnDate?: string;
  paymentType?: string;
}

// Helper function to parse dates in API responses
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

export const TravelApi = {
  async getRequests(actorType: 'user' | 'manager' | 'corporator'|'distributor' | 'driver'| 'nezek'): Promise<TravelRequest[]> {
    try {
      const endpoint = actorType === 'user' ? '/user' : 
                      actorType === 'manager' ? '/manager' : '/corporator';
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      return response.data.map((req: any) => ({
        ...parseDates(req),
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
        ...parseDates(response.data),
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
      return parseDates(response.data);
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to create request');
    }
  },

  async updateRequestStatus(id: number, status: 'APPROVED' | 'REJECTED'|'ACCEPTED' | 'ENDED'): Promise<TravelRequest> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/status`, null, {
        params: { status }
      });
      return parseDates(response.data);
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to update status');
    }
  },


// In handlers.ts
async getDriverRequests(driverName?: string): Promise<TravelRequest[]> {
  try {
    const params = driverName ? { params: { driverName, status: 'ACCEPTED' } } : undefined;
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


async updateServiceProviderInfo(data: {
  id: number;
  serviceProviderName: string;
  assignedCarType: string;
  assignedDriver: string;
  vehicleDetails: string;
  driverPhone: string;
}): Promise<TravelRequest> {
  try {
    console.log('Making API call to:', `${API_BASE_URL}/${data.id}/service-info`);
    console.log('With data:', data);

    const response = await axios.patch(
      `${API_BASE_URL}/${data.id}/service-info`,
      {
        serviceProviderName: data.serviceProviderName,
        assignedCarType: data.assignedCarType,
        assignedDriver: data.assignedDriver,
        vehicleDetails: data.vehicleDetails,
        driverPhone: data.driverPhone,
        status: 'ASSIGNED' // Ensure status is updated
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || error.message);
    }
    throw new Error('Failed to update service provider info');
  }
},

async fuelRequest(data: {
  id?: number;
  assignedCarType: string;
  authorizerName: string;
  status: 'COMPLETED';
}): Promise<TravelRequest> {
  try {
    if (!data.id) throw new Error('Request ID is required');

    // Convert all number fields from string to number
    const payload = {
      authorizerName: data.authorizerName,
      status: data.status,
    };

    // Debug log
    console.log('Sending completion payload:', payload);

    // Make the request and accept 400 status as potential success
    const response = await axios.post(`${API_BASE_URL}/${data.id}/fuel-request`, payload, {
      validateStatus: (status) => status === 200 || status === 400
    });

    // Debug log
    console.log('Received response:', response);

    // If we have data even with 400, try to proceed
    if (response.data) {
      return parseDates(response.data);
    }

    throw new Error(response.statusText || 'Request completed but with unexpected response');
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(axios.isAxiosError(error) 
      ? error.response?.data?.message || error.message 
      : 'Failed to complete request');
  }
},
  async fuelReturn(data: {
  id?: number;
  assemblerName: string;
  tripExplanation: string;
  status: 'SUCCESED';
}): Promise<TravelRequest> {
  try {
    if (!data.id) throw new Error('Request ID is required');

    // Convert all number fields from string to number
    const payload = {
      assemblerName: data.assemblerName,
      tripExplanation: data.tripExplanation,
      status: data.status,
    };

    // Debug log
    console.log('Sending completion payload:', payload);

    // Make the request and accept 400 status as potential success
    const response = await axios.post(`${API_BASE_URL}/${data.id}/fuel-return`, payload, {
      validateStatus: (status) => status === 200 || status === 400
    });

    // Debug log
    console.log('Received response:', response);

    // If we have data even with 400, try to proceed
    if (response.data) {
      return parseDates(response.data);
    }

    throw new Error(response.statusText || 'Request completed but with unexpected response');
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(axios.isAxiosError(error) 
      ? error.response?.data?.message || error.message 
      : 'Failed to complete request');
  }
},

async completeTrip(data: {
  id: number;
  actualStartingDate: string;
  actualReturnDate: string;
  startingKilometers: number;
  endingKilometers: number;
  cargoType: string;
  cargoWeight: number;
  numberOfPassengers: number;
  assignedDriver: string;
  status: 'FINISHED';
}): Promise<TravelRequest> {
  try {
      const payload = {
          actualStartingDate: this.formatDateTime(data.actualStartingDate),
          actualReturnDate: this.formatDateTime(data.actualReturnDate),
          startingKilometers: data.startingKilometers,
          endingKilometers: data.endingKilometers,
          cargoType: data.cargoType,
          cargoWeight: data.cargoWeight,
          numberOfPassengers: data.numberOfPassengers,
          assignedDriver: data.assignedDriver,
          status: data.status

      };

      const response = await axios.post(
          `${API_BASE_URL}/${data.id}/complete-trip`, 
          payload
      );
      return parseDates(response.data);
  } catch (error) {
      throw new Error(axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Failed to complete trip');
  }
},

  async completeTravelRequest(data: {
    id?: number;
    serviceProviderName: string;
    assignedCarType: string;
    assignedDriver: string;
    vehicleDetails: string;
    actualStartingDate?: string;
    actualReturnDate?: string;
    startingKilometers?: number | string;
    endingKilometers?: number | string;
    cargoType?: string;
    cargoWeight?: number | string;
    numberOfPassengers?: number | string;
  }): Promise<TravelRequest> {
    try {
      if (!data.id) throw new Error('Request ID is required');
  
      // Convert all number fields from string to number
      const payload = {
        serviceProviderName: data.serviceProviderName,
        assignedCarType: data.assignedCarType,
        assignedDriver: data.assignedDriver,
        vehicleDetails: data.vehicleDetails,
        actualStartingDate: data.actualStartingDate ? this.formatDateTime(data.actualStartingDate) : undefined,
        actualReturnDate: data.actualReturnDate ? this.formatDateTime(data.actualReturnDate) : undefined,
        startingKilometers: data.startingKilometers ? Number(data.startingKilometers) : undefined,
        endingKilometers: data.endingKilometers ? Number(data.endingKilometers) : undefined,
        cargoType: data.cargoType,
        cargoWeight: data.cargoWeight ? Number(data.cargoWeight) : undefined,
        numberOfPassengers: data.numberOfPassengers ? Number(data.numberOfPassengers) : undefined,
        status: 'FINISHED'
      };
  
      // Debug log
      console.log('Sending completion payload:', payload);
  
      // Make the request and accept 400 status as potential success
      const response = await axios.post(`${API_BASE_URL}/${data.id}/complete`, payload, {
        validateStatus: (status) => status === 200 || status === 400
      });
  
      // Debug log
      console.log('Received response:', response);
  
      // If we have data even with 400, try to proceed
      if (response.data) {
        return parseDates(response.data);
      }
  
      throw new Error(response.statusText || 'Request completed but with unexpected response');
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to complete request');
    }
  },

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
  },
  // In your TravelApi class
 // Add these to your TravelApi
// Change these methods in the TravelApi object// CORRECT API ENDPOINTS
async getAllCars() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/all`);
},

async getAllOrganizationCars() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/all`);
},

async getAllRentCars() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/all`);
},

updateCarStatus: (plateNumber: string, data: { status: string }) => 
  axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${plateNumber}`, data),

updateOrganizationCarStatus: (plateNumber: string, data: { status: string }) => 
  axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/update/${plateNumber}`, data),

updateRentCarStatus: (plateNumber: string, data: { status: string }) => 
  axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/update/${plateNumber}`, data),
};