"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertCircle, FiMapPin, FiSend, FiCalendar, FiCheckCircle, 
  FiUser, FiUsers, FiTool, FiPlus, FiMinus, FiTruck, FiPackage,
  FiSearch, FiArrowRight, FiX, FiChevronDown 
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TravelApi, TravelRequest } from '../api/handlers';
import RequestsTable from './RequestsTable';
import { FuelRequestForm } from '../components/FuelForms/FuelRequestForm';
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

interface TravelRequestFormProps {
  requestId?: number;
  onSuccess: () => void;
  actorType: 'user' | 'manager' | 'corporator' | 'driver';
}
interface Traveler {
  name: string;
  // Add other properties if they exist
  [key: string]: any; 
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
    driverPhone: '',
    vehicleDetails: '',
    actualStartingDate: '',
    actualReturnDate: '',
    startingKilometers: '',
    endingKilometers: '',
    kmDifference: '',
    cargoType: '',
    cargoWeight: '',
    numberOfPassengers: '',
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'ASSIGNED' | 'FINISHED'| 'InspectedAndRead'| 'ENDED'| 'SUCCESED'| 'ACCEPTED',
  });

  const { addNotification } = useNotification();
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const [selectedCargoTypes, setSelectedCargoTypes] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState('' as 'car' | 'organization' | 'rent' | '');
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TravelRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  
  // Get driver name from localStorage like the Header component
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
  }

  const [vehicleSuggestions, setVehicleSuggestions] = useState<VehicleSuggestion[]>([]);
  const [plateSearchQuery, setPlateSearchQuery] = useState('');

  // Fetch vehicles data
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
            car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
            plate: v.plateNumber,
            driver: v.driverName || 'No driver assigned',
            carType: v.carType,
            type: 'car' as const
          })),
          ...(orgCarsRes.data.organizationCarList || []).filter((car: { status: string }) => 
            car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
            plate: v.plateNumber,
            driver: v.driverName || 'No driver assigned',
            carType: v.carType,
            type: 'organization' as const
          })),
          ...(rentCarsRes.data.rentCarList || []).filter((car: { status: string }) => 
            car.status.toLowerCase() === 'inspectedandready').map((v: any) => ({
            plate: v.licensePlate,
            driver: v.driverName || 'No driver assigned',
            carType: v.vehicleType,
            type: 'rent' as const
          }))
        ].filter(v => v.plate !== 'N/A');

        setVehicleSuggestions(vehicles);
      } catch (error) {
        console.error('Vehicle fetch error:', error);
      }
    };

    if (showServiceModal) fetchAllVehicles();
  }, [showServiceModal]);

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

        if (aPlate === query) return -1;
        if (bPlate === query) return 1;
        
        const aStartsWith = aPlate.startsWith(query);
        const bStartsWith = bPlate.startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (bStartsWith && !aStartsWith) return 1;
        
        return aPlate.localeCompare(bPlate);
      })
      .slice(0, 5);
  }, [plateSearchQuery, vehicleSuggestions]);

  const handlePlateSelect = (vehicle: VehicleSuggestion) => {
    setFormData(prev => ({
      ...prev,
      vehicleDetails: vehicle.plate,
      assignedDriver: vehicle.driver,
      assignedCarType: vehicle.carType,
    }));
    setVehicleType(vehicle.type);
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
          // Load all ACCEPTED requests for the current driver
          data = await TravelApi.getDriverRequests();
          data = data.filter(request => 
            request.status === 'ACCEPTED' && 
            request.assignedDriver?.toLowerCase() === driverName.toLowerCase()
          );
          setRequests(data);
          setFilteredRequests(data);
        } else {
          data = await TravelApi.getRequests(actorType);
          setRequests(data);
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
  }, [requestId, actorType, driverName]);

  useEffect(() => {
    if (selectedRequest) {
      populateFormData(selectedRequest);
    }
  }, [selectedRequest]);

