"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiMapPin, FiSend, FiCalendar } from 'react-icons/fi';

const carTypes = [
  "Sedan",
  "SUV",
  "Minivan",
  "Truck",
  "Luxury",
  "Other"
];

const departments = [
  "Software Development",
  "Marketing",
  "Sales",
  "Human Resources",
  "Operations",
  "Finance"
];

const jobStatuses = [
  "Project",
  "Maintenance",
  "Emergency",
  "Meeting",
  "Training",
  "Other"
];

export default function TravelRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    startingPlace: '',
    destinationPlace: '',
    travelerName: '',
    travelReason: '',
    carType: '',
    travelDistance: '',
    startingDate: '',
    returnDate: '',
    department: '',
    jobStatus: '',
    claimantName: '',
    teamLeaderName: '',
    approvement: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const currentDate = new Date();
    const startDate = formData.startingDate ? new Date(formData.startingDate) : null;
    const endDate = formData.returnDate ? new Date(formData.returnDate) : null;

    // Required fields
    if (!formData.startingPlace.trim()) newErrors.startingPlace = 'Starting place is required';
    if (!formData.destinationPlace.trim()) newErrors.destinationPlace = 'Destination is required';
    if (!formData.startingDate) newErrors.startingDate = 'Starting date is required';
    if (!formData.travelerName.trim()) newErrors.travelerName = 'Traveler name is required';
    if (!formData.travelReason.trim()) newErrors.travelReason = 'Travel reason is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.jobStatus) newErrors.jobStatus = 'Job status is required';
    if (!formData.claimantName.trim()) newErrors.claimantName = 'Claimant name is required';
    if (!formData.teamLeaderName.trim()) newErrors.teamLeaderName = 'Team leader name is required';

    // Date validations
    if (startDate && startDate < currentDate) {
      newErrors.startingDate = 'Starting date cannot be in the past';
    }
    
    if (endDate && startDate && endDate < startDate) {
      newErrors.returnDate = 'Return date cannot be before starting date';
    }

    // Text length validations
    if (formData.startingPlace.length > 100) newErrors.startingPlace = 'Starting place cannot exceed 100 characters';
    if (formData.destinationPlace.length > 100) newErrors.destinationPlace = 'Destination cannot exceed 100 characters';
    if (formData.travelerName.length > 50) newErrors.travelerName = 'Name cannot exceed 50 characters';
    if (formData.travelReason.length > 500) newErrors.travelReason = 'Reason cannot exceed 500 characters';
    if (formData.claimantName.length > 50) newErrors.claimantName = 'Claimant name cannot exceed 50 characters';
    if (formData.teamLeaderName.length > 50) newErrors.teamLeaderName = 'Team leader name cannot exceed 50 characters';
    if (formData.approvement.length > 100) newErrors.approvement = 'Approvement cannot exceed 100 characters';

    // Distance validation
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 1500);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6 md:p-8"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Travel Service Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starting Place */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Place *</label>
            <input
              type="text"
              name="startingPlace"
              value={formData.startingPlace}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.startingPlace ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter starting location"
              maxLength={100}
            />
            {errors.startingPlace && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.startingPlace}
              </motion.p>
            )}
          </motion.div>

          {/* Destination Place */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Place *</label>
            <input
              type="text"
              name="destinationPlace"
              value={formData.destinationPlace}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.destinationPlace ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter destination"
              maxLength={100}
            />
            {errors.destinationPlace && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.destinationPlace}
              </motion.p>
            )}
          </motion.div>

          {/* Traveler's Name */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Traveler's Name *</label>
            <input
              type="text"
              name="travelerName"
              value={formData.travelerName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.travelerName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter traveler's name"
              maxLength={50}
            />
            {errors.travelerName && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.travelerName}
              </motion.p>
            )}
          </motion.div>

          {/* Reason for Travel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Travel *</label>
            <input
              type="text"
              name="travelReason"
              value={formData.travelReason}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.travelReason ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter reason for travel"
              maxLength={500}
            />
            {errors.travelReason && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.travelReason}
              </motion.p>
            )}
          </motion.div>

          {/* Car Type */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
            <select
              name="carType"
              value={formData.carType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">Select car type</option>
              {carTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </motion.div>

          {/* Travel Distance */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Distance (km)</label>
            <input
              type="text"
              name="travelDistance"
              value={formData.travelDistance}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.travelDistance ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter distance in kilometers"
              inputMode="decimal"
            />
            {errors.travelDistance && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.travelDistance}
              </motion.p>
            )}
          </motion.div>

          {/* Starting Date */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date *</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="startingDate"
                value={formData.startingDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.startingDate ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              />
            </div>
            {errors.startingDate && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.startingDate}
              </motion.p>
            )}
          </motion.div>

          {/* Return Date */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                min={formData.startingDate || new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.returnDate ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              />
            </div>
            {errors.returnDate && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.returnDate}
              </motion.p>
            )}
          </motion.div>

          {/* Department */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.department}
              </motion.p>
            )}
          </motion.div>

          {/* Job Status */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Status *</label>
            <select
              name="jobStatus"
              value={formData.jobStatus}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.jobStatus ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            >
              <option value="">Select status</option>
              {jobStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.jobStatus && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.jobStatus}
              </motion.p>
            )}
          </motion.div>

          {/* Claimant Name */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Claimant Name *</label>
            <input
              type="text"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.claimantName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter claimant's name"
              maxLength={50}
            />
            {errors.claimantName && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.claimantName}
              </motion.p>
            )}
          </motion.div>

          {/* Team Leader Name */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader Name *</label>
            <input
              type="text"
              name="teamLeaderName"
              value={formData.teamLeaderName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.teamLeaderName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter team leader's name"
              maxLength={50}
            />
            {errors.teamLeaderName && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.teamLeaderName}
              </motion.p>
            )}
          </motion.div>

          {/* Approvement */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approvement</label>
            <input
              type="text"
              name="approvement"
              value={formData.approvement}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Enter approvement status"
              maxLength={100}
            />
            {errors.approvement && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.approvement}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
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
                Sending Request...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Send Travel Request
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}