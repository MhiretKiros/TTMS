// app/vehicle-map/page.tsx
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Types
type LatLngTuple = [number, number];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

type UserRole = 'ADMIN' | 'DISTRIBUTOR' | 'HEAD_OF_DISTRIBUTOR' | 'DRIVER' | 'EMPLOYEE' | 'GUEST';

interface User {
  name: string;
  email: string;
  myUsername: string;
  role: UserRole;
  avatar: string;
}

interface OrganizationCar {
  id?: string;
  organizationCar?: {
    id?: string;
    plateNumber?: string;
    model?: string;
    lat?: string | number;
    lng?: string | number;
    driverName?: string;
    deviceImei?: string;
    status?: string;
  };
}

interface RentCar {
  id?: string;
  plateNumber?: string;
  model?: string;
  lat?: string | number;
  lng?: string | number;
  driverName?: string;
  deviceImei?: string;
  status?: string;
}

interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  status: string;
  position: LatLngTuple;
  type: 'organization' | 'rented';
  model: string;
  distanceFromReference?: number;
  deviceImei?: string;
  original: OrganizationCar | RentCar;
}

// Custom hook for current user
const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          return {
            name: parsedUser.name || "Guest",
            email: parsedUser.email || "guest@example.com",
            myUsername: parsedUser.myUsername || "guest",
            role: (parsedUser.role || "GUEST") as UserRole,
            avatar: parsedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.name || parsedUser.email.split('@')[0])}&background=3c8dbc&color=fff`
          };
        } catch (err) {
          console.error('Failed to parse user data', err);
        }
      }
    }
    return {
      name: "Guest",
      email: "guest@example.com",
      myUsername: "guest",
      role: "GUEST" as UserRole,
      avatar: "https://ui-avatars.com/api/?name=Guest&background=3c8dbc&color=fff"
    };
  });

  return currentUser;
};

// Helper function to calculate distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Map Component
const MapComponent = ({ 
  vehicles, 
  selectedVehicle, 
  center 
}: { 
  vehicles: Vehicle[]; 
  selectedVehicle?: Vehicle; 
  center?: LatLngTuple 
}) => {
  const mapRef = useRef<any>(null);
  const isInitialized = useRef(false);

  // Custom marker icons
  const orgCarIcon = new L.Icon({
    iconUrl: '/images/org-car.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/images/marker-shadow.png',
    shadowSize: [41, 41]
  });

  const rentCarIcon = new L.Icon({
    iconUrl: '/images/rent-car.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/images/marker-shadow.png',
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (selectedVehicle && mapRef.current) {
      mapRef.current.flyTo(selectedVehicle.position, 15);
    } else if (center && mapRef.current && !selectedVehicle) {
      mapRef.current.flyTo(center, 13);
    }
  }, [selectedVehicle, center]);

  // Fix for default marker icons in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/car1.jpeg',
      iconUrl: '/images/car1.jpeg',
      shadowUrl: '/images/car1.jpeg',
    });
  }, []);

  // Ensure map is properly sized after container changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 0);
    }
  }, [selectedVehicle]);

  return (
    <MapContainer
      ref={mapRef}
      center={selectedVehicle?.position || center || [51.505, -0.09]}
      zoom={selectedVehicle ? 15 : 13}
      style={{ height: '100%', width: '100%' }}
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {vehicles.map((vehicle) => (
        <Marker 
          key={vehicle.id} 
          position={vehicle.position}
          icon={vehicle.type === 'organization' ? orgCarIcon : rentCarIcon}
          eventHandlers={{
            click: () => {
              if (mapRef.current) {
                mapRef.current.flyTo(vehicle.position, 15);
              }
            },
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <strong>{vehicle.name}</strong><br />
              Plate: {vehicle.plateNumber}<br />
              Model: {vehicle.model}<br />
              Status: <span className={`${
                vehicle.status === 'Available' ? 'text-green-600' :
                vehicle.status === 'In Use' ? 'text-yellow-600' :
                vehicle.status === 'Maintenance' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {vehicle.status}
              </span><br />
              Type: {vehicle.type === 'organization' ? 'Organization' : 'Rental'}<br />
              {vehicle.distanceFromReference !== undefined && (
                <span>Distance: {vehicle.distanceFromReference.toFixed(2)} km</span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Main Page Component
export default function VehicleMapPage() {
  const currentUser = useCurrentUser();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [mapKey, setMapKey] = useState(Date.now());
  const [employees, setEmployees] = useState<any[]>([]);
  const welloSefer: LatLngTuple = [8.992820, 38.773790];

  // Fetch initial vehicle list (only once)
  const fetchInitialVehicles = async () => {
    try {
      setLoading(true);
      const [orgRes, rentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/organization-car/service-buses`),
        fetch(`${API_BASE_URL}/auth/rent-car/bus-minibus`)
      ]);

      if (!orgRes.ok || !rentRes.ok) {
        throw new Error('Failed to fetch one or more vehicle sources');
      }

      const orgData = await orgRes.json();
      const rentData = await rentRes.json();
      const rentCarList = rentData?.rentCarList || [];

      const orgCars = (orgData.cars || orgData.organizationCarList || []).map((car: any) => {
        const lat = Number(car.organizationCar?.lat || 0);
        const lng = Number(car.organizationCar?.lng || 0);
        return {
          id: car.id || car.organizationCar?.id || Math.random().toString(36).substring(7),
          name: `ORG-${car.organizationCar?.plateNumber || 'N/A'}`,
          plateNumber: car.organizationCar?.plateNumber || 'N/A',
          status: car.organizationCar?.status || 'Unknown',
          position: [lat, lng],
          type: 'organization',
          model: car.organizationCar?.model || 'N/A',
          deviceImei: car.organizationCar?.deviceImei,
          original: {
            id: car.id,
            organizationCar: car.organizationCar
          }
        };
      }).filter((car: Vehicle) => car.plateNumber !== 'N/A');

      const rentCars = rentCarList.map((car: any) => {
        const lat = Number(car.lat || 0);
        const lng = Number(car.lng || 0);
        return {
          id: car.id || Math.random().toString(36).substring(7),
          name: `RENT-${car.plateNumber || 'N/A'}`,
          plateNumber: car.plateNumber || 'N/A',
          status: car.status || 'Unknown',
          position: [lat, lng],
          type: 'rented',
          model: car.model || 'N/A',
          deviceImei: car.deviceImei,
          original: car
        };
      }).filter((car: Vehicle) => car.plateNumber !== 'N/A');

      const allVehicles = [...orgCars, ...rentCars];
      setVehicles(allVehicles);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicle data.');
    } finally {
      setLoading(false);
    }
  };

  // Update vehicle locations and calculate distances
  const updateVehicleLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle-tracking/locations`);
      if (!response.ok) throw new Error('Failed to fetch vehicle locations');
      const locations = await response.json();

      const locationMap = new Map<string, any>();
      locations.forEach((loc: any) => locationMap.set(loc.deviceImei, loc));

      setVehicles(prevVehicles =>
        prevVehicles.map(vehicle => {
          const loc = vehicle.deviceImei ? locationMap.get(vehicle.deviceImei) : null;
          const lat = loc?.latitude ?? vehicle.position[0];
          const lng = loc?.longitude ?? vehicle.position[1];
          const distance = calculateDistance(welloSefer[0], welloSefer[1], lat, lng);

          return {
            ...vehicle,
            position: [lat, lng],
            distanceFromReference: distance,
            status: loc?.vehicleStatus || vehicle.status
          };
        })
      );
    } catch (err) {
      console.error('Error updating vehicle locations:', err);
    }
  };

  // Fetch employees for EMPLOYEE role
  const fetchAssignedEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError('Failed to load employee data');
    }
  };

  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (currentUser.role === 'GUEST') return;

    let socket: WebSocket | null = null;
    let reconnectInterval: NodeJS.Timeout;
    const maxReconnectAttempts = 5;
    let reconnectAttempts = 0;

    const connectWebSocket = () => {
      if (socket) {
        socket.close();
      }

      const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const host = window.location.host;
      const wsUrl = `${protocol}${host}/ws-vehicle-updates`;

      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        socket?.send(JSON.stringify({
          type: 'subscribe',
          userId: currentUser.myUsername,
          role: currentUser.role
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setVehicles(prev => prev.map(vehicle => {
            if (vehicle.deviceImei === data.deviceImei) {
              const distance = calculateDistance(
                welloSefer[0], 
                welloSefer[1], 
                data.latitude, 
                data.longitude
              );
              
              return {
                ...vehicle,
                position: [data.latitude, data.longitude],
                distanceFromReference: distance,
                status: data.vehicleStatus || vehicle.status
              };
            }
            return vehicle;
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${delay}ms...`);
          
          reconnectInterval = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached. Falling back to polling.');
        }
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
      clearTimeout(reconnectInterval);
    };
  }, [currentUser.role, currentUser.myUsername]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialVehicles();
    if (currentUser.role === 'EMPLOYEE') {
      fetchAssignedEmployees();
    }
  }, [currentUser.role]);

  // Set up interval for location updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateVehicleLocations();
    }, 10000); // Update every 10 seconds

    // Initial update
    updateVehicleLocations();

    return () => clearInterval(intervalId);
  }, []);

  // Filter vehicles based on role and search term
  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Role-based filtering
    switch(currentUser.role) {
      case 'DRIVER':
        return result.filter(vehicle => {
          if (vehicle.type === 'organization') {
            return (vehicle.original as OrganizationCar).organizationCar?.driverName === currentUser.name;
          } else {
            return (vehicle.original as RentCar).driverName === currentUser.name;
          }
        });
      
      case 'EMPLOYEE':
        const employee = employees.find(e => e.name === currentUser.name);
        return employee?.assignedCarPlateNumber 
          ? result.filter(v => v.plateNumber === employee.assignedCarPlateNumber)
          : [];
      
      case 'ADMIN':
      case 'DISTRIBUTOR':
      case 'HEAD_OF_DISTRIBUTOR':
        return result;
      
      default:
        return [];
    }
  }, [vehicles, searchTerm, currentUser, employees]);

  const totalOrgVehicles = vehicles.filter(v => v.type === 'organization').length;
  const totalRentVehicles = vehicles.filter(v => v.type === 'rented').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold">Loading vehicle data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 h-full flex flex-col">
      {/* User Info Banner */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center">
        <img 
          src={currentUser.avatar} 
          alt="User avatar" 
          className="w-8 h-8 rounded-full mr-3"
        />
        <div>
          <p className="font-medium">{currentUser.name}</p>
          <p className="text-sm text-gray-600">Role: {currentUser.role}</p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Organization Vehicles</h3>
          <p className="text-2xl font-bold text-blue-600">{totalOrgVehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Rental Vehicles</h3>
          <p className="text-2xl font-bold text-green-600">{totalRentVehicles}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* Left Side - Vehicle List */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search vehicles..."
              className="w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-grow">
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No vehicles found
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredVehicles.map((vehicle) => (
                  <li
                    key={vehicle.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                      selectedVehicle?.id === vehicle.id ? 'bg-blue-100 border border-blue-300' : ''
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{vehicle.name}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          vehicle.status === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : vehicle.status === 'In Use'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {vehicle.type === 'organization' ? 'Org Vehicle' : 'Rental Vehicle'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {vehicle.distanceFromReference !== undefined 
                        ? `${vehicle.distanceFromReference.toFixed(2)} km from Wello Sefer`
                        : 'Distance unknown'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[450px]">
            <MapComponent 
              key={mapKey}
              vehicles={filteredVehicles}
              selectedVehicle={selectedVehicle || undefined}
              center={welloSefer}
            />
          </div>

          {/* Bottom Vehicle Info - Hidden for EMPLOYEE role */}
          {selectedVehicle && currentUser.role !== 'EMPLOYEE' && (
            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Name:</span> {selectedVehicle.name}</p>
                  <p><span className="font-medium">Plate Number:</span> {selectedVehicle.plateNumber}</p>
                  <p><span className="font-medium">Type:</span> {selectedVehicle.type === 'organization' ? 'Organization' : 'Rental'}</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      selectedVehicle.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : selectedVehicle.status === 'In Use'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedVehicle.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p><span className="font-medium">Model:</span> {selectedVehicle.model}</p>
                  <p><span className="font-medium">Location:</span> {selectedVehicle.position.join(', ')}</p>
                  <p>
                    <span className="font-medium">Distance from Wello Sefer:</span> 
                    {selectedVehicle.distanceFromReference !== undefined 
                      ? ` ${selectedVehicle.distanceFromReference.toFixed(2)} km`
                      : ' Unknown'}
                  </p>
                  {selectedVehicle.type === 'organization' ? (
                    <p>
                      <span className="font-medium">Driver:</span> 
                      {(selectedVehicle.original as OrganizationCar).organizationCar?.driverName || 'N/A'}
                    </p>
                  ) : (
                    <p>
                      <span className="font-medium">Driver:</span> 
                      {(selectedVehicle.original as RentCar).driverName || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}