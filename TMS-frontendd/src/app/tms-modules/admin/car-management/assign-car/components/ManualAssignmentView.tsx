// src/app/tms-modules/admin/car-management/assign-cars/ManualAssignmentView.tsx
'use client';

import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiSearch, FiRefreshCw } from 'react-icons/fi';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import axios from 'axios';
import VehicleAcceptanceForm from './VehicleAcceptanceForm';

// --- Types, State, Reducer ---
export interface Car {
  id: string;
  model: string;
  licensePlate: string;
  status: 'available' | 'assigned' | 'maintenance' | 'in_transfer';
  carType?: string;
  assignedDepartment?: string;
  assignedUserId?: string;
  manufactureYear?: number;
  motorCapacity?: string;
  fuelType?: string;
  parkingLocation?: string;
  isRentCar?: boolean;
}

export interface PendingRequest {
  id: string;
  requesterName: string;
  position: string;
  department: string;
  requestDate: string;
  requestedCarType?: string;
  status: 'pending' | 'in_transfer' | 'waiting';
  totalPercentage?: number;
  priority?: number;
  plateNumbers?: string;
  allCarModels?: string;
  carIds?: string[];
  requestLetterNo?: string;
}

interface AssignmentState {
  cars: Car[];
  pendingRequests: PendingRequest[];
  selectedCars: string[];
  selectedRequest: string | null;
  message: string | null;
  showAcceptanceForm: boolean;
  selectedApprovedAssignment: any | null;
}

export type AssignmentAction =
  | { type: 'UPDATE_CARS'; payload: Car[] }
  | { type: 'UPDATE_PENDING_REQUESTS'; payload: PendingRequest[] }
  | { type: 'TOGGLE_SELECT_CAR'; payload: string }
  | { type: 'SELECT_REQUEST'; payload: string }
  | { type: 'ASSIGN_CAR_SUCCESS'; payload: { carIds: string[]; requestId: string } }
  | { type: 'RESET_SELECTION' }
  | { type: 'CLEAR_MESSAGE' }
  | { type: 'SHOW_ACCEPTANCE_FORM'; payload: any }
  | { type: 'HIDE_ACCEPTANCE_FORM' }
  | { type: 'UPDATE_CAR_STATUS'; payload: { carId: string; status: 'available' | 'assigned' | 'maintenance' | 'in_transfer' } }
  | { type: 'UPDATE_REQUEST_STATUS'; payload: { requestId: string; status: 'pending' | 'in_transfer' | 'waiting' } };

export const initialAssignmentState: AssignmentState = {
  cars: [],
  pendingRequests: [],
  selectedCars: [],
  selectedRequest: null,
  message: null,
  showAcceptanceForm: false,
  selectedApprovedAssignment: null,
};

