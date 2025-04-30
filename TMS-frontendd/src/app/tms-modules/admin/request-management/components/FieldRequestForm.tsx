"use client";
import { useState, useEffect,useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertCircle, FiMapPin, FiSend, FiCalendar, FiCheckCircle, 
  FiUser, FiUsers, FiTool, FiPlus, FiMinus, FiTruck, FiPackage,
  FiSearch, FiArrowRight, FiX,FiChevronDown 
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TravelApi, TravelRequest } from '../api/handlers';
import RequestsTable from './RequestsTable';
import { FuelRequestForm } from '../components/FuelForms/FuelRequestForm';
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

interface TravelRequestFormProps {
  requestId?: number;
  onSuccess: () => void;
  actorType: 'user' | 'manager' | 'corporator' | 'driver';
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

export default function TravelRequestForm({ requestId, onSuccess, actorType }: TravelRequestFormProps) {
  const [formData, setFormData] = useState({
    startingPlace: '',
    destinationPlace: '',
    travelers: [''] as string[],
    travelReason: '',
    carType: '',
    travelDistance: '',
    startingDate: '',
    returnDate: '',
    department: '',
    jobStatus: '',
    claimantName: '',
    teamLeaderName: '',
    accountNumber: '',
    paymentType: '',
    approvement: '',
    serviceProviderName: '',
    assignedCarType: '',
    assignedDriver: '',
    vehicleDetails: '',
    actualStartingDate: '',
    actualReturnDate: '',
    startingKilometers: '',
    endingKilometers: '',
    kmDifference: '',
    cargoType: '',
    cargoWeight: '',
    numberOfPassengers: '',
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'ASSIGNED' | 'FINISHED',
  });

  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const [selectedCargoTypes, setSelectedCargoTypes] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState( '' as 'car' | 'organization' | 'rent' | ''
  );
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TravelRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
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
        TravelApi.getAllCars(),
        TravelApi.getAllOrganizationCars(),
        TravelApi.getAllRentCars()
      ]);

      const vehicles = [
        ...(carsRes.data.carList || []).filter((car: { status: string }) => 
          car.status.toLowerCase() === 'approved').map((v: any) => ({
          plate: v.plateNumber,
          driver: v.driverName || 'No driver assigned',
          carType: v.carType,
          type: 'car' as const // Add type identifier
        })),
        ...(orgCarsRes.data.organizationCarList || []).filter((car: { status: string }) => 
          car.status.toLowerCase() === 'approved').map((v: any) => ({
          plate: v.plateNumber,
          driver: v.driverName || 'No driver assigned',
          carType: v.carType,
          type: 'organization' as const // Add type identifier
        })),
        ...(rentCarsRes.data.rentCarList || []).filter((car: { status: string }) => 
          car.status.toLowerCase() === 'approved').map((v: any) => ({
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
    vehicleDetails: vehicle.plate,
    assignedDriver: vehicle.driver,
    assignedCarType: vehicle.carType,
    // Store vehicle type in form data
  }));
  setVehicleType(vehicle.type)
  setPlateSearchQuery(vehicle.plate);
  
};

