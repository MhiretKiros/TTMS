// EmployeeAssignment.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { FiUser, FiTruck, FiSearch, FiSave, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

type Employee = {
  employeeId: string | number;
  name: string;
  department: string;
};

type Car = {
  id: string; // always prefixed: 'service-1' or 'rent-1'
  plateNumber: string;
  model?: string;
  destination?: string;
  carType: 'service' | 'rent';
};

interface EmployeeCarAssignmentProps {
  selectedCarId?: string;
  onAssignmentSuccess?: () => void;
  singleCarMode?: boolean;
}

export default function EmployeeCarAssignmentPage({
  selectedCarId: initialSelectedCarId = '',
  onAssignmentSuccess,
  singleCarMode = false
}: EmployeeCarAssignmentProps) {
  const [employeeIdToSearch, setEmployeeIdToSearch] = useState('');
  const [foundEmployee, setFoundEmployee] = useState<Employee | null>(null);
  const [isFindingEmployeeById, setIsFindingEmployeeById] = useState(false);
  const [findEmployeeByIdError, setFindEmployeeByIdError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>(initialSelectedCarId);
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [employeeVillageInfo, setEmployeeVillageInfo] = useState('');
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to fetch location name
  async function fetchLocationName(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
      );
      if (!response.ok) throw new Error('Failed to fetch location name');
      const data = await response.json();
      if (data && data.address) {
        return data.address.village || data.address.town || data.address.suburb || data.address.city_district || data.address.city || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  const handleFindEmployeeById = async () => {
    if (!employeeIdToSearch.trim()) {
      setFindEmployeeByIdError("Please enter an Employee ID.");
      return;
    }
    setIsFindingEmployeeById(true);
    setFindEmployeeByIdError(null);
    setFoundEmployee(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeIdToSearch.trim()}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Employee with ID "${employeeIdToSearch.trim()}" not found.`);
        }
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch employee. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch employee. Status: ${response.status}`);
      }
      const employeeData: Employee = await response.json();
      setFoundEmployee(employeeData);
    } catch (err: any) {
      console.error("Error finding employee by ID:", err);
      setFindEmployeeByIdError(err.message || "Failed to find employee.");
    } finally {
      setIsFindingEmployeeById(false);
    }
  };

  // Fetch Serviceable Cars
  useEffect(() => {
    const fetchAllCars = async () => {
      setIsLoadingCars(true);
      setError(null);
      try {
        // Fetch both organization and rent cars
        const [serviceBusesRes, rentCarsRes, assignedRoutesRes, rentCarRoutesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/organization-car/service-buses`),
          fetch(`${API_BASE_URL}/auth/rent-car/bus-minibus`),
          fetch(`${API_BASE_URL}/api/routes`),
          fetch(`${API_BASE_URL}/auth/rent-car-routes`),
        ]);
        if (!serviceBusesRes.ok) throw new Error('Failed to fetch service cars');
        if (!rentCarsRes.ok) throw new Error('Failed to fetch rent cars');
        if (!assignedRoutesRes.ok) throw new Error('Failed to fetch assigned routes');
        if (!rentCarRoutesRes.ok) throw new Error('Failed to fetch rent car routes');

        const [serviceBusesData, rentCarsData, assignedRoutesData, rentCarRoutesData] = await Promise.all([
          serviceBusesRes.json(),
          rentCarsRes.json(),
          assignedRoutesRes.json(),
          rentCarRoutesRes.json(),
        ]);

        // --- Organization cars ---
        let rawServiceBuses = (serviceBusesData.cars || serviceBusesData.organizationCarList || [])
          .filter((bus: any) => bus.organizationCar && bus.organizationCar.plateNumber);

        // --- Rent cars ---
        let rawRentCars = (rentCarsData.rentCarList || rentCarsData.rentCars || rentCarsData.busAndMinibusList || [])
          .filter((car: any) => car.plateNumber);

        // If in single car mode, filter to only the selected car
        if (singleCarMode && initialSelectedCarId) {
          rawServiceBuses = rawServiceBuses.filter((bus: any) => `service-${bus.organizationCar.id}` === initialSelectedCarId);
          rawRentCars = rawRentCars.filter((car: any) => `rent-${car.id}` === initialSelectedCarId);
        }

        // --- Process organization cars ---
        const carsWithDestinationsPromises = rawServiceBuses.map(async (bus: any) => {
          const plateNumber = bus.organizationCar.plateNumber;
          let carDestination = bus.organizationCar.destination || 'N/A';

          const routeInfo = (assignedRoutesData || []).find((r: any) => r.plateNumber === plateNumber);
          if (routeInfo && routeInfo.waypoints && routeInfo.waypoints.length > 0) {
            const lastWaypoint = routeInfo.waypoints[routeInfo.waypoints.length - 1];
            if (lastWaypoint && typeof lastWaypoint.latitude === 'number' && typeof lastWaypoint.longitude === 'number') {
              carDestination = await fetchLocationName(Number(lastWaypoint.latitude), Number(lastWaypoint.longitude));
            }
          }

          return {
            id: `service-${bus.organizationCar.id}`,
            plateNumber: plateNumber,
            model: bus.organizationCar.model,
            destination: carDestination,
            carType: 'service' as const,
          };
        });

        // --- Process rent cars ---
        const rentCarsWithDestinationsPromises = rawRentCars.map(async (car: any) => {
          const plateNumber = car.plateNumber;
          let carDestination = 'N/A';

          const routeInfo = (rentCarRoutesData || []).find((r: any) => r.plateNumber === plateNumber);
          if (routeInfo && routeInfo.waypoints && routeInfo.waypoints.length > 0) {
            const lastWaypoint = routeInfo.waypoints[routeInfo.waypoints.length - 1];
            if (lastWaypoint && typeof lastWaypoint.latitude === 'number' && typeof lastWaypoint.longitude === 'number') {
              carDestination = await fetchLocationName(Number(lastWaypoint.latitude), Number(lastWaypoint.longitude));
            }
          }

          return {
            id: `rent-${car.id}`,
            plateNumber: plateNumber,
            model: car.model,
            destination: carDestination,
            carType: 'rent' as const,
          };
        });

        const orgCars: Car[] = await Promise.all(carsWithDestinationsPromises);
        const rentCars: Car[] = await Promise.all(rentCarsWithDestinationsPromises);

        const allCars = [...orgCars, ...rentCars];
        setCars(allCars);

        // If initialSelectedCarId was provided and exists in the fetched cars, keep it selected
        if (initialSelectedCarId) {
          const carExists = allCars.some(car => car.id === initialSelectedCarId);
          if (carExists) {
            setSelectedCarId(initialSelectedCarId);
          }
        }
      } catch (err: any) {
        console.error("Error fetching cars:", err);
        setError(err.message || "Failed to load cars.");
        setCars([]);
      } finally {
        setIsLoadingCars(false);
      }
    };
    fetchAllCars();
  }, [initialSelectedCarId, singleCarMode]);

  const filteredCars = useMemo(() => {
    if (!carSearchQuery) return cars;
    return cars.filter(car =>
      car.destination?.toLowerCase().includes(carSearchQuery.toLowerCase())
    );
  }, [cars, carSearchQuery]);

  const handleAssign = async () => {
    if (!foundEmployee || !selectedCarId) {
      setError("Please find an employee by ID and select a car.");
      return;
    }
    setIsAssigning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!foundEmployee?.employeeId) {
        throw new Error("Employee details are missing or invalid.");
      }

      const selectedCarObject = cars.find(car => car.id === selectedCarId);
      if (!selectedCarObject) {
        throw new Error("Selected car could not be found. Please select again.");
      }

      // --- CRITICAL: include carType for backend ---
      const payload = {
        employeeId: String(foundEmployee.employeeId),
        carPlateNumber: selectedCarObject.plateNumber,
        villageName: employeeVillageInfo,
        carType: selectedCarObject.carType === 'service' ? 'ORGANIZATION' : 'RENT'
      };

      console.log('Final assignment payload being sent to backend:', payload);

      const response = await fetch(`${API_BASE_URL}/api/employees/assign-car`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Assignment failed. Unknown server error." }));
        throw new Error(errorData.message || `Assignment failed. Status: ${response.status}`);
      }

      const assignmentResult = await response.json();
      setSuccessMessage(`Car successfully assigned to ${assignmentResult.name || foundEmployee.name}.`);

      setFoundEmployee(null);
      setEmployeeIdToSearch('');
      setSelectedCarId(initialSelectedCarId || '');
      setEmployeeVillageInfo('');
      setCarSearchQuery('');

      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
    } catch (err: any) {
      console.error("Assignment error:", err);
      setError(err.message || "An error occurred during assignment.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-3xl font-bold text-gray-700">Assign Car to Employee for Service</h1>
        <button
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => router.push('/tms-modules/admin/car-management/service-route-assign/assigned-employees-list')}
        >
          View Assigned Employees
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
          <FiAlertCircle className="mr-2" /> {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md flex items-center">
          <FiCheckCircle className="mr-2" /> {successMessage}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Employee Selection */}
        <div>
          <label htmlFor="employeeIdSearch" className="block text-sm font-medium text-gray-700 mb-1">
            <FiUser className="inline mr-1" /> Find Employee by ID
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              id="employeeIdSearch"
              placeholder="Enter Employee ID"
              value={employeeIdToSearch}
              onChange={(e) => {
                setEmployeeIdToSearch(e.target.value);
                if (findEmployeeByIdError) setFindEmployeeByIdError(null);
                if (foundEmployee) setFoundEmployee(null);
              }}
              className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isAssigning || isFindingEmployeeById}
              onKeyDown={(e) => e.key === 'Enter' && !isFindingEmployeeById && employeeIdToSearch.trim() && handleFindEmployeeById()}
            />

            <button
              onClick={handleFindEmployeeById}
              disabled={isAssigning || isFindingEmployeeById || !employeeIdToSearch.trim()}
              className="px-3 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isFindingEmployeeById ? <FiLoader className="animate-spin h-4 w-4" /> : <FiSearch className="h-4 w-4" />}
            </button>
          </div>
          {isFindingEmployeeById && <p className="text-xs text-gray-500 mt-1 flex items-center"><FiLoader className="animate-spin mr-1 h-3 w-3" />Searching...</p>}
          {findEmployeeByIdError && <p className="text-xs text-red-600 mt-1 flex items-center"><FiAlertCircle className="mr-1 h-3 w-3" /> {findEmployeeByIdError}</p>}

          {foundEmployee && !isFindingEmployeeById && (
            <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Employee Details</h3>
                <button onClick={() => { setFoundEmployee(null); setEmployeeIdToSearch(''); }} className="text-red-500 hover:text-red-700 text-xs font-semibold">(Clear Selection)</button>
              </div>
              <div>
                <label htmlFor="employeeNameDisplay" className="block text-xs font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  id="employeeNameDisplay"
                  value={foundEmployee.name || ''}
                  disabled
                  className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm"
                />
              </div>
              <div>
                <label htmlFor="employeeDeptDisplay" className="block text-xs font-medium text-gray-600">Department</label>
                <input
                  type="text"
                  id="employeeDeptDisplay"
                  value={foundEmployee.department || ''}
                  disabled
                  className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Car Selection */}
        <div>
          <label htmlFor="car" className="block text-sm font-medium text-gray-700 mb-1">
            <FiTruck className="inline mr-1" /> Search & Select Car
          </label>
          {isLoadingCars ? (
            <div className="flex items-center text-gray-500"><FiLoader className="animate-spin mr-2" />Loading cars...</div>
          ) : (
            <>
              {!singleCarMode && (
                <div className="relative mb-2">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cars by destination..."
                    value={carSearchQuery}
                    onChange={(e) => setCarSearchQuery(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={isAssigning}
                  />
                </div>
              )}
              {filteredCars.length > 0 ? (
                <ul className="border border-gray-300 rounded-md max-h-40 overflow-y-auto mt-1">
                  {filteredCars.map(car => (
                    <li
                      key={car.id}
                      onClick={() => setSelectedCarId(car.id)}
                      className={`p-2 cursor-pointer hover:bg-blue-100 ${selectedCarId === car.id ? 'bg-blue-200' : ''}`}
                    >
                      {car.plateNumber} ({car.destination || 'N/A'})
                    </li>
                  ))}
                </ul>
              ) : carSearchQuery ? (
                <p className="text-gray-500 mt-1 text-sm">No cars found for "{carSearchQuery}".</p>
              ) : (
                <p className="text-gray-500 mt-1 text-sm">No cars available. Type to search or check if service cars are loaded.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Employee Village Info */}
      <div className="mb-6">
        <label htmlFor="villageInfo" className="block text-sm font-medium text-gray-700 mb-1">
          Employee's Village/Area (for reference)
        </label>
        <input
          type="text"
          id="villageInfo"
          value={employeeVillageInfo}
          onChange={(e) => setEmployeeVillageInfo(e.target.value)}
          placeholder="E.g., Bole, CMC, Summit area"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={isAssigning}
        />
      </div>

      {/* Assign Button */}
      <button
        onClick={handleAssign}
        disabled={!foundEmployee || !selectedCarId || isAssigning || isFindingEmployeeById || isLoadingCars}
        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAssigning ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
        {isAssigning ? 'Assigning...' : 'Assign Car to Employee'}
      </button>
    </div>
  );
}