export const assignmentReducer = (state: AssignmentState, action: AssignmentAction): AssignmentState => {
  switch (action.type) {
    case 'UPDATE_CARS': 
      return { ...state, cars: action.payload };
    case 'UPDATE_PENDING_REQUESTS': 
      return { ...state, pendingRequests: action.payload };
    case 'TOGGLE_SELECT_CAR': 
      return {
        ...state,
        selectedCars: state.selectedCars.includes(action.payload)
          ? state.selectedCars.filter(id => id !== action.payload)
          : [...state.selectedCars, action.payload]
      };
    case 'SELECT_REQUEST': 
      return { 
        ...state, 
        selectedRequest: action.payload === state.selectedRequest ? null : action.payload,
        selectedCars: [] // Reset car selection when changing request
      };
    case 'ASSIGN_CAR_SUCCESS': {
      const fulfilledRequest = state.pendingRequests.find(req => req.id === action.payload.requestId);
      return {
        ...state,
        cars: state.cars.map((car) =>
          action.payload.carIds.includes(car.id)
            ? { 
                ...car, 
                status: 'assigned', 
                assignedUserId: fulfilledRequest?.requesterName, 
                assignedDepartment: fulfilledRequest?.department || 'Unknown' 
              }
            : car
        ),
        pendingRequests: state.pendingRequests.filter(req => req.id !== action.payload.requestId),
        message: `${action.payload.carIds.length} car(s) assigned successfully!`,
        selectedCars: [],
        selectedRequest: null
      };
    }
    case 'UPDATE_CAR_STATUS': 
      return {
        ...state,
        cars: state.cars.map(car => 
          car.id === action.payload.carId 
            ? { ...car, status: action.payload.status } 
            : car
        )
      };
    case 'UPDATE_REQUEST_STATUS': 
      return {
        ...state,
        pendingRequests: state.pendingRequests.map(req =>
          req.id === action.payload.requestId
            ? { ...req, status: action.payload.status }
            : req
        )
      };
    case 'RESET_SELECTION': 
      return { ...state, selectedCars: [], selectedRequest: null };
    case 'CLEAR_MESSAGE': 
      return { ...state, message: null };
    case 'SHOW_ACCEPTANCE_FORM':
      return { ...state, showAcceptanceForm: true, selectedApprovedAssignment: action.payload };
    case 'HIDE_ACCEPTANCE_FORM':
      return { ...state, showAcceptanceForm: false, selectedApprovedAssignment: null };
    default: 
      return state;
  }
};

