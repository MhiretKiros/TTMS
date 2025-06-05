"use client";
import { useState, useEffect,useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertCircle, FiMapPin, FiSend, FiCalendar, FiCheckCircle, 
  FiUser, FiUsers, FiTool, FiPlus, FiMinus, FiTruck, FiPackage,
  FiSearch, FiArrowRight, FiX
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import RequestsTable from './RequestsTable';
import { FuelRequestForm } from '../components/FuelForms/FuelRequestForm';
import DriverDailyRequestsTable from './DriverDailyRequestsTable';
import { DailyServiceApi, DailyServiceRequest } from '../api/dailyServiceHandlers';
import axios from 'axios';

const showSuccessAlert = (title: string, message: string) => {
  Swal.fire({
    title: title,
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg'
    }
  });
};

const carTypes = ["Sedan", "SUV", "Minivan", "Truck", "Luxury", "Other"];
const cargoTypes = ["Documents", "Equipment", "Fragile", "Hazardous", "Perishable", "Other"];
const departments = ["Software Development", "Marketing", "Sales", "Human Resources", "Operations", "Finance"];
const jobStatuses = ["Project", "Maintenance", "Emergency", "Meeting", "Training", "Other"];

interface DailyServiceRequestFormProps {
  requestId?: number;
  onSuccess: () => void;
  actorType: 'user' | 'manager' | 'driver';
}

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const parseInputDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString();
  } catch {
    return '';
  }
};

export default function DailyServiceRequestForm({ requestId, onSuccess, actorType }: DailyServiceRequestFormProps) {
// In your component's state initialization, change:

const [formData, setFormData] = useState({
  startingPlace: '',
  endingPlace: '', // Changed from endingPlace
  travelers: [''] as string[],
  dateTime: new Date().toISOString().slice(0, 16),
  claimantName: '',
  carType: '', // Changed from carType
  driverName: '', // Changed from driverName
  plateNumber: '', // Changed from plateNumber
  startingKilometers: '', // Changed from startingKilometers
  endingKilometers: '', // Changed from endingKilometers
  kmDifference: '',
  status: 'PENDING' as 'PENDING' | 'ASSIGNED' | 'COMPLETED'|'InspectedAndReady'
});
  const [vehicleType, setVehicleType] = useState( '' as 'car' | 'organization' | 'rent' | '');

  const [requests, setRequests] = useState<DailyServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DailyServiceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DailyServiceRequest | null>(null);
  const [showUserModal, setShowUserModal] = useState(actorType !== 'user');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [driverNameFilter, setDriverNameFilter] = useState('');
  const [driverSearchQuery, setDriverSearchQuery] = useState('');

    // Plate search functionality
  interface VehicleSuggestion {
    plate: string;
    driver: string;
    carType: string;
    status: string;
    type: 'car' | 'organization' | 'rent'; // Add type discriminator

  }
    // State declarations
    const [vehicleSuggestions, setVehicleSuggestions] = useState<VehicleSuggestion[]>([]);
    const [plateSearchQuery, setPlateSearchQuery] = useState('');
  
    // Fetch vehicles data
// Update the vehicle fetching useEffect
useEffect(() => {
  const fetchAllVehicles = async () => {
    try {
      const [carsRes, orgCarsRes, rentCarsRes] = await Promise.all([
        DailyServiceApi.getAllCars(),
        DailyServiceApi.getAllOrganizationCars(),
        DailyServiceApi.getAllRentCars()
      ]);

      const vehicles = [
        ...(carsRes.data.carList || []).filter((car: { status: string }) => 
          car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
          plate: v.plateNumber,
          driver: v.driverName || 'No driver assigned',
          carType: v.carType,
          type: 'car' as const // Add type identifier
        })),
        ...(orgCarsRes.data.organizationCarList || []).filter((car: { status: string }) => 
          car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
          plate: v.plateNumber,
          driver: v.driverName || 'No driver assigned',
          carType: v.carType,
          type: 'organization' as const // Add type identifier
        })),
        ...(rentCarsRes.data.rentCarList || []).filter((car: { status: string }) => 
          car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
          plate: v.licensePlate,
          driver: v.driverName || 'No driver assigned',
          carType: v.vehicleType,
          type: 'rent' as const // Add type identifier
        }))
      ].filter(v => v.plate !== 'N/A');

      setVehicleSuggestions(vehicles);
    } catch (error) {
      console.error('Vehicle fetch error:', error);
    }
  };

  if (showServiceModal) fetchAllVehicles();
}, [showServiceModal]);
  
    // Enhanced search logic
