"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiAlertCircle, FiMapPin, FiSend, FiCalendar, FiCheckCircle, 
  FiUser, FiUsers, FiTool, FiPlus, FiMinus, FiTruck, FiPackage,
  FiSearch
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TravelApi, TravelRequest } from '../api/handlers';
import RequestsTable from './RequestsTable';

const carTypes = ["Sedan", "SUV", "Minivan", "Truck", "Luxury", "Other"];
const cargoTypes = ["Documents", "Equipment", "Fragile", "Hazardous", "Perishable", "Other"];
const departments = ["Software Development", "Marketing", "Sales", "Human Resources", "Operations", "Finance"];
const jobStatuses = ["Project", "Maintenance", "Emergency", "Meeting", "Training", "Other"];

interface TravelRequestFormProps {
  requestId?: number;
  onSuccess: () => void;
  actorType: 'user' | 'manager' | 'corporator';
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
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  });

  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TravelRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await TravelApi.getRequests(actorType);
        setRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Failed to load requests');
      }
    };
    loadRequests();

    if (requestId) {
      const loadRequestData = async () => {
        try {
          const request = await TravelApi.getRequestById(requestId);
          if (request) {
            setSelectedRequest(request);
            populateFormData(request);
          }
        } catch (error) {
          setApiError(error instanceof Error ? error.message : 'Failed to load request data');
        }
      };
      loadRequestData();
    }
  }, [requestId, actorType]);

  useEffect(() => {
    if (selectedRequest) {
      populateFormData(selectedRequest);
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRequests(requests);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = requests.filter(request => 
        request.startingPlace.toLowerCase().includes(query) ||
        request.destinationPlace.toLowerCase().includes(query) ||
        request.claimantName.toLowerCase().includes(query) ||
        request.travelReason.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query) ||
        request.travelers.some(t => t.name.toLowerCase().includes(query))
      );
      setFilteredRequests(filtered);
    }
  }, [searchQuery, requests]);

  const populateFormData = (request: TravelRequest) => {
    setFormData({
      startingPlace: request.startingPlace,
      destinationPlace: request.destinationPlace,
      travelers: request.travelers.map(t => t.name),
      travelReason: request.travelReason,
      carType: request.carType || '',
      travelDistance: request.travelDistance?.toString() || '',
      startingDate: formatDateForInput(request.startingDate),
      returnDate: request.returnDate ? formatDateForInput(request.returnDate) : '',
      department: request.department,
      jobStatus: request.jobStatus,
      claimantName: request.claimantName,
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
      numberOfPassengers: request.numberOfPassengers?.toString() || '',
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
      'cargoWeight',
      'numberOfPassengers',
      'cargoType'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').trim();
        newErrors[field] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
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
      setSuccessMessage(`Request ${status.toLowerCase()} successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsApproving(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUserSection()) return;
  
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
      
      setSuccessMessage(`Travel request ${requestId ? 'updated' : 'submitted'} successfully!`);
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setApiError(error.message || `Failed to ${requestId ? 'update' : 'submit'} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateServiceSection()) return;
  
    setIsSubmitting(true);
    setApiError('');
    setSuccessMessage('');
  
    try {
      const serviceData = {
        id: selectedRequest?.id,
        serviceProviderName: formData.serviceProviderName,
        assignedDriver: formData.assignedDriver,
        actualStartingDate: formData.actualStartingDate 
          ? `${formData.actualStartingDate}T00:00:00`
          : null,
        actualReturnDate: formData.actualReturnDate 
          ? `${formData.actualReturnDate}T00:00:00`
          : null,
        vehicleDetails: formData.vehicleDetails,
        assignedCarType: formData.assignedCarType,
        startingKilometers: parseFloat(formData.startingKilometers),
        endingKilometers: parseFloat(formData.endingKilometers),
        cargoWeight: parseFloat(formData.cargoWeight),
        numberOfPassengers: parseInt(formData.numberOfPassengers),
        cargoType: formData.cargoType
      };
  
      const result = await TravelApi.completeTravelRequest(serviceData);
      
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest?.id ? { ...req, ...result } : req
      ));
      setSelectedRequest(prev => prev ? { ...prev, ...result } : null);
      
      setSuccessMessage('Travel request completed successfully!');
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      console.error('Error:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to complete request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRowClick = (request: TravelRequest) => {
    setSelectedRequest(request);
  };

  const isFormDisabled = actorType !== 'user' || (selectedRequest && actorType === 'user');
  const showServiceSection = actorType === 'manager' && selectedRequest?.status === 'APPROVED';
  const showSearchBar = (actorType === 'manager' || actorType === 'corporator') && (!requestId || selectedRequest);
 
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {actorType === 'user' ? (requestId ? 'Edit Travel Request' : 'New Travel Request') :
          actorType === 'manager' ? 'Manage Travel Request' : 'Review Travel Requests'}
        </h2>
        
        {showSearchBar && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ borderRadius: '9999px' }} // Oval shape
            />
          </motion.div>
        )}
      </div>
      
      {apiError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
        >
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{apiError}</span>
          </div>
        </motion.div>
      )}

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg"
        >
          <div className="flex items-center">
            <FiCheckCircle className="mr-2" />
            <span>{successMessage}</span>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleUserSubmit} className="space-y-8">
        {/* USER SECTION */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <div className="absolute -left-1 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
          
          <div className="ml-6">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-blue-50">
                <FiUser className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 ml-3">Travel Request Information</h3>
            </div>

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

              {/* Travelers (multiple) */}
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

              {/* Reason for Travel */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Distance (km)</label>
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

            {/* Submit Button for User Section */}
            {actorType === 'user' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center px-6 py-3 rounded-lg text-white font-medium transition-all ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
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
                      {requestId ? 'Update Travel Request' : 'Submit Travel Request'}
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* SERVICE PROVIDER SECTION (only for managers with approved requests) */}
        {showServiceSection && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative mt-12"
          >
            <div className="absolute -left-1 top-0 h-full w-1 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
            
            <div className="ml-6">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-lg bg-gray-50">
                  <FiTool className="text-gray-600 text-xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 ml-3">Service Provider Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Provider Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
                  <input
                    type="text"
                    name="serviceProviderName"
                    value={formData.serviceProviderName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.serviceProviderName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    placeholder="Enter service provider name"
                    maxLength={100}
                  />
                  {errors.serviceProviderName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.serviceProviderName}
                    </p>
                  )}
                </div>

                {/* Assigned Car Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Car Type</label>
                  <select
                    name="assignedCarType"
                    value={formData.assignedCarType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.assignedCarType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                  >
                    <option value="">Select car type</option>
                    {carTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.assignedCarType && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.assignedCarType}
                    </p>
                  )}
                </div>

                {/* Assigned Driver */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    name="assignedDriver"
                    value={formData.assignedDriver}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.assignedDriver ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    placeholder="Enter driver's name"
                    maxLength={50}
                  />
                  {errors.assignedDriver && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.assignedDriver}
                    </p>
                  )}
                </div>

                {/* Vehicle Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Details</label>
                  <input
                    type="text"
                    name="vehicleDetails"
                    value={formData.vehicleDetails}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.vehicleDetails ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    placeholder="Enter vehicle details"
                    maxLength={100}
                  />
                  {errors.vehicleDetails && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.vehicleDetails}
                    </p>
                  )}
                </div>

                {/* Actual Starting Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Start Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="actualStartingDate"
                      value={formData.actualStartingDate}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.actualStartingDate ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    />
                  </div>
                  {errors.actualStartingDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.actualStartingDate}
                    </p>
                  )}
                </div>

                {/* Actual Return Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Return Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="actualReturnDate"
                      value={formData.actualReturnDate}
                      onChange={handleChange}
                      min={formData.actualStartingDate}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.actualReturnDate ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    />
                  </div>
                  {errors.actualReturnDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.actualReturnDate}
                    </p>
                  )}
                </div>

                {/* Starting Kilometers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starting Kilometers</label>
                  <input
                    type="number"
                    name="startingKilometers"
                    value={formData.startingKilometers}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.startingKilometers ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    placeholder="Enter starting km"
                    min="0"
                    step="1"
                  />
                  {errors.startingKilometers && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.startingKilometers}
                    </p>
                  )}
                </div>

                {/* Ending Kilometers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ending Kilometers</label>
                  <input
                    type="number"
                    name="endingKilometers"
                    value={formData.endingKilometers}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.endingKilometers ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    placeholder="Enter ending km"
                    min="0"
                    step="1"
                  />
                  {errors.endingKilometers && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.endingKilometers}
                    </p>
                  )}
                </div>

                {/* KM Difference (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance Traveled (km)</label>
                  <input
                    type="text"
                    name="kmDifference"
                    value={formData.kmDifference || ''}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800"
                    placeholder="Auto-calculated"
                  />
                </div>

                {/* Cargo Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
                  <select
                    name="cargoType"
                    value={formData.cargoType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.cargoType ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                  >
                    <option value="">Select cargo type</option>
                    {cargoTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.cargoType && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.cargoType}
                    </p>
                  )}
                </div>

                {/* Cargo Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    name="cargoWeight"
                    value={formData.cargoWeight}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.cargoWeight ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    placeholder="Enter cargo weight"
                    min="0"
                    step="0.1"
                  />
                  {errors.cargoWeight && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.cargoWeight}
                    </p>
                  )}
                </div>

                {/* Number of Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Passengers</label>
                  <input
                    type="number"
                    name="numberOfPassengers"
                    value={formData.numberOfPassengers}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.numberOfPassengers ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800`}
                    placeholder="Enter passenger count"
                    min="1"
                    max="20"
                  />
                  {errors.numberOfPassengers && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.numberOfPassengers}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button for Service Provider Section */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <motion.button
                  type="button"
                  onClick={handleServiceSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isApproving}
                  className={`w-full flex justify-center items-center px-6 py-3 rounded-lg text-white font-medium transition-all ${
                    isApproving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isApproving ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Completing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="mr-2" />
                      Complete Trip
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </form>

      {/* Requests Table - visible to all except users creating new requests */}
      {(actorType !== 'user' || requestId) && (
        <RequestsTable
          requests={filteredRequests}
          actorType={actorType}
          onRowClick={handleRowClick}
          onStatusChange={actorType === 'corporator' ? handleStatusChange : undefined}
        />
      )}
    </motion.div>
  );
}