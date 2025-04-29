'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
// Import the chart component (adjust path if necessary)
import InspectionStatusChart from './InspectionStatusChart';

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

  // --- fetchData, fetchCars, handleSearch, handleInspect, useEffects remain the same ---

  // Enhanced data fetcher with error handling
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
        if (Array.isArray(data.organizationCarList)) return data.organizationCarList;
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

  // Fetch all cars based on active tab
  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = '';
      switch(activeTab) {
        case 'personal': endpoint = 'http://localhost:8080/auth/car/all'; break;
        case 'organization': endpoint = 'http://localhost:8080/auth/organization-car/all'; break;
        case 'rented': endpoint = 'http://localhost:8080/auth/rent-car/all'; break;
      }
      const carList = await fetchData(endpoint);
      console.log(`Processed ${activeTab} cars:`, carList);
      if (!Array.isArray(carList)) {
          console.error("fetchData did not return an array!", carList);
          throw new Error("Received invalid data format from API.");
      }
      setCars(carList);
      if (searchTerm.trim()) {
        handleSearch(carList, searchTerm);
      } else {
        setFilteredCars(carList);
      }
    } catch (error) {
      console.error(`Error in fetchCars for ${activeTab}:`, error);
      Swal.fire('Error', `Failed to load ${activeTab} cars. ${error instanceof Error ? error.message : ''}`, 'error');
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  // Handle search
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

  // Handle inspect button click
  const handleInspect = (car: Car) => {
    router.push(`vehicle-inspection/car-inspect?plateNumber=${car.plateNumber}&type=${activeTab}`);
  };
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Handle direct link with plate number
  useEffect(() => {
    if (plateNumber && cars.length > 0) {
      const car = cars.find(c => c.plateNumber === plateNumber);
      if (car) { handleInspect(car); }
      else { console.warn(`Car with plate ${plateNumber} not found in the ${activeTab} list.`); }
    }
  }, [plateNumber, cars, activeTab]);


  // Get the appropriate display field based on car type
  const getDisplayField = (car: Car) => {
    switch(activeTab) {
      case 'organization': return { label: 'Driver', value: car.driverName || 'N/A' };
      case 'rented': return { label: 'Company/User', value: car.companyName || car.vehiclesUserName || 'N/A' };
      case 'personal': default: return { label: 'Owner', value: car.ownerName || 'N/A' };
    }
  };

  // Determine table header based on active tab
  const tableHeaderLabel = getDisplayField({} as Car).label;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <h1 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Vehicle Inspection Dashboard
        </h1>
        {/* Search and Refresh */}
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSearch()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all"
          >
            Search
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={fetchCars}
            disabled={loading}
          >
            <FiRefreshCw className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
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
          Organization Vehicles
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'rented'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('rented')}
        >
          Rented Vehicles
        </button>
      </div>

      {/* Chart Section - Added */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white p-4 rounded-xl shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Inspection Status Overview</h2>
        {loading ? (
           <div className="flex justify-center items-center h-[300px]"> {/* Match chart height */}
             <p className="text-gray-500">Loading chart data...</p>
             {/* Optional: Add a spinner here too */}
             {/* <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div> */}
           </div>
        ) : (
           // Pass the currently filtered cars to the chart
           <InspectionStatusChart cars={filteredCars} />
        )}
      </motion.div>
      {/* End of Chart Section */}

      {/* Car List Table Section */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCars.length > 0 ? (
                  filteredCars.map((car) => {
                    const displayField = getDisplayField(car);
                    return (
                      <motion.tr
                        key={`${activeTab}-${car.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.plateNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{displayField.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (car.status?.toLowerCase() === 'active' || car.status?.toLowerCase() === 'available') ? 'bg-green-100 text-green-800' :
                            (car.status?.toLowerCase() === 'maintenance') ? 'bg-yellow-100 text-yellow-800' :
                            (car.status?.toLowerCase() === 'inactive' || car.status?.toLowerCase() === 'rented') ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {car.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {car.inspected ? (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              car.inspectionResult === 'Approved' ? 'bg-green-100 text-green-800' :
                              car.inspectionResult === 'Rejected' ? 'bg-red-100 text-red-800' :
                              car.inspectionResult === 'ConditionallyApproved' ? 'bg-yellow-100 text-yellow-800' : // Added ConditionallyApproved color
                              'bg-purple-100 text-purple-800' // Default for Pending/Other
                            }`}>
                              {car.inspectionResult || 'Pending'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Not Inspected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleInspect(car)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Inspect
                          </button>
                        </td>
                      </motion.tr>
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