const filteredVehicles = useMemo(() => {
  if (!plateSearchQuery.trim()) return [];
  
  const query = plateSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return vehicleSuggestions
    .filter(vehicle => {
      const plate = vehicle?.plate?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || '';
      return plate.includes(query);
    })
    .sort((a, b) => {
      const aPlate = a?.plate?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || '';
      const bPlate = b?.plate?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || '';

      // Exact match first
      if (aPlate === query) return -1;
      if (bPlate === query) return 1;
      
      // Then startsWith matches
      const aStartsWith = aPlate.startsWith(query);
      const bStartsWith = bPlate.startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (bStartsWith && !aStartsWith) return 1;
      
      // Alphabetical order
      return aPlate.localeCompare(bPlate);
    })
    .slice(0, 5);
}, [plateSearchQuery, vehicleSuggestions]);
  
    // Plate selection handler
// Update handlePlateSelect function
const handlePlateSelect = (vehicle: VehicleSuggestion) => {
  setFormData(prev => ({
    ...prev,
    plateNumber: vehicle.plate,
    driverName: vehicle.driver,
    carType: vehicle.carType,
    // Store vehicle type in form data
  }));
  setVehicleType(vehicle.type)
  setPlateSearchQuery(vehicle.plate);
  
};
  //load data

  useEffect(() => {
    const determineVehicleType = async () => {
      if (!selectedRequest?.plateNumber) return;
      
      try {
        const [cars, orgCars, rentCars] = await Promise.all([
          DailyServiceApi.getAllCars(),
          DailyServiceApi.getAllOrganizationCars(),
          DailyServiceApi.getAllRentCars()
        ]);
  
        const plate = selectedRequest.plateNumber;
        
        if (cars.data.carList.some((c: any) => c.plateNumber === plate)) {
          setVehicleType( 'car' );      } 
        else if (orgCars.data.organizationCarList.some((c: any) => c.plateNumber === plate)) {
          setVehicleType( 'organization' );
        }
        else if (rentCars.data.rentCarList.some((c: any) => c.licensePlate === plate)) {
          setVehicleType( 'rent' );      }
      } catch (error) {
        console.error('Failed to determine vehicle type', error);
      }
    };
  
    if (showUserModal && actorType === 'driver') {
      determineVehicleType();
    }
  }, [showUserModal, selectedRequest, actorType]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        let data;
        if (actorType === 'driver') {
          // Load all COMPLETED requests but don't show them initially
          data = await DailyServiceApi.getDriverRequests();
        } else {
          data = await DailyServiceApi.getPendingRequests();
        }
        
        setRequests(data);
        
        if (actorType === 'driver') {
          // Start with empty results for drivers
          setFilteredRequests([]);
        } else {
          setFilteredRequests(data);
        }
        
        if (requestId) {
          const request = data.find(r => r.id === requestId) || await DailyServiceApi.getRequestById(requestId);
          if (request) {
            setSelectedRequest(request);
            populateFormData(request);
          }
        }
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Failed to load requests');
      }
    };
    loadRequests();
  }, [requestId, actorType]);
  
  useEffect(() => {
    if (selectedRequest) {
      populateFormData(selectedRequest);
    }
  }, [selectedRequest]);
  
//searching functionality

useEffect(() => {
  if (actorType === 'driver') {
    // For drivers, only show exact matches
    if (driverSearchQuery.trim() === '') {
      setFilteredRequests([]);
    } else {
      const filtered = requests.filter(request => {
        // Exact case-sensitive match with trimmed whitespace
        return request.driverName?.trim() === driverSearchQuery.trim();
      });
      setFilteredRequests(filtered);
    }
  } else {
    // Keep existing search for other roles
    if (searchQuery.trim() === '') {
      setFilteredRequests(requests);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = requests.filter(request => {
        const fieldsToSearch = [
          request.startingPlace,
          request.claimantName,
          request.status,
          ...(request.travelers || [])
        ];
        
        return fieldsToSearch.some(field => {
          if (!field) return false;
          const textValue = typeof field === 'string' ? field : field.name || '';
          return textValue.toLowerCase().includes(query);
        });
      });
      setFilteredRequests(filtered);
    }
  }
}, [driverSearchQuery, searchQuery, requests, actorType]);

