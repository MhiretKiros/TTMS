// maintenanceApi.ts
import axios from 'axios';

const API_BASE_URL = '${process.env.NEXT_PUBLIC_API_BASE_URL}/api/maintenance-requests';

export interface MaintenanceRequest {
  id?: number;
  plateNumber: string;
  vehicleType: string;
  reportingDriver: string;
  categoryWorkProcess: string;
  kilometerReading: number;
  defectDetails: string;
  mechanicDiagnosis?: string;
  requestingPersonnel?: string;
  authorizingPersonnel?: string;
  status: 'PENDING' | 'CHECKED' | 'REJECTED' | 'INSPECTION' | 'COMPLETED' | 'APPROVED';
  attachments?: string[];
  carImages?: string[];
  physicalContent?: string[];
  notes?: string[];
  signatures?: Signature[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Signature {
  role: string;
  name: string;
  signature: string;
  date: string;
}

export interface AcceptanceData {
  attachments: string[];
  physicalContent: string[];
  notes: string[];
  requestingPersonnel: string;
  authorizingPersonnel: string;
  signatures: Signature[];
}

export const MaintenanceApi = {
  async getDriverRequests(driverName?: string): Promise<MaintenanceRequest[]> {
    try {
      const url = driverName ? `${API_BASE_URL}/driver?driverName=${driverName}` : `${API_BASE_URL}/driver`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to load driver requests');
    }
  },

  async getDistributorRequests(): Promise<MaintenanceRequest[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/distributor`);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to load distributor requests');
    }
  },

  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance`);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to load maintenance requests');
    }
  },

  async getRequestById(id: number): Promise<MaintenanceRequest> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to load request');
    }
  },

  async createRequest(requestData: Omit<MaintenanceRequest, 'id'>): Promise<MaintenanceRequest> {
    try {
      const response = await axios.post(API_BASE_URL, requestData);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to create request');
    }
  },

  async updateRequest(id: number, requestData: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, requestData);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to update request');
    }
  },

  async updateRequestStatus(id: number, status: 'CHECKED' | 'REJECTED' | 'APPROVED' | 'COMPLETED'): Promise<MaintenanceRequest> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to update status');
    }
  },

   async submitAcceptance(id: number, acceptanceData: AcceptanceData): Promise<MaintenanceRequest> {
    try {
      const response = await axios.post(`${API_BASE_URL}/${id}/acceptance`, acceptanceData);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to submit acceptance');
    }
  },

//   async submitAcceptance(id: number, acceptanceData: {
//     attachments: string[];
//     physicalContent: string[];
//     notes: string[];
//     requestingPersonnel: string;
//     authorizingPersonnel: string;
//   }): Promise<MaintenanceRequest> {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/${id}/acceptance`, acceptanceData);
//       return response.data;
//     } catch (error) {
//       throw new Error(axios.isAxiosError(error) 
//         ? error.response?.data?.message || error.message 
//         : 'Failed to submit acceptance');
//     }
//   },

  async uploadImages(id: number, files: File[]): Promise<MaintenanceRequest> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await axios.post(`${API_BASE_URL}/${id}/upload-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to upload images');
    }
  }
};