// app/vehicle-map/page.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { vehicleWebSocket } from './utils/vehicleWebSocket';
import { format, subHours } from 'date-fns';
import { User, Vehicle, VehicleHistoryPoint, UserRole, OrganizationCar, RentCar, VehicleLocationUpdate } from './type';
import MapWrapper from './components/MapWrapper';
import DriverLocationSender from './components/DriverLocationSender';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

type LatLngTuple = [number, number];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

const calculateTotalDistance = (path: VehicleHistoryPoint[]): number => {
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1].position;
    const curr = path[i].position;
    totalDistance += calculateDistance(prev[0], prev[1], curr[0], curr[1]);
  }
  return totalDistance;
};

export default function VehicleMapPage() {
  const currentUser = useCurrentUser();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [mapKey, setMapKey] = useState(Date.now());
  const [employees, setEmployees] = useState<any[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPath, setHistoryPath] = useState<VehicleHistoryPoint[]>([]);
  const [historyTimeRange, setHistoryTimeRange] = useState({
    start: format(subHours(new Date(), 6), "yyyy-MM-dd'T'HH:mm"),
    end: format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });

  const welloSefer: LatLngTuple = [8.992820, 38.773790];

  // Handle WebSocket connection status
  useEffect(() => {
    const unsubscribeStatus = vehicleWebSocket.subscribeToStatus((connected) => {
      setIsWebSocketConnected(connected);
    });

    return () => {
      unsubscribeStatus();
    };
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    const handleVehicleUpdate = (update: VehicleLocationUpdate) => {
      setVehicles(prevVehicles => {
        const updatedVehicles = [...prevVehicles];
        const vehicleIndex = updatedVehicles.findIndex(
          v => v.deviceImei === update.deviceImei
        );

        if (vehicleIndex !== -1) {
          const vehicle = updatedVehicles[vehicleIndex];
          const distance = calculateDistance(
            welloSefer[0], welloSefer[1], 
            update.latitude, update.longitude
          );

          updatedVehicles[vehicleIndex] = {
            ...vehicle,
            position: [update.latitude, update.longitude],
            status: update.vehicleStatus,
            distanceFromReference: distance
          };

          if (selectedVehicle?.deviceImei === update.deviceImei) {
            setSelectedVehicle(updatedVehicles[vehicleIndex]);
          }
        }

        return updatedVehicles;
      });
    };

    const unsubscribe = vehicleWebSocket.subscribe(handleVehicleUpdate);
    vehicleWebSocket.connect();

    return () => {
      unsubscribe();
      vehicleWebSocket.disconnect();
    };
  }, [selectedVehicle]);

  const fetchInitialVehicles = useCallback(async () => {
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

      setVehicles([...orgCars, ...rentCars]);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicle data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignedEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError('Failed to load employee data');
    }
  }, []);

  const fetchVehicleHistory = useCallback(async () => {
  if (!selectedVehicle) return;

  try {
    setHistoryLoading(true);
    const startTime = new Date(historyTimeRange.start).toISOString();
    const endTime = new Date(historyTimeRange.end).toISOString();

    const response = await fetch(
      `${API_BASE_URL}/api/vehicle-tracking/history/${selectedVehicle.id}/between?vehicleType=${selectedVehicle.type}&start=${startTime}&end=${endTime}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle history');
    }

    const data = await response.json();
    const path = data.map((point: any) => ({
      position: [point.latitude, point.longitude] as LatLngTuple,
      timestamp: point.timestamp,
      speed: point.speed,
    }));

    setHistoryPath(path);
  } catch (err) {
    console.error('Error fetching vehicle history:', err);
    setError('Failed to load vehicle history');
    setHistoryPath([]);
  } finally {
    setHistoryLoading(false);
  }
}, [selectedVehicle, historyTimeRange]);


  useEffect(() => {
    fetchInitialVehicles();
    if (currentUser.role === 'EMPLOYEE') {
      fetchAssignedEmployees();
    }
  }, [currentUser.role, fetchInitialVehicles, fetchAssignedEmployees]);

  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowHistoryPanel(true);
    setHistoryTimeRange({
      start: format(subHours(new Date(), 6), "yyyy-MM-dd'T'HH:mm"),
      end: format(new Date(), "yyyy-MM-dd'T'HH:mm")
    });
  };

  const handleHistorySearch = () => {
    fetchVehicleHistory();
  };

  const handleReconnect = () => {
    vehicleWebSocket.connect();
  };

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
      <div className="flex justify-between items-center">
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
        <div className={`px-3 py-1 rounded-full text-sm flex items-center ${
          isWebSocketConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isWebSocketConnected ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Live Tracking: Connected
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Live Tracking: Disconnected
              <button 
                onClick={handleReconnect}
                className="ml-2 text-xs underline"
              >
                Reconnect
              </button>
            </>
          )}
        </div>
      </div>

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

      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
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
                    onClick={() => handleVehicleSelect(vehicle)}
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

        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[450px]">
            <MapWrapper 
              key={mapKey}
              vehicles={filteredVehicles}
              selectedVehicle={selectedVehicle || undefined}
              center={welloSefer}
              historyPath={historyPath}
            />
          </div>

          {showHistoryPanel && selectedVehicle && (
            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Vehicle History</h3>
                <button 
                  onClick={() => setShowHistoryPanel(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-md"
                    value={historyTimeRange.start}
                    onChange={(e) => setHistoryTimeRange(prev => ({
                      ...prev,
                      start: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-md"
                    value={historyTimeRange.end}
                    onChange={(e) => setHistoryTimeRange(prev => ({
                      ...prev,
                      end: e.target.value
                    }))}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleHistorySearch}
                    disabled={historyLoading}
                    className={`w-full p-2 rounded-md text-white ${
                      historyLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {historyLoading ? 'Loading...' : 'View History'}
                  </button>
                </div>
              </div>

              {historyLoading && (
                <div className="text-center py-4">Loading history data...</div>
              )}

              {!historyLoading && historyPath.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Path Summary</h4>
                    <span className="text-sm text-gray-600">
                      {historyPath.length} points
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">Start Time</p>
                      <p className="font-medium">
                        {new Date(historyPath[0].timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">End Time</p>
                      <p className="font-medium">
                        {new Date(historyPath[historyPath.length - 1].timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">Distance Traveled</p>
                      <p className="font-medium">
                        {calculateTotalDistance(historyPath).toFixed(2)} km
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!historyLoading && historyPath.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No history data found for the selected time range
                </div>
              )}
            </div>
          )}

          {selectedVehicle && currentUser.role !== 'EMPLOYEE' && !showHistoryPanel && (
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
              <div className="mt-4">
                <button
                  onClick={() => setShowHistoryPanel(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <DriverLocationSender />
    </div>
  );
}