export default function ManualAssignmentView() {
  const [assignmentState, dispatch] = useReducer(assignmentReducer, initialAssignmentState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [carSearchTerm, setCarSearchTerm] = useState('');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PendingRequest[]>([]);

  const parseMotorCapacity = (motorCapacity: string = ''): number => {
    if (!motorCapacity) return 0;
    const numericValue = parseInt(motorCapacity.replace(/\D/g, ''), 10);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  const loadData = useCallback(async () => {
    console.log(`Loading data for Manual Assignment`);
    setIsLoading(true);
    dispatch({ type: 'CLEAR_MESSAGE' });
    
    try {
      // Fetch approved cars (both regular and rent cars)
      const [regularCarsResponse, rentCarsResponse, requestsResponse] = await Promise.all([
        axios.get('http://localhost:8080/auth/car/approved'),
        axios.get('http://localhost:8080/auth/rent-car/approved'),
        axios.get('http://localhost:8080/auth/assignments/pending')
      ]);
  
      // Process regular cars
      const regularCars: Car[] = regularCarsResponse.data?.carList?.map((car: any) => ({
        id: car.id.toString(),
        model: car.model || 'Unknown Model',
        licensePlate: car.plateNumber || 'Unknown Plate',
        status: car.status?.toLowerCase() === 'inspectedandready' ? 'available' : 
               car.status?.toLowerCase() === 'in_transfer' ? 'in_transfer' : 'maintenance',
        carType: car.carType,
        manufactureYear: car.manufactureYear,
        motorCapacity: car.motorCapacity,
        fuelType: car.fuelType,
        parkingLocation: car.parkingLocation,
        isRentCar: false
      })) || [];
  
      // Process rent cars
      const rentCars: Car[] = rentCarsResponse.data?.rentCarList?.map((car: any) => ({
        id: `rent-${car.id}`,
        model: car.model || 'Unknown Model',
        licensePlate: car.plateNumber || 'Unknown Plate',
        status: car.status?.toLowerCase() === 'inspectedandready' ? 'available' : 
               car.status?.toLowerCase() === 'in_transfer' ? 'in_transfer' : 'maintenance',
        carType: car.bodyType,
        manufactureYear: car.proYear ? parseInt(car.proYear) : undefined,
        motorCapacity: car.cc,
        fuelType: car.fuelType,
        isRentCar: true
      })) || [];
  
      // Combine and filter only automobile-type cars
      const allCars = [...regularCars, ...rentCars].filter(car => 
        car.carType?.toLowerCase().includes('auto') || 
        car.carType?.toLowerCase().includes('autho') ||
        (car.isRentCar && car.carType?.toLowerCase().includes('sedan'))
      );
  
      dispatch({ type: 'UPDATE_CARS', payload: allCars });
  
      // Process pending requests
      const pendingRequests: PendingRequest[] = requestsResponse.data?.assignmentHistoryList
        ?.filter((request: any) => request.status === 'Pending' || request.status === 'In_transfer')
        .map((request: any) => ({
          id: request.id.toString(),
          requesterName: request.requesterName || 'Unknown Requester',
          department: request.department || 'Unknown Department',
          position: request.position || 'Unknown Position',
          requestDate: request.requestDate || new Date().toISOString(),
          requestedCarType: request.rentalType,
          status: request.status?.toLowerCase() === 'in_transfer' ? 'in_transfer' : 'pending',
          totalPercentage: request.totalPercentage || 0,
          priority: request.totalPercentage || 0,
          requestLetterNo: request.requestLetterNo
        })) || [];
  
      // Filter automobile requests and sort by status (in_transfer first) and priority (descending)
      const automobileRequests = pendingRequests.filter(request => 
        request.requestedCarType?.toLowerCase().includes('standard') ||
        request.requestedCarType?.toLowerCase().includes('project') ||
        request.requestedCarType?.toLowerCase().includes('organizational')
      ).sort((a, b) => {
        // In_transfer requests come first
        if (a.status === 'in_transfer' && b.status !== 'in_transfer') return -1;
        if (a.status !== 'in_transfer' && b.status === 'in_transfer') return 1;
        // Then sort by priority (descending)
        return (b.priority || 0) - (a.priority || 0);
      });
  
      dispatch({ type: 'UPDATE_PENDING_REQUESTS', payload: automobileRequests });
  
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire({ 
        title: 'Error!', 
        text: error instanceof Error ? error.message : 'Failed to load data', 
        icon: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const applyFiltersAndSearch = useCallback(() => {
    // Filter and sort cars
    let filteredC = [...assignmentState.cars];
    
    // Apply car search
    if (carSearchTerm.trim()) {
      const searchTermLower = carSearchTerm.toLowerCase();
      filteredC = filteredC.filter(car =>
        String(car.licensePlate || '').toLowerCase().includes(searchTermLower) ||
        String(car.model || '').toLowerCase().includes(searchTermLower)
      );
    }
    
    // Sort cars by status (in_transfer first) then motor capacity (CC) and year (descending)
    filteredC.sort((a, b) => {
      // In_transfer cars come first
      if (a.status === 'in_transfer' && b.status !== 'in_transfer') return -1;
      if (a.status !== 'in_transfer' && b.status === 'in_transfer') return 1;
      
      // Then sort by motor capacity and year
      const aCC = parseMotorCapacity(a.motorCapacity);
      const bCC = parseMotorCapacity(b.motorCapacity);
      
      if (bCC !== aCC) return bCC - aCC;
      return (b.manufactureYear || 0) - (a.manufactureYear || 0);
    });
    
    setFilteredCars(filteredC);

    // Filter and sort requests
    let filteredReqs = [...assignmentState.pendingRequests];
    
    // Apply request search
    if (requestSearchTerm.trim()) {
      const searchTermLower = requestSearchTerm.toLowerCase();
      filteredReqs = filteredReqs.filter(req =>
        String(req.requesterName || '').toLowerCase().includes(searchTermLower) ||
        String(req.department || '').toLowerCase().includes(searchTermLower) ||
        String(req.position || '').toLowerCase().includes(searchTermLower)
      );
    }
    
    // Requests are already sorted by status and priority in loadData
    setFilteredRequests(filteredReqs);
  }, [assignmentState.cars, assignmentState.pendingRequests, carSearchTerm, requestSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(applyFiltersAndSearch, 300);
    return () => clearTimeout(timer);
  }, [applyFiltersAndSearch]);

  const handleCarSearch = (query: string) => { 
    setCarSearchTerm(query); 
  };

  const handleRequestSearch = (query: string) => { 
    setRequestSearchTerm(query); 
  };

  const handleCloseAcceptanceForm = () => {
    dispatch({ type: 'HIDE_ACCEPTANCE_FORM' });
  };
const handleAssignCar = async () => {
  if (assignmentState.selectedCars.length === 0 || !assignmentState.selectedRequest) {
    Swal.fire({
      title: 'Selection Missing',
      text: 'Please select at least one car and a pending request.',
      icon: 'warning',
    });
    return;
  }

  // Get selected request and car data
  const selectedRequest = assignmentState.pendingRequests.find(
    req => req.id === assignmentState.selectedRequest
  );
  const selectedCarsData = assignmentState.selectedCars.map(carId => {
    const car = assignmentState.cars.find(c => c.id === carId);
    if (!car) throw new Error(`Car with ID ${carId} not found`);
    return car;
  });

  if (!selectedRequest) {
    Swal.fire({
      title: 'Error!',
      text: 'Selected request not found.',
      icon: 'error',
    });
    return;
  }

  const isInTransferRequest = selectedRequest?.status === 'in_transfer';

  try {
    setIsLoading(true);

    // --- Common Logic: Update car status based on type ---
    await Promise.all(
      selectedCarsData.map(async car => {
        const isRentCar = car.id.startsWith('rent-');
        const endpoint = isRentCar
          ? `http://localhost:8080/auth/rent-car/status/${car.licensePlate}`
          : `http://localhost:8080/auth/car/status/${car.licensePlate}`;

        // Set different statuses depending on request type
        const carStatus = isInTransferRequest ? 'In_transfer' : 'Assigned';
        await axios.put(endpoint, {
          status: carStatus,
          assignmentDate: new Date().toISOString().split('T')[0],
        });

        dispatch({
          type: 'UPDATE_CAR_STATUS',
          payload: { carId: car.id, status: isInTransferRequest ? 'in_transfer' : 'assigned' },
        });
      })
    );

    // --- Shared Request Data Preparation ---
    const plateNumbers = [
      ...(selectedRequest.plateNumbers?.split(', ') || []),
      ...selectedCarsData.map(car => car.licensePlate),
    ].join(', ');

    const allCarModels = [
      ...(selectedRequest.allCarModels?.split(', ') || []),
      ...selectedCarsData.map(car => car.model),
    ].join(', ');

    const carIds = [...(selectedRequest.carIds || []), ...assignmentState.selectedCars];

    // --- Determine request status based on type ---
    const requestStatus = isInTransferRequest ? 'Waiting' : 'Assigned';

    // --- Common Logic: Update request status and metadata ---
    const updateResponse = await axios.put(
      `http://localhost:8080/auth/car/assignments/update/${assignmentState.selectedRequest}`,
      {
        status: requestStatus,
        carIds,
        plateNumbers,
        allCarModels,
        numberOfCar: `${assignmentState.selectedCars.length}/${assignmentState.selectedCars.length}`,
      }
    );

    if (updateResponse.data.codStatus === 200) {
      if (!isInTransferRequest) {
        // Only complete assignment for non-in_transfer
        dispatch({
          type: 'ASSIGN_CAR_SUCCESS',
          payload: {
            carIds: assignmentState.selectedCars,
            requestId: assignmentState.selectedRequest,
          },
        });

        Swal.fire({
          title: 'Success!',
          text: `${assignmentState.selectedCars.length} car(s) assigned successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // For In_transfer, just update UI and prompt for acceptance form
        dispatch({
          type: 'UPDATE_REQUEST_STATUS',
          payload: { requestId: assignmentState.selectedRequest, status: 'waiting' },
        });

        Swal.fire({
          title: 'Success!',
          text: `The car has been marked as "In_transfer" and ready for acceptance. The request status has been updated to "Waiting". You can proceed to the vehicle acceptance form.`,
          icon: 'success',
        });

        dispatch({ type: 'RESET_SELECTION' });
      }
    } else {
      throw new Error(updateResponse.data.message || 'Failed to update request');
    }
  } catch (error) {
    console.error('Assignment error:', error);
    Swal.fire({
      title: 'Error!',
      text: error instanceof Error ? error.message : 'Could not assign car(s).',
      icon: 'error',
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-xl font-semibold text-gray-700">
          Assign Automobiles (Manual)
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Refresh Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={loadData} 
            disabled={isLoading} 
            title="Refresh Data"
          >
            <FiRefreshCw className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search requests..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={requestSearchTerm} 
                onChange={(e) => handleRequestSearch(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden" style={{ height: '24rem' }}>
            <div className="overflow-y-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr 
                      key={request.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        assignmentState.selectedRequest === request.id ? 'bg-blue-50' : ''
                      } ${
                        request.status === 'in_transfer' ? 'bg-purple-50 hover:bg-purple-100' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="radio"
                          name="request-selection"
                          checked={assignmentState.selectedRequest === request.id}
                          onChange={() => dispatch({ type: 'SELECT_REQUEST', payload: request.id })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{request.requesterName}</div>
                        <div className="text-xs text-gray-500">{new Date(request.requestDate).toLocaleDateString()}</div>
                        {request.status === 'in_transfer' && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">In Transfer</span>
                        )}
                        {request.status === 'waiting' && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Waiting</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {request.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {request.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (request.priority || 0) >= 70 ? 'bg-red-100 text-red-800' : 
                          (request.priority || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.priority}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        {isLoading ? 'Loading requests...' : 'No pending requests found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Available Cars Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Available Automobiles</h2>
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search cars..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={carSearchTerm} 
                onChange={(e) => handleCarSearch(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden" style={{ height: '24rem' }}>
            <div className="overflow-y-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCars
                    .filter(car => car.status === 'available' || car.status === 'in_transfer')
                    .map((car) => (
                      <tr 
                        key={car.id}
                        className={`hover:bg-gray-50 ${
                          assignmentState.selectedCars.includes(car.id) ? 'bg-blue-50' : ''
                        } ${
                          car.status === 'in_transfer' ? 'bg-purple-50 hover:bg-purple-100' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={assignmentState.selectedCars.includes(car.id)}
                            onChange={() => dispatch({ type: 'TOGGLE_SELECT_CAR', payload: car.id })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{car.model}</div>
                          {car.isRentCar && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Rental</span>
                          )}
                          {car.status === 'in_transfer' && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">In Transfer</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {car.licensePlate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {parseMotorCapacity(car.motorCapacity)}cc
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {car.manufactureYear}
                        </td>
                      </tr>
                    ))}
                  {filteredCars.filter(car => car.status === 'available' || car.status === 'in_transfer').length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        {isLoading ? 'Loading cars...' : 'No available automobiles found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Button */}
      <div className="mt-6 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAssignCar}
          disabled={!assignmentState.selectedRequest || assignmentState.selectedCars.length === 0}
          className={`px-6 py-3 rounded-lg font-medium text-white ${
            !assignmentState.selectedRequest || assignmentState.selectedCars.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Assign Selected Cars ({assignmentState.selectedCars.length})
        </motion.button>
      </div>

      {/* Acceptance Form Modal */}
      <AnimatePresence>
        {assignmentState.showAcceptanceForm && assignmentState.selectedApprovedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-[950px] ml-auto mr-12 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Vehicle Acceptance Form - {assignmentState.selectedApprovedAssignment.requestLetterNo}
                  </h2>
                  <button
                    onClick={handleCloseAcceptanceForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <VehicleAcceptanceForm 
                  initialData={{
                    plateNumber: assignmentState.selectedApprovedAssignment.car?.licensePlate || 
                                assignmentState.selectedApprovedAssignment.rentCar?.licensePlate || '',
                    carType: assignmentState.selectedApprovedAssignment.car?.carType || 
                             assignmentState.selectedApprovedAssignment.rentCar?.model || '',
                    km: assignmentState.selectedApprovedAssignment.rentCar?.km || '0',
                  }}
                  onClose={handleCloseAcceptanceForm}
                  
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}