useEffect(() => {
  const determineVehicleType = async () => {
    if (!selectedRequest?.vehicleDetails) return;
    
    try {
      const [cars, orgCars, rentCars] = await Promise.all([
        TravelApi.getAllCars(),
        TravelApi.getAllOrganizationCars(),
        TravelApi.getAllRentCars()
      ]);

      const plate = selectedRequest.vehicleDetails;
      
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
          data = await TravelApi.getDriverRequests();
          data = data.filter(request => request.status === 'COMPLETED');
        } else {
          data = await TravelApi.getRequests(actorType);
        }
        
        setRequests(data);
        
        if (actorType === 'driver') {
          // Start with empty results for drivers
          setFilteredRequests([]);
        } else {
          setFilteredRequests(data);
        }
        
        if (requestId) {
          const request = data.find(r => r.id === requestId) || await TravelApi.getRequestById(requestId);
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
        return request.assignedDriver?.trim() === driverSearchQuery.trim();
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
          request.destinationPlace,
          request.claimantName,
          request.travelReason,
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

const populateFormData = (request: TravelRequest) => {
  if (actorType === 'driver') {
    setFormData(prev => ({
      ...prev,
      serviceProviderName: request.serviceProviderName || '',
      assignedCarType: request.assignedCarType || '',
      assignedDriver: request.assignedDriver || '',
      vehicleDetails: request.vehicleDetails || '',
      // Reset editable fields
      actualStartingDate: '',
      actualReturnDate: '',
      startingKilometers: '',
      endingKilometers: '',
      kmDifference: '',
      cargoType: request.cargoType || '',
      cargoWeight: '',
      numberOfPassengers: request.travelers.filter(t => t?.name?.trim()).length.toString(),
      travelers: request.travelers.map(t => t?.name || '')
    }));
    
    // Initialize selected cargo types from existing data
    if (request.cargoType) {
      setSelectedCargoTypes(
        request.cargoType.split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
      );
    } else {
      setSelectedCargoTypes([]);
    }
  } else {
    setFormData({
      paymentType: request.paymentType || '',
      startingPlace: request.startingPlace,
      destinationPlace: request.destinationPlace,
      travelers: request.travelers.map(t => t?.name || ''), // Safe access
      travelReason: request.travelReason,
      carType: request.carType || '',
      travelDistance: request.travelDistance?.toString() || '',
      startingDate: formatDateForInput(request.startingDate) || '',
      returnDate: request.returnDate ? formatDateForInput(request.returnDate) : '',
      department: request.department,
      jobStatus: request.jobStatus,
      claimantName: request.claimantName,
      accountNumber: request.accountNumber || '',
      teamLeaderName: request.teamLeaderName,
      approvement: request.approvement || '',
      serviceProviderName: request.serviceProviderName || '',
      assignedCarType: request.assignedCarType || '',
      assignedDriver: request.assignedDriver || '',
      vehicleDetails: request.vehicleDetails || '',
      actualStartingDate: request.actualStartingDate ? formatDateForInput(request.actualStartingDate) : '',
      actualReturnDate: request.actualReturnDate ? formatDateForInput(request.actualReturnDate) : '',
      startingKilometers: request.startingKilometers?.toString() || '',
      endingKilometers: request.endingKilometers?.toString() || '',
      kmDifference: request.kmDifference?.toString() || '',
      cargoType: request.cargoType || '',
      cargoWeight: request.cargoWeight?.toString() || '',
      numberOfPassengers: request.travelers.filter(t => t?.name?.trim()).length.toString(),
      status: request.status,
    });

    // Initialize selected cargo types from existing data
    if (request.cargoType) {
      setSelectedCargoTypes(
        request.cargoType.split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
      );
    } else {
      setSelectedCargoTypes([]);
    }
  }
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
    const startDate = formData.startingDate ? new Date(formData.startingDate) : null;
    const endDate = formData.returnDate ? new Date(formData.returnDate) : null;

    if (!formData.startingPlace.trim()) newErrors.startingPlace = 'Starting place is required';
    if (!formData.destinationPlace.trim()) newErrors.destinationPlace = 'Destination is required';
    if (!formData.startingDate) newErrors.startingDate = 'Starting date is required';
    
    formData.travelers.forEach((traveler, index) => {
      if (!traveler.trim()) {
        newErrors[`traveler-${index}`] = 'Traveler name is required';
      } else if (traveler.length > 50) {
        newErrors[`traveler-${index}`] = 'Name cannot exceed 50 characters';
      }
    });
    
    if (!formData.travelReason.trim()) newErrors.travelReason = 'Travel reason is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.jobStatus) newErrors.jobStatus = 'Job status is required';
    if (!formData.claimantName.trim()) newErrors.claimantName = 'Claimant name is required';
    if (!formData.teamLeaderName.trim()) newErrors.teamLeaderName = 'Team leader name is required';

    if (startDate && startDate < currentDate) {
      newErrors.startingDate = 'Starting date cannot be in the past';
    }
    
    if (endDate && startDate && endDate < startDate) {
      newErrors.returnDate = 'Return date cannot be before starting date';
    }

    if (formData.startingPlace.length > 100) newErrors.startingPlace = 'Starting place cannot exceed 100 characters';
    if (formData.destinationPlace.length > 100) newErrors.destinationPlace = 'Destination cannot exceed 100 characters';
    if (formData.travelReason.length > 500) newErrors.travelReason = 'Reason cannot exceed 500 characters';
    if (formData.claimantName.length > 50) newErrors.claimantName = 'Claimant name cannot exceed 50 characters';
    if (formData.teamLeaderName.length > 50) newErrors.teamLeaderName = 'Team leader name cannot exceed 50 characters';
    if (formData.approvement.length > 100) newErrors.approvement = 'Approvement cannot exceed 100 characters';

    if (formData.travelDistance) {
      const distance = parseFloat(formData.travelDistance);
      if (isNaN(distance)) {
        newErrors.travelDistance = 'Distance must be a number';
      } else if (distance <= 0) {
        newErrors.travelDistance = 'Distance must be greater than 0';
      } else if (distance > 10000) {
        newErrors.travelDistance = 'Distance cannot exceed 10,000 km';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateServiceSection = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'serviceProviderName',
      'assignedDriver',
      'assignedCarType',
      'actualStartingDate',
      'startingKilometers',
      'endingKilometers',
      'cargoWeight'
    ];
  
    requiredFields.forEach(field => {
      if (!formData[field]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').trim();
        newErrors[field] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
    });
  
    // Check cargo types
    if (selectedCargoTypes.length === 0) {
      newErrors.cargoType = 'At least one cargo type must be selected';
    }

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
    
    if (formData.numberOfPassengers) {
      const passengers = parseInt(formData.numberOfPassengers);
      if (isNaN(passengers)) {
        newErrors.numberOfPassengers = 'Must be a number';
      } else if (passengers < 1) {
        newErrors.numberOfPassengers = 'Must be at least 1';
      } else if (passengers > 20) {
        newErrors.numberOfPassengers = 'Cannot exceed 20';
      }
    }

    if (formData.cargoWeight) {
      const weight = parseFloat(formData.cargoWeight);
      if (isNaN(weight)) {
        newErrors.cargoWeight = 'Must be a number';
      } else if (weight < 0) {
        newErrors.cargoWeight = 'Cannot be negative';
      } else if (weight > 10000) {
        newErrors.cargoWeight = 'Cannot exceed 10,000 kg';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStatusChange = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      setIsApproving(true);
      await TravelApi.updateRequestStatus(id, status);
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status } : req
      ));
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }

      showSuccessAlert(
        'Success!', 
        `Request has been ${status.toLowerCase()} successfully`
      );
      
      // Refresh data
      const data = await TravelApi.getRequests(actorType);
      setRequests(data);
      setFilteredRequests(data);
      closeModals();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsApproving(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUserSection()) return;
  
     // Add confirmation for cash payments
     if (formData.paymentType === 'cash') {
      const resultss = await Swal.fire({
        title: 'Confirm Account Number',
        html: `<div class="text-left">
          <p class="mb-2">Please confirm the account number for cash payment:</p>
          <div class="bg-gray-100 p-3 rounded-lg font-mono">${formData.accountNumber}</div>
        </div>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, it\'s correct',
        cancelButtonText: 'No, edit it',
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-4 py-2 rounded-lg',
        cancelButton: 'px-4 py-2 rounded-lg'
        }
      });

      if (!resultss.isConfirmed) {
        return; // Stop submission if user cancels
      }
     }
    setIsSubmitting(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const requestData = {
        startingPlace: formData.startingPlace,
        destinationPlace: formData.destinationPlace,
        travelers: formData.travelers.filter(t => t.trim()),
        travelReason: formData.travelReason,
        carType: formData.carType || undefined,
        travelDistance: formData.travelDistance ? parseFloat(formData.travelDistance) : undefined,
        startingDate: formData.startingDate 
          ? `${formData.startingDate}T00:00:00`
          : undefined,
        returnDate: formData.returnDate 
          ? `${formData.returnDate}T00:00:00`
          : undefined,
        department: formData.department,
        jobStatus: formData.jobStatus,
        claimantName: formData.claimantName,
        teamLeaderName: formData.teamLeaderName,
        accountNumber: formData.accountNumber,
        status: 'PENDING'
      };

      let result;
      if (requestId) {
        result = await TravelApi.updateRequest(requestId, requestData);
        setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      } else {
        result = await TravelApi.createRequest(requestData);
        setRequests(prev => [...prev, result]);
      }

      showSuccessAlert(
        'Success!', 
        `Travel request ${requestId ? 'updated' : 'submitted'} successfully!`
      );

      if (actorType === 'user') {
        window.location.reload();
      } else {
        closeModals();
        // Refresh table data
        const data = await TravelApi.getRequests(actorType);
        setRequests(data);
        setFilteredRequests(data);
      }
    } catch (error: any) {
      setApiError(error.message || `Failed to ${requestId ? 'update' : 'submit'} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateServiceInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.serviceProviderName.trim()) {
      newErrors.serviceProviderName = 'Service provider is required';
    }
    if (!formData.assignedCarType) {
      newErrors.assignedCarType = 'Car type is required';
    }
    if (!formData.assignedDriver.trim()) {
      newErrors.assignedDriver = 'Driver name is required';
    }
    if (!formData.vehicleDetails.trim()) {
      newErrors.vehicleDetails = 'Vehicle details are required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateServiceInfo()) return;
    if (!selectedRequest?.id) {
      setApiError('No request selected');
      return;
    }
  
    setIsSubmitting(true);
    setApiError('');
  
    try {
      // Save service provider info and set status to ASSIGNED
      const result = await TravelApi.updateServiceProviderInfo({
        id: selectedRequest.id,
        serviceProviderName: formData.serviceProviderName,
        assignedCarType: formData.assignedCarType,
        assignedDriver: formData.assignedDriver,
        vehicleDetails: formData.vehicleDetails,
        status: 'ASSIGNED' // Add this to update status
      });
// Before making the status update call, add this validation:
  if (!formData.vehicleDetails) {
    setErrors(prev => ({
      ...prev,
      vehicleDetails: 'Please select a vehicle from the list',
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
    if (vehicleType && formData.vehicleDetails) {
      try {
        let response;
        const statusUpdate = { status: 'Field' }; // Consistent payload
    
        if (vehicleType === 'car') {
          response = await axios.put(
            `http://localhost:8080/auth/car/status/${formData.vehicleDetails}`,
            statusUpdate
          );
        } 
        else if (vehicleType === 'organization') {
          response = await axios.put(
            `http://localhost:8080/auth/organization-car/status/${formData.vehicleDetails}`,
            statusUpdate
          );
        } 
        else if (vehicleType === 'rent') { // Changed from your second 'organization' check
          response = await axios.put(
            `http://localhost:8080/auth/rent-car/status/${formData.vehicleDetails}`,
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
      
      // Refresh requests
      const updatedRequests = await TravelApi.getRequests(actorType);
      setRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
      
      // Show fuel request confirmation

  
      setShowServiceModal(false);
      setShowFuelModal(true);
  
    } catch (error: any) {
      setApiError(error.message || 'Failed to save service information');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // New handler specifically for drivers
  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update formData with the selected cargo types before validation
    setFormData(prev => ({
      ...prev,
      cargoType: selectedCargoTypes.join(', '),
      numberOfPassengers: prev.travelers.filter(t => t.trim()).length.toString()
    }));
  
    if (!validateServiceSection()) return;
    if (!selectedRequest?.id) {
      setApiError('No request selected');
      return;
    }
  
    setIsSubmitting(true);
    setApiError('');
  
    try {
      // Format dates properly before sending
      const completionData = {
        id: selectedRequest.id,
        serviceProviderName: formData.serviceProviderName,
        assignedDriver: formData.assignedDriver,
        assignedCarType: formData.assignedCarType,
        vehicleDetails: formData.vehicleDetails,
        actualStartingDate: formData.actualStartingDate 
            ? `${formData.actualStartingDate}T00:00:00`
            : undefined,
        actualReturnDate: formData.actualReturnDate 
            ? `${formData.actualReturnDate}T00:00:00`
            : undefined,
        startingKilometers: parseFloat(formData.startingKilometers),
        endingKilometers: parseFloat(formData.endingKilometers),
        cargoType: selectedCargoTypes.join(', '), // Use the selected types
        cargoWeight: parseFloat(formData.cargoWeight),
        numberOfPassengers: formData.travelers.filter(t => t.trim()).length, // Calculate from travelers
        status: 'FINISHED'
      };

    await TravelApi.completeTravelRequest(completionData);

    if (vehicleType && formData.vehicleDetails) {
      try {
        let response;
        const statusUpdate = { status: 'Approved' }; // Consistent payload
    
        if (vehicleType === 'car') {
          response = await axios.put(
            `http://localhost:8080/auth/car/status/${formData.vehicleDetails}`,
            statusUpdate
          );
        } 
        else if (vehicleType === 'organization') {
          response = await axios.put(
            `http://localhost:8080/auth/organization-car/status/${formData.vehicleDetails}`,
            statusUpdate
          );
        } 
        else if (vehicleType === 'rent') { // Changed from your second 'organization' check
          response = await axios.put(
            `http://localhost:8080/auth/rent-car/status/${formData.vehicleDetails}`,
            statusUpdate
          );
        }
    
        if (response && response.status === 200) {
          showSuccessAlert(
            'Success!',
            'Status changed successfully!'
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

  

    // Refresh the requests
    let finishedRequests;
    const data = await TravelApi.getDriverRequests();
    finishedRequests = data.filter(request => request.status === 'COMPLETED');
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

// New validation specifically for drivers
const validateDriverSection = () => {
  const newErrors: Record<string, string> = {};
  // Driver-specific validation
  return Object.keys(newErrors).length === 0;
};

 const handleRowClick = (request: TravelRequest) => {
  setSelectedRequest(request);
  setShowUserModal(true);
  setShowServiceModal(false);
  setShowFuelModal(false);
};

  const handleGoToServiceForm = () => {
    setShowUserModal(false);
    setShowServiceModal(true);
  };

  const closeModals = () => {
    setShowUserModal(false);
    setShowServiceModal(false);
    setShowFuelModal(false);
  };

  const isFormDisabled = actorType !== 'user' || (selectedRequest && actorType === 'user');
  const showSearchBar = (actorType === 'manager' || actorType === 'corporator' || actorType === 'driver');

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
          <button
            onClick={closeModals}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleDriverSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
              <input
                type="text"
                value={formData.serviceProviderName}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
              <input
                type="text"
                value={formData.assignedCarType}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
              <input
                type="text"
                value={formData.assignedDriver}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Details</label>
              <input
                type="text"
                value={formData.vehicleDetails}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>

            {/* Editable fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Starting Date *</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="actualStartingDate"
                  value={formData.actualStartingDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.actualStartingDate ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.actualStartingDate && (
                <p className="mt-1 text-sm text-red-500">{errors.actualStartingDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Return Date *</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="actualReturnDate"
                  value={formData.actualReturnDate}
                  onChange={handleChange}
                  min={formData.actualStartingDate}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.actualReturnDate ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.actualReturnDate && (
                <p className="mt-1 text-sm text-red-500">{errors.actualReturnDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting Kilometers *</label>
              <input
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
                type="number"
                name="endingKilometers"
                value={formData.endingKilometers}
                onChange={handleChange}
                min={formData.startingKilometers || 0}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.endingKilometers ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter ending km"
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

            {/* Updated Cargo Type */}
{/* Updated Cargo Type */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type *</label>
  <button
    type="button"
    onClick={() => setShowCargoDropdown(!showCargoDropdown)}
    className={`w-full px-4 py-2 rounded-lg border ${
      errors.cargoType ? 'border-red-500' : 'border-gray-300'
    } text-left flex justify-between items-center`}
  >
    {selectedCargoTypes.length > 0 
      ? selectedCargoTypes.join(', ')
      : 'Select cargo types'}
    <FiChevronDown className={`transition-transform ${showCargoDropdown ? 'transform rotate-180' : ''}`} />
  </button>
  
  {showCargoDropdown && (
    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-2">
      {cargoTypes.map(type => (
        <div key={type} className="flex items-center p-2 hover:bg-gray-100 rounded">
          <input
            type="checkbox"
            id={`cargo-${type}`}
            checked={selectedCargoTypes.includes(type)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCargoTypes([...selectedCargoTypes, type]);
              } else {
                setSelectedCargoTypes(selectedCargoTypes.filter(t => t !== type));
              }
              // Clear error when selecting
              if (errors.cargoType) {
                setErrors(prev => ({ ...prev, cargoType: '' }));
              }
            }}
            className="mr-2"
          />
          <label htmlFor={`cargo-${type}`} className="cursor-pointer">
            {type}
          </label>
        </div>
      ))}
    </div>
  )}
  {errors.cargoType && (
    <p className="mt-1 text-sm text-red-500">{errors.cargoType}</p>
  )}
</div>

{/* Number of Passengers */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Passengers *</label>
  <input
    type="number"
    name="numberOfPassengers"
    value={formData.travelers.filter(t => t.trim()).length}
    readOnly
    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
  />
</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Weight (kg) *</label>
              <input
                type="number"
                name="cargoWeight"
                value={formData.cargoWeight}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.cargoWeight ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter weight in kg"
                min="0"
                step="0.1"
              />
              {errors.cargoWeight && (
                <p className="mt-1 text-sm text-red-500">{errors.cargoWeight}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
          {/* Starting Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Place *</label>
            <input
              type="text"
              name="startingPlace"
              value={formData.startingPlace}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.startingPlace ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter starting location"
              maxLength={100}
            />
            {errors.startingPlace && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.startingPlace}
              </p>
            )}
          </div>
  
          {/* Destination Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Place *</label>
            <input
              type="text"
              name="destinationPlace"
              value={formData.destinationPlace}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.destinationPlace ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter destination"
              maxLength={100}
            />
            {errors.destinationPlace && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.destinationPlace}
              </p>
            )}
          </div>
  
          {/* Travelers */}
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
  
          {/* Travel Reason */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Travel *</label>
            <textarea
              name="travelReason"
              value={formData.travelReason}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.travelReason ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter reason for travel"
              maxLength={500}
              rows={3}
            />
            {errors.travelReason && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.travelReason}
              </p>
            )}
          </div>
  
          {/* Car Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Car Type</label>
            <select
              name="carType"
              value={formData.carType}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${isFormDisabled ? 'bg-gray-50' : ''} border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            >
              <option value="">Select car type</option>
              {carTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
  
          {/* Travel Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Distance (km)</label>
            <input
              type="number"
              name="travelDistance"
              value={formData.travelDistance}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.travelDistance ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter distance in kilometers"
              min="0"
              step="0.01"
            />
            {errors.travelDistance && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.travelDistance}
              </p>
            )}
          </div>
  
          {/* Starting Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date *</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="startingDate"
                value={formData.startingDate}
                onChange={handleChange}
                disabled={isFormDisabled}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.startingDate ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              />
            </div>
            {errors.startingDate && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.startingDate}
              </p>
            )}
          </div>
  
          {/* Return Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                disabled={isFormDisabled}
                min={formData.startingDate || new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.returnDate ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              />
            </div>
            {errors.returnDate && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.returnDate}
              </p>
            )}
          </div>
  
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.department}
              </p>
            )}
          </div>
  
          {/* Job Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Status *</label>
            <select
              name="jobStatus"
              value={formData.jobStatus}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.jobStatus ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            >
              <option value="">Select status</option>
              {jobStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.jobStatus && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.jobStatus}
              </p>
            )}
          </div>
  
          {/* Claimant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Claimant Name *</label>
            <input
              type="text"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.claimantName ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter claimant's name"
              maxLength={50}
            />
            {errors.claimantName && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.claimantName}
              </p>
            )}
          </div>
  
          {/* Team Leader Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader Name *</label>
            <input
              type="text"
              name="teamLeaderName"
              value={formData.teamLeaderName}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.teamLeaderName ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter team leader's name"
              maxLength={50}
            />
            {errors.teamLeaderName && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.teamLeaderName}
              </p>
            )}
          </div>
  
          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${errors.paymentType ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            >
              <option value="">Select payment type</option>
              <option value="fuel">Fuel</option>
              <option value="cash">Cash</option>
            </select>
            {errors.paymentType && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.paymentType}
              </p>
            )}
          </div>
  
          {/* Approvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
            <input
              type="text"
              name="approvement"
              value={formData.approvement}
              onChange={handleChange}
              disabled={isFormDisabled}
              className={`w-full px-4 py-3 rounded-lg border ${isFormDisabled ? 'bg-gray-50' : ''} border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter approval status"
              maxLength={100}
            />
            {errors.approvement && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.approvement}
              </p>
            )}
          </div>
  
          {/* Conditional Account Number Field */}
          {formData.paymentType === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-4 py-3 rounded-lg border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Enter account number"
                maxLength={20}
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.accountNumber}
                </p>
              )}
            </div>
          )}
        </div>
  
        {/* Submit Button for User Section */}
        <motion.div className="mt-8">
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
                {requestId ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                {requestId ? 'Update' : 'Submit'}
              </>
            )}
          </motion.button>
        </motion.div>
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
            <RequestsTable
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
              {actorType === 'manager' ? 'Manage Travel Requests' : 
               actorType === 'corporator' ? 'Review Travel Requests' : 
               'Travel Requests'}
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
  
          <RequestsTable
            requests={filteredRequests}
            actorType={actorType}
            onRowClick={handleRowClick}
            onStatusChange={actorType === 'corporator' ? handleStatusChange : undefined}
          />
          
          <AnimatePresence>
            {showUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
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
                        {/* Starting Place */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Starting Place *</label>
                          <input
                            type="text"
                            name="startingPlace"
                            value={formData.startingPlace}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.startingPlace ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            placeholder="Enter starting location"
                            maxLength={100}
                          />
                          {errors.startingPlace && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.startingPlace}
                            </p>
                          )}
                        </div>
  
                        {/* Destination Place */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Destination Place *</label>
                          <input
                            type="text"
                            name="destinationPlace"
                            value={formData.destinationPlace}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.destinationPlace ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            placeholder="Enter destination"
                            maxLength={100}
                          />
                          {errors.destinationPlace && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.destinationPlace}
                            </p>
                          )}
                        </div>
  
                        {/* Travelers */}
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
  
                        {/* Travel Reason */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Travel *</label>
                          <textarea
                            name="travelReason"
                            value={formData.travelReason}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.travelReason ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            placeholder="Enter reason for travel"
                            maxLength={500}
                            rows={3}
                          />
                          {errors.travelReason && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.travelReason}
                            </p>
                          )}
                        </div>
  
                        {/* Car Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Car Type</label>
                          <select
                            name="carType"
                            value={formData.carType}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${isFormDisabled ? 'bg-gray-50' : ''} border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                          >
                            <option value="">Select car type</option>
                            {carTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
  
                        {/* Travel Distance */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Distance (km)</label>
                          <input
                            type="number"
                            name="travelDistance"
                            value={formData.travelDistance}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.travelDistance ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            placeholder="Enter distance in kilometers"
                            min="0"
                            step="0.01"
                          />
                          {errors.travelDistance && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.travelDistance}
                            </p>
                          )}
                        </div>
  
                        {/* Starting Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date *</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="date"
                              name="startingDate"
                              value={formData.startingDate}
                              onChange={handleChange}
                              disabled={isFormDisabled}
                              min={new Date().toISOString().split('T')[0]}
                              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.startingDate ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            />
                          </div>
                          {errors.startingDate && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.startingDate}
                            </p>
                          )}
                        </div>
  
                        {/* Return Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="date"
                              name="returnDate"
                              value={formData.returnDate}
                              onChange={handleChange}
                              disabled={isFormDisabled}
                              min={formData.startingDate || new Date().toISOString().split('T')[0]}
                              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.returnDate ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            />
                          </div>
                          {errors.returnDate && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.returnDate}
                            </p>
                          )}
                        </div>
  
                        {/* Department */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                          >
                            <option value="">Select department</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                          {errors.department && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.department}
                            </p>
                          )}
                        </div>
  
                        {/* Job Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Status *</label>
                          <select
                            name="jobStatus"
                            value={formData.jobStatus}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.jobStatus ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                          >
                            <option value="">Select status</option>
                            {jobStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          {errors.jobStatus && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.jobStatus}
                            </p>
                          )}
                        </div>
  
                        {/* Claimant Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Claimant Name *</label>
                          <input
                            type="text"
                            name="claimantName"
                            value={formData.claimantName}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.claimantName ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            placeholder="Enter claimant's name"
                            maxLength={50}
                          />
                          {errors.claimantName && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.claimantName}
                            </p>
                          )}
                        </div>
  
                        {/* Team Leader Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader Name *</label>
                          <input
                            type="text"
                            name="teamLeaderName"
                            value={formData.teamLeaderName}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.teamLeaderName ? 'border-red-500' : 'border-gray-300'} ${isFormDisabled ? 'bg-gray-50' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            placeholder="Enter team leader's name"
                            maxLength={50}
                          />
                          {errors.teamLeaderName && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <FiAlertCircle className="mr-1" /> {errors.teamLeaderName}
                            </p>
                          )}
                        </div>
  
                        {/* Approvement */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                          <input
                            type="text"
                            name="approvement"
                            value={formData.approvement}
                            onChange={handleChange}
                            disabled={isFormDisabled}
                            className={`w-full px-4 py-3 rounded-lg border ${isFormDisabled ? 'bg-gray-50' : ''} border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                            placeholder="Enter approval status"
                            maxLength={100}
                          />
                          {errors.approvement && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                <FiAlertCircle className="mr-1" /> {errors.approvement}
                            </p>
                            )}
                        </div>
  
                      </div>
                          
                      {/* Go Button for Manager */}
                      {actorType === 'manager' && selectedRequest?.status === 'APPROVED' && (
                        <motion.div className="mt-8">
                          <motion.button
                            type="button"
                            onClick={handleGoToServiceForm}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center px-6 py-2 rounded-lg bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-medium transition-all"
                          >
                            Continue
                            <FiArrowRight className="mr-2" />
                            
                          </motion.button>
                        </motion.div>
                      )}
  
                      {/* Approval Buttons for Corporator */}
                      {actorType === 'corporator' && selectedRequest && (
                        <div className="mt-8 flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={() => handleStatusChange(selectedRequest.id, 'APPROVED')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isApproving}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                              isApproving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#3c8dbc] hover:bg-[#367fa9]'
                            }`}
                          >
                            <FiCheckCircle className="mr-2" />
                            Approve
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleStatusChange(selectedRequest.id, 'REJECTED')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isApproving}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                              isApproving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            <FiAlertCircle className="mr-2" />
                            Reject
                          </motion.button>
                        </div>
                      )}
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
  
          {/* Service Provider Modal */}
          <AnimatePresence>
            {showServiceModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FiTool className="mr-2" />
                        Car Assignment Form
                      </h3>
                      <button
                        onClick={closeModals}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiX className="text-gray-500" />
                      </button>
                    </div>
  
                    {/* API Error */}
                    {apiError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        <div className="flex items-center">
                          <FiAlertCircle className="mr-2" />
                          <span>{apiError}</span>
                        </div>
                      </div>
                    )}
  
{/* Form Start */}
<form onSubmit={handleServiceSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

   

    {/* Plate Number Search */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Plate Number
      </label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={plateSearchQuery}
          readOnly={!!formData.vehicleDetails}
          onChange={(e) => setPlateSearchQuery(e.target.value)}
          placeholder="Start typing plate number..."
          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
            errors.vehicleDetails ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />

        {/* Clear selection button */}
        {formData.vehicleDetails && (
          <button
            type="button"
            onClick={() => {
              setPlateSearchQuery('');
              setFormData(prev => ({
                ...prev,
                vehicleDetails: '',
                assignedDriver: '',
                assignedCarType: '',
                vehicleType: '',
              }));
            }}
            className="absolute right-3 top-3 p-1 text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        {/* Dropdown list */}
        {plateSearchQuery && !formData.vehicleDetails && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.plate}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      vehicleDetails: vehicle.plate,
                      assignedDriver: vehicle.driver,
                      assignedCarType: vehicle.carType
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
                No vehicles found matching "{plateSearchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      {errors.vehicleDetails && (
        <p className="mt-1 text-sm text-red-500">{errors.vehicleDetails}</p>
      )}
    </div>

    {/* Car Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Car Type *
      </label>
      <input
        type="text"
        name="assignedCarType"
        value={formData.assignedCarType}
        readOnly
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
        placeholder="Auto-filled from plate selection"
      />
      {errors.assignedCarType && (
        <p className="mt-1 text-sm text-red-500">{errors.assignedCarType}</p>
      )}
    </div>

    {/* Driver Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Driver Name *
      </label>
      <input
        type="text"
        name="assignedDriver"
        placeholder="Auto-filled from plate selection"
        value={formData.assignedDriver}
        readOnly
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
      />
      {errors.assignedDriver && (
        <p className="mt-1 text-sm text-red-500">{errors.assignedDriver}</p>
      )}
    </div>

     {/* Service Provider */}
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Service Provider *
      </label>
      <input
        type="text"
        name="serviceProviderName"
        value={formData.serviceProviderName}
        onChange={handleChange}
        className={`w-full px-4 py-2 rounded-lg border ${
          errors.serviceProviderName ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        placeholder="Company name"
      />
      {errors.serviceProviderName && (
        <p className="mt-1 text-sm text-red-500">{errors.serviceProviderName}</p>
      )}
    </div>

  </div> {/* End Grid */}

  {/* Submit Button */}
  <div className="mt-6 flex justify-end">
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
              </motion.div>
            )}
          </AnimatePresence>
  
          {/* Fuel Request Modal */}
          <AnimatePresence>
            {showFuelModal && selectedRequest && (
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
                      <button
                        onClick={closeModals}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FiX className="text-gray-500" />
                      </button>
                    </div>
                    <FuelRequestForm 
                      travelRequestId={selectedRequest.id}
                      defaultValues={{
                        travelers: selectedRequest.travelers.map(t => t.name), // Extract just the names
                        startingPlace: selectedRequest.startingPlace,
                        destinationPlace: selectedRequest.destinationPlace,
                        vehicleType: formData.assignedCarType,
                        licensePlate: formData.vehicleDetails,
                        assignedDriver: formData.assignedDriver,
                        travelDistance: formData.kmDifference ? Number(formData.kmDifference) : 0,
                        tripExplanation: formData.travelReason,
                        claimantName: formData.claimantName,
                        serviceNumber: `TR-${selectedRequest.id}`,
                        startingDate: formData.actualStartingDate || formData.startingDate,
                        endingDate: formData.actualReturnDate || formData.returnDate
                      }}
                      onSuccess={() => {
                        closeModals();
                        // Refresh table data
                        TravelApi.getRequests(actorType).then(data => {
                          setRequests(data);
                          setFilteredRequests(data);
                        });
                      }} 
                    />
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