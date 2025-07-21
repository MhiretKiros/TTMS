"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiSend } from 'react-icons/fi';

const departments = [
  "Software Development",
  "Security",
  "Store",
  "Finance",
  "Other"
];

export default function ServiceCarRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    department: '',
    phoneNumber: '',
    homeLocation: ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    // Validation for required fields
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.homeLocation.trim()) newErrors.homeLocation = 'Home location is required';
    
    // Phone number validation
    if (formData.phoneNumber.trim() && !/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must contain only numbers';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Service Car Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee ID */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter employee ID"
            />
            {errors.employeeId && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.employeeId}
              </motion.p>
            )}
          </motion.div>

          {/* Full Name */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.fullName}
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

          {/* Phone Number */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter phone number"
            />
            {errors.phoneNumber && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.phoneNumber}
              </motion.p>
            )}
          </motion.div>

          {/* Home Location */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Location *</label>
            <input
              type="text"
              name="homeLocation"
              value={formData.homeLocation}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.homeLocation ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
              placeholder="Enter home location"
            />
            {errors.homeLocation && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.homeLocation}
              </motion.p>
            )}
            <p className="mt-2 text-sm text-blue-600 cursor-pointer hover:underline">
              Click Here for Home Location Change here
            </p>
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
                Sending...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Send Request
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}