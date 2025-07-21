"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertCircle, FiMapPin, FiSend, FiCalendar, FiCheckCircle, 
  FiUser, FiUsers, FiTool, FiPlus, FiMinus, FiTruck, FiPackage,
  FiSearch, FiArrowRight, FiX, FiClock
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import DriverDailyRequestsTable from './DriverDailyRequestsTable';
import { DailyServiceApi, DailyServiceRequest } from '../api/dailyServiceHandlers';
import axios from 'axios';
import { useNotification } from '@/app/contexts/NotificationContext';

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
  actorType: 'user' | 'manager' | 'driver'|'corporator';
}

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
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
  const [formData, setFormData] = useState({
    startingPlace: '',
    endingPlace: '',
    travelers: [''] as string[],
    date: new Date().toISOString().split('T')[0],
    time: '',
    returnDate: '',
    returnTime: '',
    claimantName: '',
    carType: '',
    driverName: '',
    plateNumber: '',
    estimatedKilometers: '',
    startingKilometers: '',
    endingKilometers: '',
    kmDifference: '',
    status: 'PENDING' as 'PENDING' | 'ASSIGNED' | 'COMPLETED'|'InspectedAndReady',
    reason: '',
    kmReason: ''
  });

  const {addNotification} = useNotification();
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
  const [showReason, setShowReason] = useState(false);
  const [showKmReason, setShowKmReason] = useState(false);

  // Get driver name from localStorage
  const [driverName, setDriverName] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.name || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  // Plate search functionality
  interface VehicleSuggestion {
    plate: string;
    driver: string;
    carType: string;
    status: string;
    type: 'car' | 'organization' | 'rent';
    currentKm: string;
  }

  const [vehicleSuggestions, setVehicleSuggestions] = useState<VehicleSuggestion[]>([]);
  const [plateSearchQuery, setPlateSearchQuery] = useState('');

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
            type: 'car' as const,
            currentKm: v.currentKilometers?.toString() || '0'
          })),
          ...(orgCarsRes.data.organizationCarList || []).filter((car: { status: string }) => 
            car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
            plate: v.plateNumber,
            driver: v.driverName || 'No driver assigned',
            carType: v.carType,
            type: 'organization' as const,
            currentKm: v.currentKilometers?.toString() || '0'
          })),
          ...(rentCarsRes.data.rentCarList || []).filter((car: { status: string }) => 
            car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
            plate: v.licensePlate,
            driver: v.driverName || 'No driver assigned',
            carType: v.vehicleType,
            type: 'rent' as const,
            currentKm: v.currentKilometers?.toString() || '0'
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
  const handlePlateSelect = (vehicle: VehicleSuggestion) => {
    setFormData(prev => ({
      ...prev,
      plateNumber: vehicle.plate,
      driverName: vehicle.driver,
      carType: vehicle.carType,
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
          setVehicleType('car');
        } 
        else if (orgCars.data.organizationCarList.some((c: any) => c.plateNumber === plate)) {
          setVehicleType('organization');
        }
        else if (rentCars.data.rentCarList.some((c: any) => c.licensePlate === plate)) {
          setVehicleType('rent');
        }
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
          // Load all ASSIGNED requests for the current driver
          data = await DailyServiceApi.getDriverRequests();
          data = data.filter(request => 
            request.status === 'ASSIGNED' && 
            request.driverName?.toLowerCase() === driverName.toLowerCase()
          );
          setRequests(data);
          setFilteredRequests(data);
        } else {
          data = await DailyServiceApi.getPendingRequests();
          setRequests(data);
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
  }, [requestId, actorType, driverName]);
  
  useEffect(() => {
    if (selectedRequest) {
      populateFormData(selectedRequest);
    }
  }, [selectedRequest]);

  const populateFormData = (request: DailyServiceRequest) => {
    const dateTime = request.dateTime ? new Date(request.dateTime) : new Date();
    const returnDateTime = request.returnDateTime ? new Date(request.returnDateTime) : null;
    
    setFormData({
      startingPlace: request.startingPlace,
      endingPlace: request.endingPlace,
      travelers: request.travelers,
      date: request.dateTime || dateTime.toISOString().split('T')[0],
      time: request.startTime || dateTime.toTimeString().substring(0, 5),
      returnDate: returnDateTime ? returnDateTime.toISOString().split('T')[0] : '',
      returnTime: request.returnTime || '',
      claimantName: request.claimantName,
      carType: request.carType || '',
      driverName: request.driverName || '',
      plateNumber: request.plateNumber || '',
      estimatedKilometers: request.estimatedKilometers?.toString() || '',
      startingKilometers: request.startingKilometers?.toString() || '',
      endingKilometers: request.endingKilometers?.toString() || '',
      kmDifference: request.kmDifference?.toString() || '',
      status: request.status,
      reason: request.reason || '',
      kmReason: request.kmReason || ''

    });
  };

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  
  // First update the form data with the new value
  setFormData(prev => {
    const updatedFormData = { ...prev, [name]: value };
    
    // Calculate kilometer difference whenever starting or ending km changes
    if (name === 'startingKilometers' || name === 'endingKilometers') {
      const startKm = parseFloat(updatedFormData.startingKilometers || '0');
      const endKm = parseFloat(updatedFormData.endingKilometers || '0');
      const estimatedKm = parseFloat(updatedFormData.estimatedKilometers || '0');
      
      if (!isNaN(startKm) && !isNaN(endKm)) {
        const difference = endKm - startKm;
        updatedFormData.kmDifference = difference.toString();
        
        // Show kmReason if difference exceeds estimated kilometers
        if (difference > estimatedKm) {
          setShowKmReason(true);
        } else {
          updatedFormData.kmReason = '';
          setShowKmReason(false);
        }
      }
    }
    
    return updatedFormData;
  });

  // Clear any existing errors for this field
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
  if (apiError) setApiError('');
  if (successMessage) setSuccessMessage('');

  // Handle time-related checks
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  
  const isLateReturn = formData.returnTime && currentTime > formData.returnTime;
  const currentDate = now.toISOString().split('T')[0];
  const isDifferentDate = formData.date !== currentDate;
  
  setShowReason(isLateReturn || isDifferentDate);
  
  if (!isLateReturn && !isDifferentDate) {
    setFormData(prev => ({ ...prev, reason: '' }));
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
  const currentDateTime = new Date();
  
  const dateOnly = formData.date;
  const timeOnly = formData.time;

  const startDateTime = dateOnly && timeOnly ? new Date(`${dateOnly}T${timeOnly}`) : null;

  // Validate claimant name
  if (!formData.claimantName.trim()) {
    newErrors.claimantName = 'Claimant name is required';
  } else if (formData.claimantName.length > 50) {
    newErrors.claimantName = 'Claimant name cannot exceed 50 characters';
  }

  // Validate request date
  if (!dateOnly) {
    newErrors.date = 'Request date is required';
  }

  // Validate start time
  if (!timeOnly) {
    newErrors.time = 'Start time is required';
  }

  // Validate that the combined date/time is not in the past
  if (startDateTime && startDateTime < currentDateTime) {
    newErrors.date = 'Start date/time cannot be in the past';
    newErrors.time = 'Start date/time cannot be in the past';
  }

  // Validate starting place
  if (!formData.startingPlace.trim()) {
    newErrors.startingPlace = 'Starting place is required';
  } else if (formData.startingPlace.length > 100) {
    newErrors.startingPlace = 'Starting place cannot exceed 100 characters';
  }

  // Validate destination place
  if (!formData.endingPlace.trim()) {
    newErrors.endingPlace = 'Destination is required';
  } else if (formData.endingPlace.length > 100) {
    newErrors.endingPlace = 'Destination cannot exceed 100 characters';
  }

  // Validate travelers
  formData.travelers.forEach((traveler, index) => {
    if (!traveler.trim()) {
      newErrors[`traveler-${index}`] = 'Traveler name is required';
    } else if (traveler.length > 50) {
      newErrors[`traveler-${index}`] = 'Traveler name cannot exceed 50 characters';
    }
  });

  // Optionally validate return time format
  if (formData.returnTime && !/^\d{2}:\d{2}$/.test(formData.returnTime)) {
    newErrors.returnTime = 'Return time is invalid';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const validateServiceSection = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.plateNumber) {
      newErrors.plateNumber = 'Please select a vehicle';
    }
    
    if (!formData.driverName) {
      newErrors.driverName = 'Driver name is required';
    }
    
    if (!formData.carType) {
      newErrors.carType = 'Car type is required';
    }
    
    if (!formData.startingKilometers) {
      newErrors.startingKilometers = 'Starting kilometers are required';
    } else {
      const km = parseFloat(formData.startingKilometers);
      if (isNaN(km)) {
        newErrors.startingKilometers = 'Must be a valid number';
      } else if (km < 0) {
        newErrors.startingKilometers = 'Cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
const validateDriverSection = () => {
  const newErrors: Record<string, string> = {};
  
  // Basic field validation only
  if (!formData.endingKilometers) {
    newErrors.endingKilometers = 'Ending kilometers are required';
  } else {
    const km = parseFloat(formData.endingKilometers);
    if (isNaN(km)) {
      newErrors.endingKilometers = 'Must be a valid number';
    } else if (km < 0) {
      newErrors.endingKilometers = 'Cannot be negative';
    } else if (formData.startingKilometers && km < parseFloat(formData.startingKilometers)) {
      newErrors.endingKilometers = 'Cannot be less than starting kilometers';
    }
  }

  // Check if reason is required (already determined by showReason state)
  if (showReason && !formData.reason) {
    newErrors.reason = showReason 
      ? 'Please provide reason for late return or date change'
      : '';
  }

  // Check if kmReason is required (already determined by showKmReason state)
  if (showKmReason && !formData.kmReason) {
    newErrors.kmReason = 'Please explain the high kilometer difference';
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
    // Create properly formatted request data
    const requestData = {
      dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
      startTime: formData.time,
      returnTime: formData.returnTime ,
      travelers: formData.travelers.filter(t => t.trim()),
      startingPlace: formData.startingPlace,
      endingPlace: formData.endingPlace,
      claimantName: formData.claimantName,
      status: 'PENDING' as const
    };

    const result = await DailyServiceApi.createRequest(requestData);
    
    showSuccessAlert('Success!', 'Travel request submitted successfully!');

    try {
      await addNotification(
        `New Daily Service request Added`,
        `/tms-modules/admin/request-management/request-field`,
        'DISTRIBUTOR'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }

    if (actorType === 'user') {
      window.location.reload();
    } else {
      closeModals();
      const data = await DailyServiceApi.getPendingRequests();
      setRequests(data);
      setFilteredRequests(data);
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    setApiError(error.message || 'Failed to submit request');
  } finally {
    setIsSubmitting(false);
  }
}; 

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //if (!validateServiceSection()) return;
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
        plateNumber: formData.plateNumber,
        estimatedKilometers: parseFloat(formData.estimatedKilometers)
      });

      if (!formData.plateNumber) {
        setErrors(prev => ({
          ...prev,
          plateNumber: 'Please select a vehicle from the list',
        }));
        
        document.getElementById('plate-search')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      
      const validVehicleTypes = ['car', 'organization', 'rent'];
      if (!validVehicleTypes.includes(vehicleType)) {
        showSuccessAlert(
          'Error!',
          'Invalid vehicle type selected'
        );
        return;
      }

      if (vehicleType && formData.plateNumber) {
        try {
          let response;
          const statusUpdate = { status: 'DailyField' };
      
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
          else if (vehicleType === 'rent') {
            response = await axios.put(
              `http://localhost:8080/auth/rent-car/status/${formData.plateNumber}`,
              statusUpdate
            );
          }
      
          if (response && response.status === 200) {
            showSuccessAlert(
              'Success!',
              'Car assigned successfully! Please proceed the fuel request for this travel'
            );

            try {
        await addNotification(
        `New Daily Service request Come to (${formData.endingPlace})`,
        `/tms-modules/admin/request-management/request-field`,
        'DRIVER'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }
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
    if (!validateDriverSection()) return;
    if (!selectedRequest?.id) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const completionData = {
        startKm: parseFloat(formData.startingKilometers),
        endKm: parseFloat(formData.endingKilometers),
        reason: formData.reason,
        kmReason: formData.kmReason
      };
  
      await DailyServiceApi.completeRequest(selectedRequest.id!, completionData);

      if (vehicleType && formData.plateNumber) {
        try {
          let response;
          const statusUpdate = { 
            status: 'InspectedAndReady',
            currentKilometers: parseFloat(formData.endingKilometers)
          };
      
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
          else if (vehicleType === 'rent') {
            response = await axios.put(
              `http://localhost:8080/auth/rent-car/status/${formData.plateNumber}`,
              statusUpdate
            );
          }
      
          if (response && response.status === 200) {
            showSuccessAlert('Success!', 'Service completed successfully!');
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
      const finishedRequests = data.filter(request => 
            request.status === 'ASSIGNED' && 
            request.driverName?.toLowerCase() === driverName.toLowerCase()
          );
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

  const isFormDisabled = actorType !== 'user' || (selectedRequest !== null && actorType === 'user');
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

          <form onSubmit={handleDriverSubmit} className="space-y-6">
  {/* Header with Request Date */}
  <div className="flex justify-between items-center">
    <h2 className="text-lg font-semibold text-gray-800">Assign Driver & Complete Request</h2>
    <div className="flex items-center space-x-2">
      <FiCalendar className="text-gray-400" />
      <input
        type="date"
        name="date"
        value={formData.date}
        readOnly
        className="px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800"
      />
    </div>
  </div>

  {/* Time Fields: Start Time & Return Time */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
      <div className="relative">
        <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="time"
          name="time"
          value={formData.time}
          readOnly
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Return Time *</label>
      <div className="relative">
        <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="time"
          name="returnTime"
          value={formData.returnTime}
          readOnly
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {errors.returnDate && (
        <p className="mt-1 text-sm text-red-500">{errors.returnDate}</p>
      )}
    </div>
  </div>

  {/* Remaining Fields in Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

    {showReason && (
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Late Return Reason *</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required={showReason}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.reason ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Please explain why the return was late"
          rows={3}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
        )}
      </div>
    )}

    {showKmReason && (
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">High Kilometer Difference Reason *</label>
        <textarea
          name="kmReason"
          value={formData.kmReason}
          onChange={handleChange}
          required={showKmReason}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.kmReason ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Please explain the high kilometer difference"
          rows={3}
        />
        {errors.kmReason && (
          <p className="mt-1 text-sm text-red-500">{errors.kmReason}</p>
        )}
      </div>
    )}
  </div>

  {/* Submit Button */}
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
      {/* Row 1: Claimant Name | Request Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Request Date *</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              required
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isFormDisabled}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <FiAlertCircle className="mr-1" /> {errors.date}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Start Time | Return Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              required
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              disabled={isFormDisabled}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.time && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <FiAlertCircle className="mr-1" /> {errors.time}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Return Time</label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="time"
              name="returnTime"
              value={formData.returnTime}
              onChange={handleChange}
              disabled={isFormDisabled}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.returnTime && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <FiAlertCircle className="mr-1" /> {errors.returnTime}
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Starting Place | Destination Place */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            name="endingPlace"
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
      </div>

      {/* Row 4: Travelers (full width) */}
      <div>
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            My ASSIGNED Trips
            {driverName && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                (Driver: {driverName})
              </span>
            )}
          </h2>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 max-w-md mx-auto">
                {requests.length === 0 ? (
                  <>
                    <FiAlertCircle className="mx-auto text-3xl mb-4 text-yellow-500" />
                    <h4 className="font-medium text-lg mb-2">No Trips Found</h4>
                    <p className="mb-3">
                      You don't have any ASSIGNED trips currently.
                    </p>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mx-auto text-3xl mb-4 text-green-500" />
                    <h4 className="font-medium text-lg mb-2">No Matching Trips</h4>
                    <p className="mb-3">
                      No ASSIGNED trips found for your name.
                    </p>
                  </>
                )}
              </div>
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
              {/* Row 1: Claimant Name | Request Date */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Date *</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Start Time | Return Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={isFormDisabled}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      name="returnTime"
                      value={formData.returnTime}
                      onChange={handleChange}
                      disabled={isFormDisabled}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {errors.returnDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.returnDate}
                  </p>
                )}
              </div>

              {/* Row 3: Starting Place | Ending Place */}
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
                  name="endingPlace"
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

              {/* Row 4: Travelers Full Width */}
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

                    <form onSubmit={handleServiceSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">          
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Plate Number *
                          </label>
                          <div className="relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                              id="plate-search"
                              type="text"
                              value={plateSearchQuery}
                              readOnly={!!formData.plateNumber}
                              onChange={(e) => setPlateSearchQuery(e.target.value)}
                              placeholder="Start typing plate number..."
                              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                errors.plateNumber ? 'border-red-500' : 'border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            
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
                                  }));
                                }}
                                className="absolute right-3 top-3 p-1 text-gray-500 hover:text-gray-700"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            )}

                            {plateSearchQuery && !formData.plateNumber && (
                              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {filteredVehicles.length > 0 ? (
                                  filteredVehicles.map((vehicle) => (
                                    <div
                                      key={vehicle.plate}
                                      onClick={() => handlePlateSelect(vehicle)}
                                      className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex justify-between items-center"
                                    >
                                      <div>
                                        <span className="font-mono">{vehicle.plate}</span>
                                        <span className="block text-sm text-gray-600">{vehicle.driver}</span>
                                      </div>
                                      
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Car Type *
                          </label>
                          <input
                          required
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver Name *
                          </label>
                          <input
                          required
                            type="text"
                            name="driverName"
                            value={formData.driverName}
                            readOnly
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                            placeholder="Auto-filled from plate selection"
                          />
                          {errors.driverName && (
                            <p className="mt-1 text-sm text-red-500">{errors.driverName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Kilometers *
                          </label>
                          <input
                            required
                            type="number"
                            name="estimatedKilometers"
                            value={formData.estimatedKilometers}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              errors.estimatedKilometers ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter estimeted km"
                            min="0"
                          />
                          {errors.estimatedKilometers && (
                            <p className="mt-1 text-sm text-red-500">{errors.estimitedKilometers}</p>
                          )}
                        </div>
                      </div>

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