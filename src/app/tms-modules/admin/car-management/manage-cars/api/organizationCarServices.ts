import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchOrganizationCars = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await axios.get(`${API_URL}/auth/organization-car/all`);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to fetch organization cars',
        data: []
      };
    }

    return {
      success: true,
      message: data.message || 'Organization cars fetched successfully',
      data: data.organizationCarList || data.data || []
    };
  } catch (error) {
    console.error('Error fetching organization cars:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch organization cars',
      data: []
    };
  }
};

export const createOrganizationCar = async (carData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(`${API_URL}/auth/organization-car/register`, carData);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to create organization car',
        data: {}
      };
    }

    return {
      success: true,
      message: data.message || 'Organization car created successfully',
      data: data
    };
  } catch (error) {
    console.error('Error creating organization car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create organization car',
      data: {}
    };
  }
};

export const updateOrganizationCar = async (id: number, carData: any): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put(`${API_URL}/auth/organization-car/update/${id}`, carData);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to update organization car',
        data: {}
      };
    }

    return {
      success: true,
      message: data.message || 'Organization car updated successfully',
      data: data
    };
  } catch (error) {
    console.error('Error updating organization car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update organization car',
      data: {}
    };
  }
};

export const deleteOrganizationCar = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.delete(`${API_URL}/auth/organization-car/delete/${id}`);
    const data = response.data;

    if (response.status !== 200) {
      return {
        success: false,
        message: data.message || 'Failed to delete organization car',
        data: null
      };
    }

    return {
      success: true,
      message: data.message || 'Organization car deleted successfully',
      data: null
    };
  } catch (error) {
    console.error('Error deleting organization car:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete organization car',
      data: null
    };
  }
};


export const fetchOrganizationCarById = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(`${API_URL}/auth/organization-car/${id}`);
    
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: response.data.message || 'Organization car fetched successfully',
        data: response.data.organizationCar // Access nested organizationCar property
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to fetch organization car',
      data: null
    };
  } catch (error: any) {
    console.error('Error fetching organization car:', error);
    return {
      success: false,
      message: error.response?.data?.message || 
              error.message || 
              'Failed to fetch organization car',
      data: null
    };
  }
};

// ... (keep other functions the same)