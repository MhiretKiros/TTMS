type Role = 'Mechanic' | 'HeadMechanic' | 'NezekOfficial';

// Fetch requests based on role
export const fetchFuelRequests = async (role: Role, mechanicName?: string) => {
  let url = 'http://localhost:8080/api/fuel-requests';

  if (role === 'Mechanic') {
    // Mechanics fetch only their own requests
    if (!mechanicName) return [];
    url += `/mechanic/${encodeURIComponent(mechanicName)}`;
  } else if (role === 'HeadMechanic') {
    // HeadMechanic sees requests that are pending review (status = PENDING)
    url += '/pending';
  } else if (role === 'NezekOfficial') {
    // NezekOfficial sees requests checked by HeadMechanic (status = CHECKED)
    url += '/checked';
  }

  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch requests');
  return await res.json();
};

// Fetch draft requests (for mechanics to edit their own drafts)
export const fetchDraftRequests = async (mechanicName: string) => {
  const url = `http://localhost:8080/api/fuel-requests/mechanic/${encodeURIComponent(mechanicName)}`;
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch draft requests');
  return await res.json();
};

// Fetch checked requests (for NezekOfficial or Admin)
export const fetchCheckedRequests = async () => {
  const url = `http://localhost:8080/api/fuel-requests/checked`;
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch checked requests');
  return await res.json();
};

// Fetch approved requests (for StoreKeeper or Admin)
export const fetchApprovedRequests = async () => {
  const url = `http://localhost:8080/api/fuel-requests/approved`;
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch approved requests');
  return await res.json();
};

// Utility function to check permissions
export const hasPermission = (requiredRoles: Role[], userRole?: Role) => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

// Head Mechanic review (edit + approve/reject)
export const headMechanicReview = async (id: string | number, data: any) => {
  const url = `http://localhost:8080/api/fuel-requests/${id}/head-mechanic-review`;
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to review as Head Mechanic');
  return await res.json();
};

// Nezek Official review (edit + approve/deny)
export const nezekReview = async (id: string | number, data: any) => {
  const url = `http://localhost:8080/api/fuel-requests/${id}/nezek-review`;
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to review as Nezek Official');
  return await res.json();
};

// Fulfill request (for StoreKeeper or Mechanic after approval)
export const fulfillRequest = async (id: string | number, data: any) => {
  const url = `http://localhost:8080/api/fuel-requests/${id}/fulfill`;
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to fulfill request');
  return await res.json();
};