const populateFormData = (request: DailyServiceRequest) => {
  setFormData({
    startingPlace: request.startingPlace,
    endingPlace: request.endingPlace, // Changed from endingPlace
    travelers: request.travelers,
    dateTime: request.dateTime,
    claimantName: request.claimantName,
    carType: request.carType || '',
    driverName: request.driverName || '', // Ensure correct field mapping
    plateNumber: request.plateNumber || '',
    startingKilometers: request.startingKilometers?.toString() || '',
    endingKilometers: request.startingKilometers?.toString() || '',
    kmDifference: request.kmDifference?.toString() || '',
    status: request.status
  });
};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
    if (successMessage) setSuccessMessage('');

    if (name === 'startingKilometers' || name === 'endingKilometers') {
      const startKm = name === 'startingKilometers' ? value : formData.startingKilometers;
      const endKm = name === 'endingKilometers' ? value : formData.endingKilometers;
      
      if (startKm && endKm) {
        const start = parseFloat(startKm);
        const end = parseFloat(endKm);
        if (!isNaN(start) && !isNaN(end)) {
          setFormData(prev => ({ ...prev, kmDifference: (end - start).toString() }));
        }
      }
    }
  };

  const handleTravelerChange = (index: number, value: string) => {
    const newTravelers = [...formData.travelers];
    newTravelers[index] = value;
    setFormData(prev => ({ ...prev, travelers: newTravelers }));
    
    if (errors[`traveler-${index}`]) {
      setErrors(prev => ({ ...prev, [`traveler-${index}`]: '' }));
    }
  };

  const addTraveler = () => {
    setFormData(prev => ({ ...prev, travelers: [...prev.travelers, ''] }));
  };

  const removeTraveler = (index: number) => {
    if (formData.travelers.length <= 1) return;
    const newTravelers = [...formData.travelers];
    newTravelers.splice(index, 1);
    setFormData(prev => ({ ...prev, travelers: newTravelers }));
  };

  const validateUserSection = () => {
    const newErrors: Record<string, string> = {};
    const currentDate = new Date();
    const startDate = formData.dateTime  ? new Date(formData.dateTime ) : null;

    if (!formData.endingPlace.trim()) newErrors.endingPlace = 'Destination is required';
    if (!formData.startingPlace.trim()) newErrors.startingPlace = 'Starting place is required';
    if (!formData.dateTime ) newErrors.dateTime = 'Starting date is required';
    
    formData.travelers.forEach((traveler, index) => {
      if (!traveler.trim()) {
        newErrors[`traveler-${index}`] = 'Traveler name is required';
      } else if (traveler.length > 50) {
        newErrors[`traveler-${index}`] = 'Name cannot exceed 50 characters';
      }
    });

    if (!formData.claimantName.trim()) newErrors.claimantName = 'Claimant name is required';

    if (startDate && startDate < currentDate) {
      newErrors.startingDate = 'Starting date cannot be in the past';
    }

    if (formData.startingPlace.length > 100) newErrors.startingPlace = 'Starting place cannot exceed 100 characters';
    if (formData.claimantName.length > 50) newErrors.claimantName = 'Claimant name cannot exceed 50 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateServiceSection = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'driverName',
      'CarType',
      'plateNumber'
    ];

    requiredFields.forEach(field => {
     
    });

    if (formData.startingKilometers) {
      const km = parseFloat(formData.startingKilometers);
      if (isNaN(km)) {
        newErrors.startingKilometers = 'Must be a number';
      } else if (km < 0) {
        newErrors.startingKilometers = 'Cannot be negative';
      }
    }
    
    if (formData.endingKilometers) {
      const km = parseFloat(formData.endingKilometers);
      if (isNaN(km)) {
        newErrors.endingKilometers = 'Must be a number';
      } else if (km < 0) {
        newErrors.endingKilometers = 'Cannot be negative';
      }
      if (formData.startingKilometers && km < parseFloat(formData.startingKilometers)) {
        newErrors.endingKilometers = 'Cannot be less than starting kilometers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setIsSubmitting(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const requestData: DailyServiceRequest = {
        startingPlace: formData.startingPlace,
        endingPlace: formData.endingPlace,
        travelers: formData.travelers.filter(t => t.trim()),
        dateTime: formData.dateTime ? `${formData.dateTime}` : '',
        claimantName: formData.claimantName,
        status: 'PENDING'
      };
  
      let result;
      
      result = await DailyServiceApi.createRequest(requestData);
      

      showSuccessAlert('Success!', `Travel request ${requestId ? 'updated' : 'submitted'} successfully!`);

      if (actorType === 'user') {
        window.location.reload();
      } else {
        closeModals();
        const data = await DailyServiceApi.getPendingRequests();
        setRequests(data);
        setFilteredRequests(data);
      }
    } catch (error: any) {
      setApiError(error.message || `Failed to ${requestId ? 'update' : 'submit'} request`);
    } finally {
      setIsSubmitting(false);
    }
  }; 

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest?.id) {
      setApiError('No request selected');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const result = await DailyServiceApi.assignRequest(selectedRequest.id!, {
        driverName: formData.driverName,
        carType: formData.carType,
        plateNumber: formData.plateNumber
      });

        if (!formData.plateNumber) {
          setErrors(prev => ({
            ...prev,
            plateNumber: 'Please select a vehicle from the list',
          }));
          
          // Scroll to the plate search field for better UX
          document.getElementById('plate-search')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      
      // Also verify the vehicleType is one of the expected values
      const validVehicleTypes = ['car', 'organization', 'rent'];
      if (!validVehicleTypes.includes(vehicleType)) {
        showSuccessAlert(
          'Error!',
          'Invalid vehicle type selected'
        );
        return;
      }
          // Update vehicle status to "Filed"
          if (vehicleType && formData.plateNumber) {
            try {
              let response;
              const statusUpdate = { status: 'DailyField' }; // Consistent payload
          
              if (vehicleType === 'car') {
                response = await axios.put(
                  `http://localhost:8080/auth/car/status/${formData.plateNumber}`,
                  statusUpdate
                );
              } 
              else if (vehicleType === 'organization') {
                response = await axios.put(
                  `http://localhost:8080/auth/organization-car/status/${formData.plateNumber}`,
                  statusUpdate
                );
              } 
              else if (vehicleType === 'rent') { // Changed from your second 'organization' check
                response = await axios.put(
                  `http://localhost:8080/auth/rent-car/status/${formData.plateNumber}`,
                  statusUpdate
                );
              }
          
              if (response && response.status === 200) {
                showSuccessAlert(
                  'Success!',
                  'Car assigned successfully!  Please procede the fule request for this travel'
      
                );
              } else {
                showSuccessAlert(
                  'Error!',
                  'Status not changed successfully!'
                );
              }
            } catch (error) {
              console.error('API Error:', error);
              showSuccessAlert(
                'Error!',
                'Failed to update status. Please try again.'
              );
            }
          } else {
            showSuccessAlert(
              'Error!',
              'Missing vehicle type or details!'
            );
          }

      showSuccessAlert('Success!', 'Service assigned successfully!');
      
      const updatedRequests = await DailyServiceApi.getPendingRequests();
      setRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
      
    

      setShowServiceModal(false);
    } catch (error: any) {
      setApiError(error.message || 'Failed to save service information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateServiceSection()) return;
    if (!selectedRequest?.id) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const completionData = {
        startKm: parseFloat(formData.startingKilometers),
        endKm: parseFloat(formData.endingKilometers)
      };
  
      await DailyServiceApi.completeRequest(selectedRequest.id!, completionData);

          if (vehicleType && formData.plateNumber) {
            try {
              let response;
              const statusUpdate = { status: 'InspectedAndReady' }; // Consistent payload
          
              if (vehicleType === 'car') {
                response = await axios.put(
                  `http://localhost:8080/auth/car/status/${formData.plateNumber}`,
                  statusUpdate
                );
              } 
              else if (vehicleType === 'organization') {
                response = await axios.put(
                  `http://localhost:8080/auth/organization-car/status/${formData.plateNumber}`,
                  statusUpdate
                );
              } 
              else if (vehicleType === 'rent') { // Changed from your second 'organization' check
                response = await axios.put(
                  `http://localhost:8080/auth/rent-car/status/${formData.plateNumber}`,
                  statusUpdate
                );
              }
          
              if (response && response.status === 200) {
                showSuccessAlert('Success!', 'Service assigned successfully!');

              } else {
                showSuccessAlert(
                  'Error!',
                  'Status not changed successfully!'
                );
              }
            } catch (error) {
              console.error('API Error:', error);
              showSuccessAlert(
                'Error!',
                'Failed to update status. Please try again.'
              );
            }
          } else {
            showSuccessAlert(
              'Error!',
              'Missing vehicle type or details!'
            );
          }
      showSuccessAlert('Success!', 'Trip details submitted successfully!');

      const data = await DailyServiceApi.getDriverRequests();
      const finishedRequests = data.filter(request => request.status === 'ASSIGNED');
      setRequests(finishedRequests);
      setFilteredRequests(finishedRequests);
      closeModals();
    } catch (error: any) {
      console.error('Submission error:', error);
      setApiError(error.message || 'Failed to submit trip details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRowClick = (request: DailyServiceRequest) => {
    setSelectedRequest(request);
    setShowUserModal(true);
    setShowServiceModal(false);
  };

  const handleGoToServiceForm = () => {
    setShowUserModal(false);
    setShowServiceModal(true);
  };

  const closeModals = () => {
    setShowUserModal(false);
    setShowServiceModal(false);
  };

  const getLocalDateTime = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }


  const isFormDisabled = actorType !== 'user' || (selectedRequest && actorType === 'user');
  const showSearchBar = (actorType === 'manager' || actorType === 'driver');

  const renderDriverModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiTruck className="mr-2" />
              Complete Trip Details
            </h3>
            <button onClick={closeModals} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FiX className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleDriverSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Starting Date *
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="datetime-local"
                            name="dateTime"
                            value={formData.dateTime}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                <input
                  type="text"
                  value={formData.carType}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Kilometers *</label>
                <input
                required
                  type="number"
                  name="startingKilometers"
                  value={formData.startingKilometers}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.startingKilometers ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter starting km"
                  min="0"
                  step="0.1"
                />
                {errors.startingKilometers && (
                  <p className="mt-1 text-sm text-red-500">{errors.startingKilometers}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ending Kilometers *</label>
                <input
                required
                  type="number"
                  name="endingKilometers"
                  value={formData.endingKilometers}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.endingKilometers ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter ending km"
                  min={formData.startingKilometers || 0}
                  step="0.1"
                />
                {errors.endingKilometers && (
                  <p className="mt-1 text-sm text-red-500">{errors.endingKilometers}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KM Difference</label>
                <input
                  type="number"
                  name="kmDifference"
                  value={formData.kmDifference}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                />
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 rounded-md text-white font-medium transition-all ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3c8dbc] hover:bg-[#367fa9]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2" />
                    Submit
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  const renderUserForm = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {requestId ? 'Edit Travel Request' : 'New Travel Request'}
      </h2>
      
      {apiError && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
          <div className="flex items-center">
            <FiCheckCircle className="mr-2" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleUserSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting Date *
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
              required
              required
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                disabled={isFormDisabled}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Claimant Name *</label>
            <input
              required
              type="text"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.claimantName ? 'border-red-500' : 'border-gray-300'
              } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter claimant's name"
              maxLength={50}
            />
            {errors.claimantName && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.claimantName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Place *</label>
            <input
              required
              type="text"
              name="startingPlace"
              value={formData.startingPlace}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.startingPlace ? 'border-red-500' : 'border-gray-300'
              } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter starting location"
              maxLength={100}
            />
            {errors.startingPlace && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.startingPlace}
              </p>
            )}
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Destination Place *</label>
  <input
              required
    type="text"
    name="endingPlace" // Changed from endingPlace
    value={formData.endingPlace}
    onChange={handleChange}
    disabled={isFormDisabled}
    className={`w-full px-4 py-3 rounded-lg border ${
      errors.endingPlace ? 'border-red-500' : 'border-gray-300'
    } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
    placeholder="Enter destination"
    maxLength={100}
  />
  {errors.endingPlace && (
    <p className="mt-1 text-sm text-red-500 flex items-center">
      <FiAlertCircle className="mr-1" /> {errors.endingPlace}
    </p>
  )}   
    </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Travelers *</label>
            <div className="space-y-3">
              {formData.travelers.map((traveler, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
              required
                    type="text"
                    value={traveler}
                    onChange={(e) => handleTravelerChange(index, e.target.value)}
                    disabled={isFormDisabled}
                    className={`flex-1 px-4 py-3 rounded-lg border ${
                      errors[`traveler-${index}`] ? 'border-red-500' : 'border-gray-300'
                    } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                    placeholder={`Traveler ${index + 1} name`}
                    maxLength={50}
                  />
                  {formData.travelers.length > 1 && !isFormDisabled && (
                    <button
                      type="button"
                      onClick={() => removeTraveler(index)}
                      className="p-3 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiMinus />
                    </button>
                  )}
                </div>
              ))}
              {!isFormDisabled && (
                <button
                  type="button"
                  onClick={addTraveler}
                  className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  <FiPlus className="mr-1" /> Add another traveler
                </button>
              )}
            </div>
            {formData.travelers.map((_, index) => (
              errors[`traveler-${index}`] && (
                <p key={`error-${index}`} className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors[`traveler-${index}`]}
                </p>
              )
            ))}
          </div>
        </div>

        <div className="mt-6">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 rounded-md text-white font-medium transition-all ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3c8dbc] hover:bg-[#367fa9]'
            }`}
          >
            {isSubmitting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                {requestId ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                {requestId ? 'Update' : 'Submit'}
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {actorType === 'user' ? (
        renderUserForm()
      ) : actorType === 'driver' ? (
        <motion.div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Completed Trips</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your exact driver name..."
                value={driverSearchQuery}
                onChange={(e) => setDriverSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              {driverSearchQuery.trim() === '' ? (
                <div className="text-gray-500 max-w-md mx-auto">
                  <FiSearch className="mx-auto text-3xl mb-4 text-blue-500" />
                  <h4 className="font-medium text-lg mb-2">Find Your Completed Trips</h4>
                  <p className="mb-4">
                    Enter your exact registered driver name to view your trips.
                  </p>
                </div>
              ) : (
                <div className="text-gray-500 max-w-md mx-auto">
                  <FiAlertCircle className="mx-auto text-3xl mb-4 text-yellow-500" />
                  <h4 className="font-medium text-lg mb-2">No Trips Found</h4>
                  <p className="mb-3">
                    No completed trips found for: <span className="font-semibold">"{driverSearchQuery}"</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Make sure you entered your name exactly as registered
                  </p>
                </div>
              )}
            </div>
          ) : (
            <DriverDailyRequestsTable
              requests={filteredRequests}
              actorType={actorType}
              onRowClick={handleRowClick}
            />
          )}

          {showUserModal && selectedRequest && renderDriverModal()}
        </motion.div>
      ) : (
        <motion.div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {actorType === 'manager' ? 'Manage Travel Requests' : 'Review Travel Requests'}
            </h2>
            {showSearchBar && (
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <DriverDailyRequestsTable
            requests={filteredRequests}
            actorType={actorType}
            onRowClick={handleRowClick}
          />

          <AnimatePresence>
            {showUserModal && selectedRequest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FiUser className="mr-2" />
                        Travel Request Details
                      </h3>
                      <button
                        onClick={closeModals}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiX className="text-gray-500" />
                      </button>
                    </div>
                    <form onSubmit={handleUserSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Starting Date *
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="datetime-local"
                            name="dateTime"
                            value={formData.dateTime}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>


                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Claimant Name *</label>
                        <input
                          type="text"
                          name="claimantName"
                          value={formData.claimantName}
                          onChange={handleChange}
                          disabled={isFormDisabled}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.claimantName ? 'border-red-500' : 'border-gray-300'
                          } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                          placeholder="Enter claimant's name"
                          maxLength={50}
                        />
                        {errors.claimantName && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FiAlertCircle className="mr-1" /> {errors.claimantName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Place *</label>
                        <input
                          type="text"
                          name="startingPlace"
                          value={formData.startingPlace}
                          onChange={handleChange}
                          disabled={isFormDisabled}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.startingPlace ? 'border-red-500' : 'border-gray-300'
                          } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                          placeholder="Enter starting location"
                          maxLength={100}
                        />
                        {errors.startingPlace && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FiAlertCircle className="mr-1" /> {errors.startingPlace}
                          </p>
                        )}
                      </div>

                      <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Place *</label>
              <input
                type="text"
                name="endingPlace" // Changed from endingPlace
                value={formData.endingPlace}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.endingPlace ? 'border-red-500' : 'border-gray-300'
                } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Enter destination"
                maxLength={100}
              />
              {errors.endingPlace && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.endingPlace}
                </p>
              )}   
                </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Travelers *</label>
                        <div className="space-y-3">
                          {formData.travelers.map((traveler, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <input
                                type="text"
                                value={traveler}
                                onChange={(e) => handleTravelerChange(index, e.target.value)}
                                disabled={isFormDisabled}
                                className={`flex-1 px-4 py-3 rounded-lg border ${
                                  errors[`traveler-${index}`] ? 'border-red-500' : 'border-gray-300'
                                } ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                                placeholder={`Traveler ${index + 1} name`}
                                maxLength={50}
                              />
                              {formData.travelers.length > 1 && !isFormDisabled && (
                                <button
                                  type="button"
                                  onClick={() => removeTraveler(index)}
                                  className="p-3 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <FiMinus />
                                </button>
                              )}
                            </div>
                          ))}
                          {!isFormDisabled && (
                            <button
                              type="button"
                              onClick={addTraveler}
                              className="mt-2 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              <FiPlus className="mr-1" /> Add another traveler
                            </button>
                          )}
                        </div>
                        {formData.travelers.map((_, index) => (
                          errors[`traveler-${index}`] && (
                            <p key={`error-${index}`} className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors[`traveler-${index}`]}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                                        
                      {actorType === 'manager' && selectedRequest?.status === 'PENDING' && (
                      <div className="mt-6">
                        <motion.button
                        type="button"
                        onClick={handleGoToServiceForm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium transition-all"
                      >
                        Continue
                        <FiArrowRight className="mr-2" />
                        
                      </motion.button>
                      </div>
                    )}
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showServiceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FiTool className="mr-2" />
                        Service Provider Assignment
                      </h3>
                      <button
                        onClick={closeModals}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiX className="text-gray-500" />
                      </button>
                    </div>

              {/* Form Start */}
              <form onSubmit={handleServiceSubmit} className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">          
    {/* Plate Number Search */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Plate Number *
      </label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={plateSearchQuery}
          readOnly={!!formData.plateNumber}
          onChange={(e) => setPlateSearchQuery(e.target.value)}
          placeholder="Start typing plate number..."
          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
            errors.plateNumber ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        
        {/* Clear selection button */}
        {formData.plateNumber && (
          <button
            type="button"
            onClick={() => {
              setPlateSearchQuery('');
              setFormData(prev => ({
                ...prev,
                plateNumber: '',
                driverName: '',
                carType: '',
                vehicleType: '',
              }));
            }}
            className="absolute right-3 top-3 p-1 text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        {/* Dropdown list */}
        {plateSearchQuery && !formData.plateNumber && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.plate}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      plateNumber: vehicle.plate,
                      driverName: vehicle.driver,
                      carType: vehicle.carType
                    }));
                    setVehicleType(vehicle.type);
                    setPlateSearchQuery(vehicle.plate);
                  }}
                  className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex justify-between items-center"
                >
                  <span className="font-mono">{vehicle.plate}</span>
                  <span className="text-sm text-gray-600">{vehicle.driver}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-sm">
                No available vehicles found matching "{plateSearchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      {errors.plateNumber && (
        <p className="mt-1 text-sm text-red-500">{errors.plateNumber}</p>
      )}
    </div>

    {/* Car Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Car Type *
      </label>
      <input
        type="text"
        name="carType"
        value={formData.carType}
        readOnly
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
        placeholder="Auto-filled from plate selection"
      />
      {errors.carType && (
        <p className="mt-1 text-sm text-red-500">{errors.carType}</p>
      )}
    </div>

    {/* Driver Name */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Driver Name *
      </label>
      <input
        type="text"
        name="driverName"
        placeholder="Auto-filled from plate selection"
        value={formData.driverName}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
      />
      {errors.driverName && (
        <p className="mt-1 text-sm text-red-500">{errors.driverName}</p>
      )}
    </div>
  </div> {/* End Grid */}

  {/* Submit Button */}
  <div className="mt-6">
    <motion.button
      type="submit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isSubmitting}
      className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
        isSubmitting
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-[#3c8dbc] hover:bg-[#367fa9]'
      }`}
    >
      {isSubmitting ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
          />
          Saving...
        </>
      ) : (
        <>
          <FiCheckCircle className="mr-2" />
          Assign
        </>
      )}
    </motion.button>
  </div>
</form>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}