const populateFormData = (request: TravelRequest) => {
  // Safely handle travelers (accepting both object with name and string)
  const getTravelerName = (traveler: { name?: string } | string | undefined): string => {
    if (!traveler) return '';
    return typeof traveler === 'string' ? traveler : traveler.name || '';
  };

  // Process travelers array
  const processedTravelers = request.travelers.map(getTravelerName);
  const passengerCount = processedTravelers.filter(name => name.trim() !== '').length.toString();

  if (actorType === 'driver') {
    setFormData(prev => ({
      ...prev,
      serviceProviderName: request.serviceProviderName || '',
      assignedCarType: request.assignedCarType || '',
      assignedDriver: request.assignedDriver || '',
      vehicleDetails: request.vehicleDetails || '',
      actualStartingDate: '',
      actualReturnDate: '',
      startingKilometers: '',
      endingKilometers: '',
      kmDifference: '',
      cargoType: request.cargoType || '',
      cargoWeight: '',
      numberOfPassengers: passengerCount,
      travelers: processedTravelers.length ? processedTravelers : ['']
    }));
    if (request.cargoType) {
      setSelectedCargoTypes(
        request.cargoType.split(',').map(t => t.trim()).filter(Boolean)
      );
    } else {
      setSelectedCargoTypes([]);
    }
  } else {
    setFormData({
      paymentType: request.paymentType || '',
      startingPlace: request.startingPlace,
      destinationPlace: request.destinationPlace,
      travelers: processedTravelers.length ? processedTravelers : [''],
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
      driverPhone: request.driverPhone || '',
      vehicleDetails: request.vehicleDetails || '',
      actualStartingDate: request.actualStartingDate ? formatDateForInput(request.actualStartingDate) : '',
      actualReturnDate: request.actualReturnDate ? formatDateForInput(request.actualReturnDate) : '',
      startingKilometers: request.startingKilometers?.toString() || '',
      endingKilometers: request.endingKilometers?.toString() || '',
      kmDifference: request.kmDifference?.toString() || '',
      cargoType: request.cargoType || '',
      cargoWeight: request.cargoWeight?.toString() || '',
      numberOfPassengers: passengerCount,
      status: request.status,
    });

    if (request.cargoType) {
      setSelectedCargoTypes(
        request.cargoType.split(',').map(t => t.trim()).filter(Boolean)
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
    // const requiredFields = [
    //   'serviceProviderName',
    //   'assignedDriver',
    //   'assignedCarType',
    //   'actualStartingDate',
    //   'startingKilometers',
    //   'endingKilometers',
    //   'cargoWeight'
    // ];
  
    // requiredFields.forEach(field => {
    //   if (!formData[field]) {
    //     const fieldName = field.replace(/([A-Z])/g, ' $1').trim();
    //     newErrors[field] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    //   }
    // });
  
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

if(status=="APPROVED"){

   try {
      await addNotification(
        `New Request Approved`,
        `/tms-modules/admin/request-management/request-field`,
        'DISTRIBUTOR'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }
}
     
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
        return;
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
  carType: formData.carType || '', // always string
  travelDistance: formData.travelDistance ? parseFloat(formData.travelDistance) : 0, // always number
  startingDate: formData.startingDate
    ? `${formData.startingDate}T00:00:00`
    : '', // always string
  returnDate: formData.returnDate
    ? `${formData.returnDate}T00:00:00`
    : '', // always string
  department: formData.department,
  jobStatus: formData.jobStatus,
  claimantName: formData.claimantName,
  teamLeaderName: formData.teamLeaderName,
  accountNumber: formData.accountNumber,
  status: 'PENDING' as
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'COMPLETED'
    | 'ASSIGNED'
    | 'FINISHED'
    | 'ENDED'
    | 'SUCCESED'
    | 'ACCEPTED',
};

      let result;
      
        result = await TravelApi.createRequest(requestData);
        setRequests(prev => [...prev, result]);
      
      showSuccessAlert(
        'Success!', 
        `Travel request ${requestId ? 'updated' : 'submitted'} successfully!`
      );

try {
      await addNotification(
        `New Request Added`,
        `/tms-modules/admin/request-management/request-field`,
        'CORPORATOR'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }

      if (actorType === 'user') {
        window.location.reload();
      } else {
        closeModals();
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
     if (!formData.driverPhone.trim()) {
      newErrors.assignedPhone = 'Driver name is required';
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
      const result = await TravelApi.updateServiceProviderInfo({
        id: selectedRequest.id,
        serviceProviderName: formData.serviceProviderName,
        assignedCarType: formData.assignedCarType,
        assignedDriver: formData.assignedDriver,
        vehicleDetails: formData.vehicleDetails,
        driverPhone: formData.driverPhone,
        //status: 'ASSIGNED'
      });

      if (!formData.vehicleDetails) {
        setErrors(prev => ({
          ...prev,
          vehicleDetails: 'Please select a vehicle from the list',
        }));
        document.getElementById('plate-search')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const validVehicleTypes = ['car', 'organization', 'rent'];
      if (!validVehicleTypes.includes(vehicleType)) {
        showSuccessAlert('Error!', 'Invalid vehicle type selected');
        return;
      }

      if (vehicleType && formData.vehicleDetails) {
        try {
          let response;
          const statusUpdate = { status: 'Field' };
    
          if (vehicleType === 'car') {
            response = await axios.put(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${formData.vehicleDetails}`,
              statusUpdate
            );
          } 
          else if (vehicleType === 'organization') {
            response = await axios.put(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/status/${formData.vehicleDetails}`,
              statusUpdate
            );
          } 
          else if (vehicleType === 'rent') {
            response = await axios.put(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status/${formData.vehicleDetails}`,
              statusUpdate
            );
          }
    
          if (response && response.status === 200) {
            showSuccessAlert(
              'Success!',
              'Car assigned successfully! Please procede the fuel request for this travel'
            );
          } else {
            showSuccessAlert('Error!', 'Status not changed successfully!');
          }
        } catch (error) {
          console.error('API Error:', error);
          showSuccessAlert('Error!', 'Failed to update status. Please try again.');
        }
      } else {
        showSuccessAlert('Error!', 'Missing vehicle type or details!');
      }
      
      const updatedRequests = await TravelApi.getRequests(actorType);
      setRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
      
      setShowServiceModal(false);
      setShowFuelModal(true);
  
    } catch (error: any) {
      setApiError(error.message || 'Failed to save service information');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const completionData = {
        id: selectedRequest.id,
        serviceProviderName: formData.serviceProviderName,
        assignedDriver: formData.assignedDriver,
        driverPhone: formData.driverPhone,
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
        cargoType: selectedCargoTypes.join(', '),
        cargoWeight: parseFloat(formData.cargoWeight),
        numberOfPassengers: formData.travelers.filter(t => t.trim()).length,
        //status: 'FINISHED'
      };

      await TravelApi.completeTravelRequest(completionData);

      try {
      await addNotification(
        `New Driver Submit Added`,
        `/tms-modules/admin/request-management/request-field`,
        'DISTRIBUTOR'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }

      if (vehicleType && formData.vehicleDetails) {
        try {
          let response;
          const statusUpdate = { status: 'InspectedAndReady' };
    
          if (vehicleType === 'car') {
            response = await axios.put(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${formData.vehicleDetails}`,
              statusUpdate
            );
          } 
          else if (vehicleType === 'organization') {
            response = await axios.put(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/status/${formData.vehicleDetails}`,
              statusUpdate
            );
          } 
          else if (vehicleType === 'rent') {
            response = await axios.put(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status/${formData.vehicleDetails}`,
              statusUpdate
            );
          }
    
          if (response && response.status === 200) {
            showSuccessAlert('Success!', 'Status changed successfully!');
          } else {
            showSuccessAlert('Error!', 'Status not changed successfully!');
          }
        } catch (error) {
          console.error('API Error:', error);
          showSuccessAlert('Error!', 'Failed to update status. Please try again.');
        }
      } else {
        showSuccessAlert('Error!', 'Missing vehicle type or details!');
      }

      let finishedRequests;
      const data = await TravelApi.getDriverRequests();
      finishedRequests = data.filter(request => 
        request.status === 'ACCEPTED' && 
        request.assignedDriver?.toLowerCase() === driverName.toLowerCase()
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
  const isFormDisabled = actorType !== 'user' || (selectedRequest !== null && actorType === 'user');
  const showSearchBar = (actorType === 'manager' || actorType === 'corporator');

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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            My ACCEPTED Trips
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
                      You don't have any ACCEPTED trips assigned to you.
                    </p>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mx-auto text-3xl mb-4 text-green-500" />
                    <h4 className="font-medium text-lg mb-2">No Matching Trips</h4>
                    <p className="mb-3">
                      No ACCEPTED trips found for your name.
                    </p>
                  </>
                )}
              </div>
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
  
                      {actorType === 'corporator' && selectedRequest && (
                        <div className="mt-8 flex space-x-4">
                          <motion.button
                            type="button"
                            onClick={() => {
                            if (selectedRequest && selectedRequest.id !== undefined) {
                           handleStatusChange(selectedRequest.id, 'APPROVED');
                           }
                            }}
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
  onClick={() => {
    if (selectedRequest && selectedRequest.id !== undefined) {
      handleStatusChange(selectedRequest.id, 'REJECTED');
    }
  }}
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
  
                    {apiError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        <div className="flex items-center">
                          <FiAlertCircle className="mr-2" />
                          <span>{apiError}</span>
                        </div>
                      </div>
                    )}
  
                    <form onSubmit={handleServiceSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver Name *
                          </label>
                          <input
                            type="text"
                            name="assignedDriver"
                            placeholder="Auto-filled from plate selection"
                            value={formData.assignedDriver}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                          />
                          {errors.assignedDriver && (
                            <p className="mt-1 text-sm text-red-500">{errors.assignedDriver}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver Phone *
                          </label>
                          <input
                            type="text"
                            name="driverPhone"
                            placeholder="Auto-filled from plate selection"
                            value={formData.driverPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                          />
                          {errors.driverPhone && (
                            <p className="mt-1 text-sm text-red-500">{errors.driverPhone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Distributor Manager *
                          </label>
                          <input
                            type="text"
                            name="serviceProviderName"
                            value={formData.serviceProviderName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              errors.serviceProviderName ? 'border-red-500' : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Distributor manager name"
                          />
                          {errors.serviceProviderName && (
                            <p className="mt-1 text-sm text-red-500">{errors.serviceProviderName}</p>
                          )}
                        </div>
                      </div>

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
                        travelers: selectedRequest.travelers,
                        startingPlace: selectedRequest.startingPlace,
                        destinationPlace: selectedRequest.destinationPlace,
                        vehicleType: selectedRequest.assignedCarType,
                        licensePlate: selectedRequest.vehicleDetails,
                        assignedDriver: selectedRequest.assignedDriver,
                        travelDistance: selectedRequest.travelDistance,
                        tripExplanation: selectedRequest.travelReason,
                        claimantName: selectedRequest.claimantName,
                        serviceNumber: `FR-${selectedRequest.id}`,
                        actualStartingDate: formData.actualStartingDate,
                        actualReturnDate: formData.actualReturnDate,
                        accountNumber: selectedRequest.accountNumber,
                      }}
                      onSuccess={() => {
                        closeModals();
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