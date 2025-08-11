"use client";

import { useState, useEffect } from 'react';
import { TravelApi, TravelRequest } from '../../api/handlers';
import { SearchBar } from '../SearchBar';
import styles from './styles.module.css';
import Swal from 'sweetalert2';
import { 
  FiAlertCircle, FiMapPin, FiSend, FiCalendar, FiCheckCircle, 
  FiUser, FiUsers, FiTool, FiPlus, FiMinus, FiTruck, FiPackage,
  FiSearch, FiArrowRight, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/app/contexts/NotificationContext';

interface Traveler {
  id?: number;
  name: string;
}

interface FuelRequestFormProps {
  travelRequestId?: number;
  defaultValues?: {
    travelers: Traveler[] | string[]; // Accept both object and string arrays
    startingPlace?: string;
    destinationPlace?: string;
    vehicleType?: string;
    licensePlate?: string;
    assignedDriver?: string;
    travelDistance?: number;
    tripExplanation?: string;
    claimantName?: string;
    serviceNumber?: string;
    actualStartingDate?: string;
    actualReturnDate?: string;
    accountNumber?: string;
    paymentType?: string;
  };
  onSuccess: () => void;
}

export const FuelRequestForm = ({ 
  travelRequestId, 
  defaultValues, 
  onSuccess
}: FuelRequestFormProps) => {
  const normalizeTravelers = (travelers: Traveler[] | string[] | undefined) => {
    if (!travelers) return [''];
    if (typeof travelers[0] === 'string') return travelers as string[];
    return (travelers as Traveler[]).map(t => t.name);
  };
  const [formData, setFormData] = useState({
    travelers: normalizeTravelers(defaultValues?.travelers),
    workLocation: defaultValues?.startingPlace || '',
    destinationPlace: defaultValues?.destinationPlace || '',
    vehicleType: defaultValues?.vehicleType || '',
    licensePlate: defaultValues?.licensePlate || '',
    assignedDriver: defaultValues?.assignedDriver || '',
    travelDistance: defaultValues?.travelDistance || 0,
    tripExplanation: defaultValues?.tripExplanation || '',
    claimantName: defaultValues?.claimantName || '',
    serviceNumber: defaultValues?.serviceNumber || '',
    actualStartingDate: defaultValues?.actualStartingDate || new Date(),
    actualReturnDate: defaultValues?.actualReturnDate || new Date(),
    confirmation:false,
    authorizerName: '',
    accountNumber: defaultValues?.accountNumber || '',
    paymentType: defaultValues?.accountNumber ? 'cash' : 'fuel', // New field

  });

  const { addNotification } = useNotification();
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [apiError, setApiError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadOnly = !!defaultValues;

  const handleTravelerChange = (index: number, value: string) => {
    const newTravelers = [...formData.travelers];
    newTravelers[index] = value;
    setFormData(prev => ({ ...prev, travelers: newTravelers }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    let response = await TravelApi.fuelRequest({
      id: travelRequestId, // Pass the correct ID here
      authorizerName: formData.authorizerName,
      status: 'COMPLETED',
      assignedCarType: formData.vehicleType || '',

    });
if(response){
  
  showSuccessAlert('Success!', 'Fuel request submitted successfully');
    onSuccess();
}

try {
      await addNotification(
        `New Fule Request Added`,
        `/tms/admin/request-management`,
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
              }              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
            />
          </div>
        </div>

        {/* Travelers Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Travelers</label>
          {formData.travelers.map((traveler, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={traveler}
                onChange={(e) => handleTravelerChange(index, e.target.value)}
                className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
                readOnly={isReadOnly}
              />
            </div>
          ))}
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Location</label>
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
            <label className="block text-sm font-medium text-gray-700">Destination</label>
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

        {/* Travel Distance and Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Travel Distance (km)</label>
            <input
              type="number"
              name="travelDistance"
              value={formData.travelDistance}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
              readOnly={isReadOnly}
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Trip Explanation</label>
          <textarea
            name="tripExplanation"
            value={formData.tripExplanation}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded border ${isReadOnly ? 'bg-gray-100' : 'bg-white'} border-gray-300`}
            readOnly={isReadOnly}
            rows={3}
          />
        </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         
          
          {formData.accountNumber ? (
            // Show Account Number if it exists
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300"
                readOnly={isReadOnly}
                placeholder="Enter account number"
              />
            </div>
          ) : (
            // Show Payment Type selector if no account number
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Type</label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300"
                disabled
              >
                <option value="fuel">Fuel</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          )}

           <div>
            <label className="block text-sm font-medium text-gray-700">Authorizer Name</label>
            <input
              type="text"
              name="authorizerName"
              value={formData.authorizerName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300"
              required
              placeholder="Enter assembler's full name"
            />
          </div>
        </div>

        <div className="my-4">
          <label className="inline-flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="confirmation"
              checked={formData.confirmation || false}
              onChange={(e) => setFormData({ ...formData, confirmation: e.target.checked })}
              required
              className="mt-1"
            />
            <span>
              We ask for the necessary fuel supply based on the information described above.
            </span>
          </label>
        </div>

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
                              Submiting...
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
  );
};