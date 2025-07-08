'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
// Import the chart component (adjust path if necessary)
import InspectionStatusChart from './InspectionStatusChart';

// --- Define types for detailed inspection results (mirroring backend DTOs) ---
// These might need adjustment based on the exact structure returned by GET /api/inspections/{id}
type ItemConditionDTO = { problem: boolean; severity: string; notes: string; };
type MechanicalInspectionDTO = { engineCondition: boolean; enginePower: boolean; suspension: boolean; brakes: boolean; steering: boolean; gearbox: boolean; mileage: boolean; fuelGauge: boolean; tempGauge: boolean; oilGauge: boolean; };
type BodyInspectionDTO = { bodyCollision: ItemConditionDTO; bodyScratches: ItemConditionDTO; paintCondition: ItemConditionDTO; breakages: ItemConditionDTO; cracks: ItemConditionDTO; };
type InteriorInspectionDTO = { engineExhaust: ItemConditionDTO; seatComfort: ItemConditionDTO; seatFabric: ItemConditionDTO; floorMat: ItemConditionDTO; rearViewMirror: ItemConditionDTO; carTab: ItemConditionDTO; mirrorAdjustment: ItemConditionDTO; doorLock: ItemConditionDTO; ventilationSystem: ItemConditionDTO; dashboardDecoration: ItemConditionDTO; seatBelt: ItemConditionDTO; sunshade: ItemConditionDTO; windowCurtain: ItemConditionDTO; interiorRoof: ItemConditionDTO; carIgnition: ItemConditionDTO; fuelConsumption: ItemConditionDTO; headlights: ItemConditionDTO; rainWiper: ItemConditionDTO; turnSignalLight: ItemConditionDTO; brakeLight: ItemConditionDTO; licensePlateLight: ItemConditionDTO; clock: ItemConditionDTO; rpm: ItemConditionDTO; batteryStatus: ItemConditionDTO; chargingIndicator: ItemConditionDTO; };

interface DetailedInspectionResult {
  id: number;
  inspectionStatus: 'Approved' | 'Rejected' | 'ConditionallyApproved';
  inspectionDate: string;
  inspectorName: string;
  notes?: string;
  // Add more detailed fields as needed from your backend response
  // Example:
  // mechanical?: MechanicalInspectionDTO;
  // body?: BodyInspectionDTO;
  // interior?: InteriorInspectionDTO;
  // bodyScore?: number;
  // interiorScore?: number;
  // serviceStatus?: string;
  // warningMessage?: string;
  // warningDeadline?: string;
  // rejectionReason?: string;
}


type CarType = 'personal' | 'organization' | 'rented';

// Export the Car interface so the chart component can use it
export interface Car {
  id: number;
  plateNumber: string;
  model: string;
  status: string;
  inspected: boolean;
  inspectionResult?: 'Approved' | 'Rejected' | 'ConditionallyApproved'; // Ensure this matches chart logic
  // Common fields
  carType?: string;
  fuelType?: string;
  // Organization car specific
  driverName?: string;
  driverAddress?: string;
  loadCapacity?: number;
  // Rent car specific
  companyName?: string;
  vehiclesUserName?: string;
  rentalPeriod?: string;
  // Personal car specific
  ownerName?: string;
  ownerPhone?: string;
  // Add potential inspection details if available from backend
  inspectionDate?: string; // Basic date from list view
  inspectionNotes?: string; // Basic notes from list view
  latestInspectionId?: number; // <-- ID needed to fetch full details
}

