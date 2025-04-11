'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

type CarType = 'personal' | 'organization' | 'rented';

interface Car {
  id: number;
  plateNumber: string;
  model: string;
  status: string;
  inspected: boolean;
  inspectionResult?: 'Approved' | 'Rejected';
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

interface InspectionResult {
  id: number;
  carId: number;
  carType: CarType;
  inspectorName: string;
  inspectionDate: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  notes: string;
  bodyScore: number;
  interiorScore: number;
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
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>([]);
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Enhanced data fetcher with error handling
  const fetchData = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.carList)) return data.carList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.content)) return data.content;
        // If single car object, wrap in array
        if (data.id) return [data];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return [];
    }
  };

  // Fetch all cars based on active tab
  const fetchCars = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch(activeTab) {
        case 'personal':
          endpoint = 'http://localhost:8080/auth/car/all';
          break;
        case 'organization':
          endpoint = 'http://localhost:8080/auth/organization-car/all';
          break;
        case 'rented':
          endpoint = 'http://localhost:8080/auth/rent-car/all';
          break;
      }

      const carList = await fetchData(endpoint);
      console.log(`Fetched ${activeTab} cars:`, carList);
      
      setCars(carList);
      setFilteredCars(carList);
    } catch (error) {
      console.error(`Error fetching ${activeTab} cars:`, error);
      Swal.fire('Error', `Failed to load ${activeTab} cars`, 'error');
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch inspection history for a car
  const fetchInspectionHistory = async (carId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/auth/inspections?carId=${carId}&carType=${activeTab}`);
      if (!response.ok) throw new Error('Failed to fetch inspection history');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching inspection history:', error);
      return [];
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredCars(cars);
      return;
    }
    
    const filtered = cars.filter(car => {
      const searchLower = searchTerm.toLowerCase();
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

  // Submit inspection result
  const submitInspection = async (status: 'Approved' | 'Rejected') => {
    if (!selectedCar || !inspectorName) {
      Swal.fire('Warning', 'Please fill all required fields', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // Submit inspection record
      const inspectionResponse = await fetch('http://localhost:8080/auth/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCar.id,
          carType: activeTab,
          inspectorName,
          status,
          notes: inspectionNotes,
          inspectionDate: new Date().toISOString()
        })
      });

      if (!inspectionResponse.ok) throw new Error('Failed to submit inspection');

      // Update car inspection status
      let updateEndpoint = '';
      switch(activeTab) {
        case 'personal':
          updateEndpoint = 'http://localhost:8080/auth/car/update-inspection-status';
          break;
        case 'organization':
          updateEndpoint = 'http://localhost:8080/auth/organization-car/update-inspection-status';
          break;
        case 'rented':
          updateEndpoint = 'http://localhost:8080/auth/rent-car/update-inspection-status';
          break;
      }

      const updateResponse = await fetch(updateEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCar.id,
          inspected: true,
          inspectionResult: status
        })
      });

      if (!updateResponse.ok) throw new Error('Failed to update car status');

      Swal.fire('Success', 'Inspection submitted successfully', 'success');
      setSelectedCar(null);
      fetchCars();
    } catch (error) {
      console.error('Error submitting inspection:', error);
      Swal.fire('Error', 'Failed to submit inspection', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars when tab changes or on initial load
  useEffect(() => {
    fetchCars();
  }, [activeTab]);

  // Load inspection history when car is selected
  useEffect(() => {
    if (selectedCar) {
      fetchInspectionHistory(selectedCar.id).then(data => {
        setInspectionResults(data);
      });
    }
  }, [selectedCar]);

  // Handle direct link with plate number
  useEffect(() => {
    if (plateNumber && cars.length > 0) {
      const car = cars.find(c => c.plateNumber === plateNumber);
      if (car) setSelectedCar(car);
    }
  }, [plateNumber, cars]);

  // Get the appropriate display field based on car type
  const getDisplayField = (car: Car) => {
    switch(activeTab) {
      case 'organization':
        return { 
          label: 'Driver', 
          value: car.driverName || car.vehiclesUserName || 'N/A' 
        };
      case 'rented':
        return { 
          label: 'Company', 
          value: car.companyName || 'N/A' 
        };
      case 'personal':
      default:
        return { 
          label: 'Owner', 
          value: car.ownerName || 'N/A' 
        };
    }
  };

  // Get additional fields for inspection panel
  const getAdditionalFields = (car: Car) => {
    const fields = [];
    
    if (car.fuelType) {
      fields.push({ label: 'Fuel Type', value: car.fuelType });
    }
    if (car.loadCapacity) {
      fields.push({ label: 'Load Capacity', value: `${car.loadCapacity} kg` });
    }
    if (car.driverAddress) {
      fields.push({ label: 'Driver Address', value: car.driverAddress });
    }
    if (car.ownerPhone) {
      fields.push({ label: 'Owner Phone', value: car.ownerPhone });
    }
    if (car.vehiclesUserName) {
      fields.push({ label: 'User Name', value: car.vehiclesUserName });
    }
    
    return fields;
  };

  return (
    <div className="p-6 space-y-6">
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
                'Search by plate, model or company'
              }
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all"
          >
            Search
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={fetchCars}
          >
            <FiRefreshCw className="text-gray-600" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2"
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
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'personal' ? 'Owner' : 
                       activeTab === 'organization' ? 'Driver' : 'Company'}
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
                          key={car.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-gray-50 ${selectedCar?.id === car.id ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">{car.plateNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{car.model}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{displayField.value}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              car.status === 'active' ? 'bg-green-100 text-green-800' : 
                              car.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {car.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {car.inspected ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                car.inspectionResult === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {car.inspectionResult}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Not Inspected
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedCar(car)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              Inspect
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No vehicles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Inspection Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          {selectedCar ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Inspect: <span className="text-blue-600">{selectedCar.plateNumber}</span>
                </h2>
                <button 
                  onClick={() => setSelectedCar(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Type</p>
                    <p className="font-medium">
                      {activeTab === 'personal' ? 'Personal' : 
                       activeTab === 'organization' ? 'Organization' : 'Rented'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="font-medium">{selectedCar.model}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">{getDisplayField(selectedCar).label}</p>
                    <p className="font-medium">{getDisplayField(selectedCar).value}</p>
                  </div>
                  
                  {/* Dynamic additional fields */}
                  {getAdditionalFields(selectedCar).map((field, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500">{field.label}</p>
                      <p className="font-medium">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Notes</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    placeholder="Enter inspection findings..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => submitInspection('Approved')}
                    disabled={!inspectorName || loading}
                    className={`flex-1 py-2 text-white rounded-lg flex items-center justify-center ${
                      !inspectorName || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <FiCheck className="mr-2" /> Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => submitInspection('Rejected')}
                    disabled={!inspectorName || loading}
                    className={`flex-1 py-2 text-white rounded-lg flex items-center justify-center ${
                      !inspectorName || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    <FiX className="mr-2" /> Reject
                  </motion.button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">Inspection History</h3>
                {inspectionResults.length > 0 ? (
                  <div className="space-y-2">
                    {inspectionResults.map((result) => (
                      <div key={result.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium">{result.inspectorName}</span>
                          <span className={`text-sm ${
                            result.status === 'Approved' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{new Date(result.inspectionDate).toLocaleString()}</div>
                        {result.notes && <div className="text-sm mt-1">{result.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No previous inspections found</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FiSearch className="h-12 w-12 mb-4" />
              <p>Select a vehicle to inspect</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}