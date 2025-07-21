'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import { FiPlusCircle, FiEye, FiTruck, FiUsers, FiAlertCircle, FiCheckCircle, FiLoader, FiX, FiUserPlus, FiSearch, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import EmployeeAssignment from './components/EmployeeAssignment';

// --- Type Definitions ---
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
  employeeAssignments: any[];
  carType: 'service' | 'rent';
  source: 'Organization' | 'Rented';
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

// --- Helper Functions ---
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

async function fetchEmployeeDetails(employeeId: string): Promise<Employee> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`);
    if (!response.ok) throw new Error(`Failed to fetch employee details for ID: ${employeeId}`);
    return await response.json();
  } catch (err) {
    console.error(`Error fetching details for employee ${employeeId}:`, err);
    // Return a default object so the UI doesn't crash
    return { employeeId, name: 'Unknown Employee', department: 'N/A' };
  }
}

// --- Main Component ---
export default function CarSeatCounterPage() {
  const router = useRouter();
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedCarId, setExpandedCarId] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [sourceCarForTransfer, setSourceCarForTransfer] = useState<CarInfo | null>(null);
  const [destinationCarIdForTransfer, setDestinationCarIdForTransfer] = useState<string | number | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Assignment modal state
  const [selectedCarForAssignment, setSelectedCarForAssignment] = useState<string | number | null>(null);

  // Fetch all cars with their seat information, assigned employees, and route data
  const fetchAllCars = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ...[same fetchAllCars code as before]...
      // Step 1: Fire all API calls in parallel for maximum speed
      const [serviceCarsResponse, rentCarsResponse, assignmentsResponse, routesResponse, rentCarRoutesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/organization-car/service-buses`),
        fetch(`${API_BASE_URL}/auth/rent-car/bus-minibus`),
        fetch(`${API_BASE_URL}/api/employees`),
        fetch(`${API_BASE_URL}/api/routes`),
        fetch(`${API_BASE_URL}/auth/rent-car-routes`),
      ]);
      if (!serviceCarsResponse.ok) throw new Error('Failed to fetch service cars');
      if (!rentCarsResponse.ok) throw new Error('Failed to fetch rent cars');
      if (!assignmentsResponse.ok) throw new Error('Failed to fetch employee assignments');
      if (!routesResponse.ok) throw new Error('Failed to fetch routes');
      if (!rentCarRoutesResponse.ok) throw new Error('Failed to fetch rent car routes');
      const [serviceCarsData, rentCarsData, assignmentsData, routesData, rentCarRoutesData] = await Promise.all([
        serviceCarsResponse.json(),
        rentCarsResponse.json(),
        assignmentsResponse.json(),
        routesResponse.json(),
        rentCarRoutesResponse.json(),
      ]);
      const validAssignments = Array.isArray(assignmentsData) ? assignmentsData : [];
      const validRoutes = Array.isArray(routesData) ? routesData : [];
      const serviceCarPromises = (serviceCarsData.cars || serviceCarsData.organizationCarList || [])
        .filter((car: any) => car.organizationCar?.plateNumber)
        .map(async (carData: any) => {
          const car = carData.organizationCar;
          const totalSeats = car.loadCapacity || 14;
          const assignedEmployeeIds = validAssignments
            .filter((assignment: any) => assignment.assignedCarPlateNumber === car.plateNumber)
            .map((assignment: any) => assignment.employeeId);
          const assignedEmployees = await Promise.all(
            assignedEmployeeIds.map((id: string) => fetchEmployeeDetails(id))
          );
          const carRoute = validRoutes.find((route: any) => route.plateNumber === car.plateNumber);
          let routeInfo = '';
          let destination = '';
          let waypoints: Waypoint[] = [];
          if (carRoute?.waypoints?.length) {
            waypoints = await Promise.all(
              carRoute.waypoints.map(async (wp: any) => ({
                latitude: Number(wp.latitude),
                longitude: Number(wp.longitude),
                name: await fetchLocationName(Number(wp.latitude), Number(wp.longitude)),
              }))
            );
            if (waypoints.length > 0) {
              routeInfo = waypoints.map(wp => wp.name ?? '').join(' → ');
              destination = waypoints[waypoints.length - 1].name || '';
            }
          }
          return {
            id: `service-${car.id}`,
            plateNumber: car.plateNumber,
            model: car.model || 'Unknown Model',
            totalSeats,
            availableSeats: totalSeats - assignedEmployees.length,
            route: routeInfo,
            destination,
            waypoints,
            assignedEmployees,
            carType: 'service' as const,
            employeeAssignments: assignedEmployeeIds,
            source: 'Organization',
          };
        });
      const rawRentCars = (rentCarsData.rentCarList || rentCarsData.rentCars || rentCarsData.busAndMinibusList || []).filter((carData: any) => carData.plateNumber || carData.rentCar?.plateNumber);
      const rentCarPromises = rawRentCars.map(async (carData: any) => {
        const car = carData.rentCar || carData;
        const plateNumber = car.plateNumber;
        let carDestination = 'N/A';
        let waypoints: any[] = [];
        const routeInfo = (rentCarRoutesData || []).find((r: any) =>
          r.plateNumber === plateNumber || r.rentCar?.plateNumber === plateNumber,
        );
        if (routeInfo && routeInfo.waypoints && routeInfo.waypoints.length > 0) {
          waypoints = await Promise.all(
            routeInfo.waypoints.map(async (wp: any) => ({
              latitude: Number(wp.latitude),
              longitude: Number(wp.longitude),
              name: await fetchLocationName(Number(wp.latitude), Number(wp.longitude)),
            })),
          );
          carDestination = waypoints[waypoints.length - 1].name || "N/A";
        }
        const totalSeats = car.numberOfSeats || 0;
        const assignedEmployeeIds = validAssignments
          .filter((assignment: any) => assignment.carType === 'RENT' && assignment.assignedCarPlateNumber === plateNumber)
          .map((assignment: any) => assignment.employeeId);
        const assignedEmployees = await Promise.all(
          assignedEmployeeIds.map((id: string) => fetchEmployeeDetails(id))
        );
        return {
          id: `rent-${car.id}`,
          plateNumber: plateNumber,
          model: car.model,
          totalSeats,
          availableSeats: totalSeats - assignedEmployees.length,
          route: waypoints.length > 0 ? waypoints.map(wp => wp.name ?? "").join(" → ") : "N/A",
          destination: carDestination,
          waypoints,
          assignedEmployees: assignedEmployees,
          carType: 'rent' as const,
          employeeAssignments: assignedEmployeeIds,
          source: 'Rented',
        };
      });
      const resolvedServiceCars = await Promise.all(serviceCarPromises);
      const resolvedRentCars = await Promise.all(rentCarPromises);
      const allCars = [...resolvedServiceCars, ...resolvedRentCars];
      setCars(allCars);
      setFilteredCars(allCars);
    } catch (err: any) {
      console.error("Error fetching and processing car data:", err);
      setError(err.message || "An unexpected error occurred.");
      setCars([]);
      setFilteredCars([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter cars based on search term
  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (lowercasedFilter === '') {
      setFilteredCars(cars);
    } else {
      const filtered = cars.filter(car =>
        car.plateNumber.toLowerCase().includes(lowercasedFilter) ||
        car.destination?.toLowerCase().includes(lowercasedFilter) ||
        car.route?.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredCars(filtered);
    }
  }, [searchTerm, cars]);

  // Fetch data on initial component mount
  useEffect(() => {
    fetchAllCars();
  }, []);

  const toggleCarExpansion = (carId: string | number) => {
    setExpandedCarId(expandedCarId === carId ? null : carId);
  };

  const getRowColorClass = (availableSeats: number) => {
    if (availableSeats <= 0) return 'bg-red-50';
    if (availableSeats <= 2) return 'bg-yellow-50';
    return 'bg-white';
  };

  const getSeatStatusText = (availableSeats: number) => {
    if (availableSeats <= 0) return 'Full';
    if (availableSeats <= 2) return `Only ${availableSeats} left`;
    return 'Available';
  };

  const getSeatStatusColor = (availableSeats: number) => {
    if (availableSeats <= 0) return 'text-red-600';
    if (availableSeats <= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleAddEmployee = (carId: string | number, plateNumber: string) => {
    setSelectedCarForAssignment(carId);
    setShowAssignmentModal(true);
  };

  const handleOpenAssignmentModal = (carId: string | number | null = null) => {
    setSelectedCarForAssignment(carId);
    setShowAssignmentModal(true);
  };

  const handleAssignRoute = (carId: string | number) => {
    router.push(`/tms-modules/admin/car-management/service-route-assign?carId=${carId}`);
  };

  // ---- Transfer Employees Modal Logic ----
  const openTransferModal = (car: CarInfo) => {
    setSourceCarForTransfer(car);
    setDestinationCarIdForTransfer(null);
    setShowTransferModal(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleConfirmTransfer = async () => {
    if (!sourceCarForTransfer || !destinationCarIdForTransfer) {
      setError("Source or destination car is missing for the transfer.");
      return;
    }

    const destinationCar = cars.find(c => c.id === destinationCarIdForTransfer);
    if (!destinationCar) {
      setError("Destination car details could not be found.");
      return;
    }

    setIsTransferring(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // --- THIS IS THE CRITICAL FIX ---
      // Build the payload to match the backend TransferEmployeesRequestDTO.java
      const payload = {
        fromCarPlateNumber: sourceCarForTransfer.plateNumber,
        fromCarType: sourceCarForTransfer.carType === 'service' ? 'ORGANIZATION' : 'RENT',
        toCarPlateNumber: destinationCar.plateNumber,
        toCarType: destinationCar.carType === 'service' ? 'ORGANIZATION' : 'RENT',
      };

      // Add this console.log to see exactly what you're sending
      console.log("Sending transfer request with payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/assignments/transfer-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Try to parse a structured error message from the backend
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Failed to transfer employees.');
        } catch (e) {
          throw new Error(errorText || 'Failed to transfer employees.');
        }
      }

      const successMsg = await response.text();
      setSuccessMessage(successMsg || "Transfer successful!");

      // Close modal and refresh data
      setShowTransferModal(false);
      setSourceCarForTransfer(null);
      setDestinationCarIdForTransfer(null);
      fetchAllCars();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleViewAssignedEmployees = () => {
    router.push('/tms-modules/admin/car-management/service-route-assign/assigned-employees-list');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Transfer Modal */}
      {showTransferModal && sourceCarForTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">Transfer All Employees</h2>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm mb-1 font-medium text-gray-700">Source Car</div>
                <div className="text-gray-700 font-bold">
                  {sourceCarForTransfer.plateNumber} - {sourceCarForTransfer.model} ({sourceCarForTransfer.carType === 'service' ? 'Service' : 'Rent'})
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="destinationCar" className="block text-sm font-medium text-gray-700">
                  Select Destination Car
                </label>
                <select
                  id="destinationCar"
                  value={destinationCarIdForTransfer ?? ''}
                  onChange={e => setDestinationCarIdForTransfer(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a car</option>
                  {cars
                    .filter(car => car.id !== sourceCarForTransfer.id)
                    .map(car => (
                      <option key={car.id} value={car.id}>
                        {car.plateNumber} - {car.model} ({car.carType === 'service' ? 'Service' : 'Rent'})
                      </option>
                    ))}
                </select>
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>
              )}
              {successMessage && (
                <div className="mb-4 p-2 bg-green-100 border border-green-300 text-green-700 rounded">{successMessage}</div>
              )}
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={handleConfirmTransfer}
                disabled={isTransferring || !destinationCarIdForTransfer}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTransferring ? <FiLoader className="animate-spin" /> : "Transfer All Employees"}
              </button>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSourceCarForTransfer(null);
                  setDestinationCarIdForTransfer(null);
                }}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">Employee Assignment</h2>
            </div>
            <div className="p-4">
              <EmployeeAssignment 
              selectedCarId={
               selectedCarForAssignment != null
               ? String(selectedCarForAssignment)
              : undefined
             }
             onAssignmentSuccess={() => {
               setShowAssignmentModal(false);
               setSelectedCarForAssignment(null);
             fetchAllCars();
             }}
             singleCarMode
              />
            </div>
            <div className="flex justify-end p-4 border-t">
              <button 
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedCarForAssignment(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-3xl font-bold text-gray-700">
          Service Car Seat Management
        </h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by plate, destination, or route"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={()=>handleOpenAssignmentModal()}
            className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors text-sm bg-white"
          >
            <FiPlusCircle className="w-12 h-12 p-1 rounded-full text-[#3c8dbc] transition-colors duration-200 hover:bg-[#3c8dbc] hover:text-white" />
            <span className="text-[#3c8dbc] font-medium">Assign Employee</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}     
            onClick={handleViewAssignedEmployees}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm bg-white"
          >
            <FiEye className="w-12 h-12 p-1 rounded-full text-purple-600 transition-colors duration-200 hover:bg-purple-600 hover:text-white" />
            <span className="text-purple-600 font-medium">View Assigned Employees</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAllCars}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors text-sm bg-white disabled:opacity-50"
          >
            {isLoading ? (
              <FiLoader className="w-12 h-12 p-1 rounded-full text-[#3c8dbc] animate-spin" />
            ) : (
              <FiRefreshCw className="w-10 h-10 p-1 rounded-full text-[#3c8dbc] transition-colors duration-200 hover:bg-[#3c8dbc] hover:text-white" />
            )}
          </motion.button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" /> 
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-500 hover:text-red-700"
          >
            <FiX />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <FiCheckCircle className="mr-2" /> 
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)} 
            className="text-green-500 hover:text-green-700"
          >
            <FiX />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <span className="ml-2 text-lg">Loading car seat data...</span>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          {searchTerm ? 'No cars match your search criteria' : 'No service cars found or no assignments made yet.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Seats
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCars.map((car) => (
                <>
                  <tr 
                    key={car.id} 
                    className={`${getRowColorClass(car.availableSeats)} hover:bg-gray-100 cursor-pointer`}
                    onClick={() => toggleCarExpansion(car.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiTruck className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{car.plateNumber}</div>
                          <div className="text-sm text-gray-500">{car.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{car.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{car.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.totalSeats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.assignedEmployees.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.availableSeats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeatStatusColor(car.availableSeats)}`}>
                        {getSeatStatusText(car.availableSeats)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.carType === 'service' ? 'Service' : 'Rent'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.source}
                    </td>
                  </tr>
                  {expandedCarId === car.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-lg flex items-center mb-2">
                              <FiUsers className="mr-2" /> Assigned Employees ({car.assignedEmployees.length})
                            </h4>
                            {car.assignedEmployees.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">No employees assigned</p>
                            ) : (
                              <div className="overflow-y-auto max-h-60">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {car.assignedEmployees.map((employee) => (
                                      <tr key={employee.employeeId}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{employee.employeeId}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            
                            {car.availableSeats > 0 && car.waypoints && car.waypoints.length > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddEmployee(car.id, car.plateNumber);
                                }}
                                className="mt-4 flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:bg-[#367fa9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                style={{ backgroundColor: '#3c8dbc' }}
                              >
                                <FiUserPlus className="mr-2" /> Add New Employee
                              </button>
                            ) : null}
                            {/* Transfer Employees Button */}
                            {car.assignedEmployees.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTransferModal(car);
                                }}
                                className="mt-4 ml-4 flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                <FiUsers className="mr-2" /> Transfer Employees
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-lg flex items-center mb-2">
                              <FiMapPin className="mr-2" /> Route Details 
                            </h4>
                            {car.waypoints && car.waypoints.length > 0 ? (
                              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                <h5 className="font-medium mb-2">Full Route:</h5>
                                <p className="text-sm text-gray-700">{car.route}</p>
                                <h5 className="font-medium mt-4 mb-2">Waypoints:</h5>
                                <div className="overflow-y-auto max-h-40">
                                  <ul className="space-y-2">
                                    {car.waypoints.map((wp, index) => (
                                      <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0 h-5 w-5 text-blue-500 mr-2 mt-0.5">
                                          {index === car.waypoints!.length - 1 ? (
                                            <FiMapPin className="h-full w-full text-red-500" />
                                          ) : (
                                            <span className="block h-full w-full rounded-full bg-blue-100 text-center leading-5">
                                              {index + 1}
                                            </span>
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{wp.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {wp.latitude.toFixed(4)}, {wp.longitude.toFixed(4)}
                                          </p>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                <p className="text-sm text-gray-500 italic mb-4">No route information available</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignRoute(car.id);
                                  }}
                                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  Assign Routes
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function getRawCarId(prefixedId: string | number) {
  if (typeof prefixedId === 'string' && prefixedId.includes('-')) {
    return prefixedId.split('-')[1]; // returns '123' from 'rent-123'
  }
  return prefixedId;
}