export default function CarInspectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plateNumber = searchParams.get('plateNumber');
  const carTypeParam = searchParams.get('type') as CarType | null;

  const [activeTab, setActiveTab] = useState<CarType>(carTypeParam || 'personal');
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // --- fetchData remains the same ---
  const fetchData = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        let errorBody = null;
        try { errorBody = await response.json(); } catch (e) { /* Ignore */ }
        console.error("API Error Response:", errorBody);
        throw new Error(`HTTP error! status: ${response.status} - ${errorBody?.message || response.statusText}`);
      }
      const data = await response.json();
      console.log("Raw API Data:", data);

      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data.organizationCarList)) return data.organizationCarList; // <-- Make sure this key matches your Java DTO
        if (Array.isArray(data.rentCarList)) return data.rentCarList; // Verify this key
        if (Array.isArray(data.carList)) return data.carList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.content)) return data.content;
        if (data.id) return [data];
      }
      console.warn("Could not find expected array structure in API response.");
      return [];
    } catch (error) {
      console.error(`Error fetching or parsing from ${endpoint}:`, error);
      return [];
    }
  };

  // --- fetchCars remains the same ---
  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = '';
      switch(activeTab) {
        case 'personal': endpoint = '${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/all'; break;
        case 'organization': endpoint = '${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/all'; break;
        case 'rented': endpoint = '${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/all'; break;
      }
      
      const carList = await fetchData(endpoint);
      console.log(`Processed ${activeTab} cars:`, carList);
      if (!Array.isArray(carList)) {
          console.error("fetchData did not return an array!", carList);
          throw new Error("Received invalid data format from API.");
      }
      // Ensure boolean conversion for inspected status if needed
      // IMPORTANT: Ensure backend sends 'latestInspectionId' for inspected cars
      const processedCarList = carList.map(car => ({
        ...car,
        inspected: Boolean(car.inspected) // Explicitly cast/convert if API returns 0/1 or string
      }));
      setCars(processedCarList);
      if (searchTerm.trim()) {
        handleSearch(processedCarList, searchTerm);
      } else {
        setFilteredCars(processedCarList);
      }
    } catch (error) {
      console.error(`Error in fetchCars for ${activeTab}:`, error);
      Swal.fire('Error', `Failed to load ${activeTab} cars. ${error instanceof Error ? error.message : ''}`, 'error');
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]); // Removed handleSearch from dependencies as it uses state directly

  // --- handleSearch remains the same ---
  const handleSearch = (dataSource: Car[] = cars, currentSearchTerm: string = searchTerm) => {
    if (!currentSearchTerm.trim()) {
      setFilteredCars(dataSource); return;
    }
    const filtered = dataSource.filter(car => {
      const searchLower = currentSearchTerm.toLowerCase();
      return (
        car.plateNumber?.toLowerCase().includes(searchLower) ||
        car.model?.toLowerCase().includes(searchLower) ||
        (car.driverName && car.driverName.toLowerCase().includes(searchLower)) ||
        (car.companyName && car.companyName.toLowerCase().includes(searchLower)) ||
        (car.vehiclesUserName && car.vehiclesUserName.toLowerCase().includes(searchLower)) ||
        (car.ownerName && car.ownerName.toLowerCase().includes(searchLower))
      );
    });
    setFilteredCars(filtered);
  };

  // Handle inspect button click (navigates to inspection page)
  const handleInspect = (car: Car) => {
    router.push(`vehicle-inspection/car-inspect?plateNumber=${car.plateNumber}&type=${activeTab}`);
  };

  // --- REMOVED handleShowInspectionResult function ---


  // --- useEffects remain the same ---
  useEffect(() => {
    fetchCars();
  }, [fetchCars]); // fetchCars is memoized with useCallback

  useEffect(() => {
    if (plateNumber && cars.length > 0) {
      const car = cars.find(c => c.plateNumber === plateNumber);
      if (car && !car.inspected) { // Only auto-navigate if not already inspected
         handleInspect(car);
      } else if (car && car.inspected) {
         console.warn(`Car with plate ${plateNumber} is already inspected. Showing list.`);
      } else {
         console.warn(`Car with plate ${plateNumber} not found in the ${activeTab} list.`);
      }
    }
  }, [plateNumber, cars, activeTab, router]); // Added router to dependency array


  // --- getDisplayField remains the same ---
  const getDisplayField = (car: Car) => {
    switch(activeTab) {
      case 'organization': return { label: 'Driver', value: car.driverName || 'N/A' };
      case 'rented': return { label: 'Company/User', value: car.companyName || car.vehiclesUserName || 'N/A' };
      case 'personal': default: return { label: 'Owner', value: car.ownerName || 'N/A' };
    }
  };

  const tableHeaderLabel = getDisplayField({} as Car).label;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section (No changes) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <h1 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Vehicle Inspection Dashboard
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'personal' ? 'Search by plate, model or owner' :
                activeTab === 'organization' ? 'Search by plate, model or driver' :
                'Search by plate, model, company or user'
              }
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Apply search immediately as user types
                  handleSearch(cars, e.target.value);
              }}
              // Removed onKeyDown for Enter as search is immediate
            />
          </div>
          {/* Removed explicit Search button as search is now immediate */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={fetchCars}
            disabled={loading}
            title="Refresh List" // Added title for accessibility
          >
            <FiRefreshCw className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs (No changes) */}
      <div className="flex border-b border-gray-200">
         <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'personal'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Vehicles
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'organization'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('organization')}
        >
          Rented Vehicles
        </button>
        {/* <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'rented'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('rented')}
        >
          Organization Vehicles
        </button> */}
      </div>

      {/* Chart Section (No changes) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white p-4 rounded-xl shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Inspection Status Overview</h2>
        {loading ? (
           <div className="flex justify-center items-center h-[300px]">
             <p className="text-gray-500">Loading chart data...</p>
           </div>
        ) : (
           <InspectionStatusChart cars={filteredCars} />
        )}
      </motion.div>

      {/* Car List Table Section - MODIFIED onClick */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {activeTab === 'personal' ? 'Personal' :
           activeTab === 'organization' ? 'Organization' : 'Rented'} Vehicles
          <span className="text-sm font-normal ml-2">({filteredCars.length} records)</span>
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tableHeaderLabel}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                
                {filteredCars.length > 0 ? (
                  
                  filteredCars.map((car) => {
                    const displayField = getDisplayField(car);
                    
                    return (
                      // MODIFIED onClick and className
                      <tr
                      
                        key={`${activeTab}-${car.id}`}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${car.inspected && car.latestInspectionId ? 'cursor-pointer' : ''}`} // Only make cursor pointer if inspected AND has ID
                        onClick={() => {
                          // <<< Add this console log to check the car data >>>
                          console.log("Clicked car data:", JSON.stringify(car, null, 2));
                          // <<< End of added console log >>>
                          
                          if (car.inspected) {
                            
                            if (car.latestInspectionId) { // Use car.latestInspectionId
                              // --- >>> Determine correct result page based on activeTab <<< ---
                              const resultPagePath = activeTab === 'organization'
                                ? `/tms-modules/admin/car-management/vehicle-inspection/org-result?inspectionId=${car.latestInspectionId}`
                                : `/tms-modules/admin/car-management/vehicle-inspection/result?inspectionId=${car.latestInspectionId}`;
                              router.push(resultPagePath);
                            } else {
                              // Handle case where car is inspected but ID is missing (show alert)
                              Swal.fire('Info', `Inspection details are not available for ${car.plateNumber}. Missing inspection ID.`, 'info');
                              console.warn(`Clicked inspected car ${car.plateNumber} but latestInspectionId is missing.`);
                            }
                          }
                          // If not inspected, do nothing (the button handles navigation)
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.plateNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{displayField.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (car.status?.toLowerCase() === 'active' || car.status?.toLowerCase() === 'available' || car.status?.toLowerCase() === 'inspectedandready') ? 'bg-green-100 text-green-800' : // Added InspectedAndReady
                            (car.status?.toLowerCase() === 'maintenance') ? 'bg-yellow-100 text-yellow-800' :
                            (car.status?.toLowerCase() === 'inactive' || car.status?.toLowerCase() === 'rented' || car.status?.toLowerCase() === 'inspectionrejected') ? 'bg-red-100 text-red-800' : // Added InspectionRejected
                            (car.status?.toLowerCase() === 'pendinginspection') ? 'bg-purple-100 text-purple-800' : // Added PendingInspection
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {car.status || 'Unknown'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {/* The conditional rendering here is already correct */}
                          {!car.inspected ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click handler when clicking button
                                handleInspect(car);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Inspect
                            </button>
                          ) : (
                            // Optionally show text or leave empty when inspected
                            <span className="text-xs text-gray-400 italic">Inspected</span>
                            // Or simply: null
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No vehicles found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
