'use client';
import { useEffect, useState } from 'react';
import { FiTruck, FiUsers, FiMapPin, FiLoader, FiAlertCircle, FiX } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./components/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">
    <FiLoader className="animate-spin text-4xl text-blue-500" />
  </div>
});

type Waypoint = {
  latitude: number;
  longitude: number;
  name?: string;
};

type Employee = {
  employeeId: string;
  name: string;
  department: string;
};

type CarInfo = {
  id: string | number;
  plateNumber: string;
  model: string;
  totalSeats: number;
  availableSeats: number;
  route?: string;
  destination?: string;
  waypoints?: Waypoint[];
  assignedEmployees: Employee[];
  driverName: string;
  carType: 'service' | 'rent';
  source: 'Organization' | 'Rented';
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export default function DriverCarView() {
  const [driverCar, setDriverCar] = useState<CarInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [driverName, setDriverName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const name = parsedUser.name || parsedUser.username || '';
          setDriverName(name);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const fetchDriverCar = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!driverName) throw new Error('Driver name not available');

      const response = await fetch(`${API_BASE_URL}/auth/organization-car/service-buses`);
      if (!response.ok) throw new Error('Failed to fetch service cars');
      
      const data = await response.json();
      const serviceCars = data.cars || [];
      const assignedCar = serviceCars.find((car: any) => 
        car.organizationCar?.driverName?.toLowerCase() === driverName.toLowerCase()
      );

      if (!assignedCar || !assignedCar.organizationCar) {
        throw new Error('No vehicle assigned to you');
      }

      const carData = assignedCar.organizationCar;
      const carInfo: CarInfo = {
        id: carData.id,
        plateNumber: carData.plateNumber,
        model: carData.model || 'Unknown Model',
        totalSeats: carData.loadCapacity || 14,
        availableSeats: carData.loadCapacity || 14,
        driverName: carData.driverName,
        assignedEmployees: [],
        carType: 'service',
        source: 'Organization',
        route: '',
        destination: '',
        waypoints: []
      };

      try {
        const assignmentsResponse = await fetch(`${API_BASE_URL}/api/assignments`);
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          const validAssignments = Array.isArray(assignmentsData) ? assignmentsData : [];
          
          const assignedEmployeeIds = validAssignments
            .filter((assignment: any) => assignment.assignedCarPlateNumber === carInfo.plateNumber)
            .map((assignment: any) => assignment.employeeId);

          const assignedEmployees = await Promise.all(
            assignedEmployeeIds.map((id: string) => fetchEmployeeDetails(id))
          );

          carInfo.assignedEmployees = assignedEmployees;
          carInfo.availableSeats = carInfo.totalSeats - assignedEmployees.length;
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      }

      try {
        const routesResponse = await fetch(`${API_BASE_URL}/api/routes`);
        if (routesResponse.ok) {
          const routesData = await routesResponse.json();
          const validRoutes = Array.isArray(routesData) ? routesData : [];
          
          const carRoute = validRoutes.find((route: any) => 
            route.plateNumber === carInfo.plateNumber
          );

          if (carRoute?.waypoints?.length) {
            const waypoints = await Promise.all(
              carRoute.waypoints.map(async (wp: any) => ({
                latitude: Number(wp.latitude),
                longitude: Number(wp.longitude),
                name: await fetchLocationName(Number(wp.latitude), Number(wp.longitude)),
              }))
            );

            carInfo.waypoints = waypoints;
            carInfo.route = waypoints.map(wp => wp.name ?? '').join(' → ');
            carInfo.destination = waypoints[waypoints.length - 1].name || '';
          }
        }
      } catch (err) {
        console.error('Error fetching routes:', err);
      }

      setDriverCar(carInfo);
    } catch (err: any) {
      console.error("Error fetching driver car data:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (driverName) fetchDriverCar();
  }, [driverName]);

  async function fetchEmployeeDetails(employeeId: string): Promise<Employee> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`);
      if (!response.ok) throw new Error(`Failed to fetch employee details for ID: ${employeeId}`);
      
      const employeeData = await response.json();
      
      // Ensure we always return a valid Employee object
      return {
        employeeId: employeeData.employeeId || employeeId,
        name: employeeData.name || 'Unknown Employee',
        department: employeeData.department || 'N/A'
      };
    } catch (err) {
      console.error(`Error fetching details for employee ${employeeId}:`, err);
      // Return a default object so the UI doesn't crash
      return { 
        employeeId,
        name: 'Unknown Employee',
        department: 'N/A'
      };
    }
  }

  async function fetchLocationName(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
      );
      if (!response.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const data = await response.json();
      return data?.address?.village || data?.address?.town || data?.address?.suburb ||
             data?.address?.city_district || data?.address?.city || data?.display_name ||
             `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <span className="ml-2 text-lg">Loading your vehicle information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-10">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Error Loading Data</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <p className="mt-2 text-xs text-gray-400">Driver: {driverName || 'Not detected'}</p>
        </div>
      </div>
    );
  }

  if (!driverCar) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900">No Vehicle Assigned</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please contact administration to get assigned to a vehicle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">My Assigned Vehicle</h1>
      
      <div className="border rounded-lg overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center">
            <FiTruck className="text-gray-500 mr-4 text-xl" />
            <div>
              <h2 className="font-bold text-lg">{driverCar.plateNumber}</h2>
              <p className="text-gray-600">{driverCar.model} • {driverCar.source}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <span className="font-medium">{driverCar.assignedEmployees.length}</span> / {driverCar.totalSeats} passengers
            </p>
            {driverCar.destination && (
              <p className="text-sm text-gray-500 truncate max-w-xs">
                To: {driverCar.destination}
              </p>
            )}
          </div>
        </div>

             {expanded && (
          <div className="border-t p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-lg flex items-center mb-3">
                <FiUsers className="mr-2" /> Passengers ({driverCar.assignedEmployees.length})
              </h3>
              {driverCar.assignedEmployees.length === 0 ? (
                <p className="text-sm text-gray-500">No passengers assigned</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {driverCar.assignedEmployees.map((emp) => (
                    <div key={emp.employeeId} className="flex items-center p-2 bg-gray-50 rounded">
                      <div className="ml-2">
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.department}</p>
                        <p className="text-xs text-gray-400">{emp.employeeId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-lg flex items-center mb-3">
                <FiMapPin className="mr-2" /> Route
              </h3>
              {driverCar.waypoints?.length ? (
                <div>
                  <div className="space-y-2 mb-4">
                    {driverCar.waypoints.map((wp, i) => (
                      <div key={i} className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-2 text-blue-500">
                          {i === driverCar.waypoints!.length - 1 ? (
                            <FiMapPin className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{i + 1}.</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm">{wp.name}</p>
                          <p className="text-xs text-gray-400">
                            {wp.latitude.toFixed(4)}, {wp.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowRouteMap(true)}
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Full Route Map
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No route assigned</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showRouteMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">Route Map for {driverCar.plateNumber}</h2>
              <button 
                onClick={() => setShowRouteMap(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 flex-grow">
              <LeafletMap plateNumber={driverCar.plateNumber} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}