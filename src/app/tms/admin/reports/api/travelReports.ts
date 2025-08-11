import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const fetchTravelRequests = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/travel-requests/manager`);
    return response.data;
  } catch (error) {
    console.error('Error fetching travel requests:', error);
    throw error;
  }
};

export const fetchDailyServiceRequests = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/daily-requests/pending`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily service requests:', error);
    throw error;
  }
};

export const fetchDriverAssignments = async (driverName?: string) => {
  try {
    const params = driverName ? { params: { driverName } } : undefined;
    const response = await axios.get(`${API_BASE_URL}/api/travel-requests/driver`, params);
    return response.data;
  } catch (error) {
    console.error('Error fetching driver assignments:', error);
    throw error;
  }
};