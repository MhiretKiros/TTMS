
"use client";
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { FuelRequest } from '../../types/fuelTypes';
import { TravelApi, TravelRequest } from '../../api/handlers';
import { SearchBar } from '../SearchBar';
import styles from './styles.module.css';
import { 
  FiAlertCircle, FiMapPin, FiSend, FiCalendar, FiCheckCircle, 
  FiUser, FiUsers, FiTool, FiPlus, FiMinus, FiTruck, FiPackage,
  FiSearch, FiArrowRight, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/app/contexts/NotificationContext';


interface FuelReturnFormProps {
  travelRequestId?: number;
  defaultValues?: {
    startingPlace?: string;
    destinationPlace?: string;
    vehicleType?: string;
    licensePlate?: string;
    assignedDriver?: string;
    tripExplanation?: string;
    claimantName?: string;
    serviceNumber?: string;
    actualStartingDate?: Date;
    actualReturnDate?: Date;
    startingKilometrs?: number;
    endingKilometrs?: number;
    kmDifference?: number;
    assemblerName?: string;

  };
  onSuccess: () => void;
}

export const FuelReturnForm = ({ 
  travelRequestId, 
  defaultValues, 
  onSuccess
}: FuelReturnFormProps) => {
  const [formData, setFormData] = useState({
    workLocation: defaultValues?.startingPlace || '',
    destinationPlace: defaultValues?.destinationPlace || '',
    vehicleType: defaultValues?.vehicleType || '',
    licensePlate: defaultValues?.licensePlate || '',
    assignedDriver: defaultValues?.assignedDriver || '',
    claimantName: defaultValues?.claimantName || '',
    serviceNumber: defaultValues?.serviceNumber || '',
    actualStartingDate: defaultValues?.actualStartingDate || new Date(),
    actualReturnDate: defaultValues?.actualReturnDate || new Date(),
    startingKilometrs: defaultValues?.startingKilometrs || 0,
    endingKilometrs: defaultValues?.endingKilometrs || 0,
    kmDifference: defaultValues?.kmDifference || 0,
    assemblerName:'',
    tripExplanation: ''

  });

    const { addNotification } = useNotification();
  const [apiError, setApiError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadOnly = !!defaultValues;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setIsSubmitting(true);
    setApiError('');
  
    // Check if travelRequestId is available before calling the API
    if (!travelRequestId) {
      setApiError('Request ID is required');
      setIsSubmitting(false);
      return;
    }
  
    try {
      // Pass the travelRequestId along with the other form data
      await TravelApi.fuelReturn({
        id: travelRequestId, // Pass the correct ID here
        assemblerName: formData.assemblerName,
        tripExplanation: formData.tripExplanation,
        status: 'SUCCESED',
      });
  
      showSuccessAlert('Success!', 'Fuel request submitted successfully');
      onSuccess();

      try {
      await addNotification(
        `New Fule Return Added`,
        `/tms-modules/admin/request-management`,
        'NEZEK'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }

    } catch (error: any) {
      setApiError(error.message || 'Failed to save service information');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-1">
      <form onSubmit={handleFuelSubmit} className="space-y-4">
        {/* Service Number and Claimant Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Number</label>
            <input
              type="text"
              name="serviceNumber"
              value={formData.serviceNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Claimant Name</label>
            <input
              type="text"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
        </div>

        {/* Travel Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Starting Date</label>
            <input
              type="date"
              name="actualStartingDate"
              value={
                formData.actualStartingDate
                  ? new Date(formData.actualStartingDate).toISOString().split('T')[0]
                  : ''
              }              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ending Date</label>
            <input
              type="date"
              name="actualReturnDate"
              value={
                formData.actualReturnDate
                  ? new Date(formData.actualReturnDate).toISOString().split('T')[0]
                  : ''
              }  
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Starting Place</label>
            <input
              type="text"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Destination Plase</label>
            <input
              type="text"
              name="destinationPlace"
              value={formData.destinationPlace}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
        </div>

           {/* Travel Dates */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Starting Kilometrs</label>
            <input
              type="number"
              name="startingKilometrs"
              value={formData.startingKilometrs}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ending Kilometrs</label>
            <input
              type="number"
              name="endingKilometrs"
              value={formData.endingKilometrs}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
        </div>

          {/* Travel Distance and Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kilometer Difference (km)</label>
            <input
              type="number"
              name="travelDistance"
              value={formData.kmDifference}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
              min="0"
            />
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <input
              type="text"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Plate</label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Driver</label>
            <input
              type="text"
              name="assignedDriver"
              value={formData.assignedDriver}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
        </div>

       {/* Editable Fields */}

        <div>
          <label className="block text-sm font-medium text-gray-700">Your Legend</label>
          <textarea
            name="tripExplanation"
            value={formData.tripExplanation}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border border-gray-300"
            rows={3}
            placeholder="Type your legend if you have"
            
          />
        </div>

        {/* Editable Assembler Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Assembler Name *</label>
          <input
            type="text"
            name="assemblerName"
            value={formData.assemblerName}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border border-gray-300"
            required
            placeholder="Enter assembler's full name"
          />
        </div>

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
                              Submiting...
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="mr-2" />
                              Submit
                            </>
                          )}
                        </motion.button>
      </form>
    </div>
  );
}; 