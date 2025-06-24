const API_BASE_URL = 'http://localhost:8080';
const FUEL_REQUEST_API_URL = `${API_BASE_URL}/api/fuel-requests`;

type Role = 'Mechanic' | 'HeadMechanic' | 'NezekOfficial';

export const fetchFuelRequests = async (role: Role) => {
  // Mechanics do not fetch the main list of requests for review.
  if (role === 'Mechanic') return [];

  const params = new URLSearchParams();
  if (role === 'NezekOfficial') {
    params.append('view', 'nezek');
  } else if (role === 'HeadMechanic') {
    params.append('view', 'head-mechanic');
  }
  
  const url = `${FUEL_REQUEST_API_URL}?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (response.status === 403) {
    throw new Error('Access Denied: Insufficient permissions to view requests.');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch fuel requests');
  }
  
  return response.json();
};

export const fetchPendingRequests = async () => {
    const response = await fetch(`${FUEL_REQUEST_API_URL}/pending-fulfillment`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 403) {
        throw new Error('Access Denied: Insufficient permissions to view pending requests.');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending fulfillment requests');
      }
      
      return response.json();
}

// Utility function to check permissions
export const hasPermission = (requiredRoles: Role[], userRole?: Role) => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};