"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiUser, FiMail, FiSend, FiTruck, FiMapPin } from 'react-icons/fi';

export default function CommentForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    licensePlate: '',
    driverName: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateLicensePlate = (plate: string) => {
    // Basic license plate validation - adjust according to your country's format
    const re = /^[A-Z0-9]{3,10}$/i;
    return re.test(plate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    } else if (!validateLicensePlate(formData.licensePlate)) {
      newErrors.licensePlate = 'Please enter a valid license plate';
    }
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Incident Report Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Your full name"
              />
            </div>
            {errors.name && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.name}
              </motion.p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.email}
              </motion.p>
            )}
          </motion.div>

          {/* License Plate */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
            <div className="relative">
              <FiTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.licensePlate ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Vehicle license plate"
              />
            </div>
            {errors.licensePlate && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.licensePlate}
              </motion.p>
            )}
          </motion.div>

          {/* Driver Name */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.driverName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Driver's full name"
              />
            </div>
            {errors.driverName && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.driverName}
              </motion.p>
            )}
          </motion.div>

          {/* Location */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-4 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.location ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
                placeholder="Where did the incident occur?"
              />
            </div>
            {errors.location && (
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-1 text-sm text-red-500 flex items-center"
              >
                <FiAlertCircle className="mr-1" /> {errors.location}
              </motion.p>
            )}
          </motion.div>

          {/* Subject */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Subject of your report"
            />
          </motion.div>
        </div>

        {/* Message */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800`}
            placeholder="Please describe the incident in detail..."
          />
          {errors.message && (
            <motion.p 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-1 text-sm text-red-500 flex items-center"
            >
              <FiAlertCircle className="mr-1" /> {errors.message}
            </motion.p>
          )}
        </motion.div>

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
                Submitting...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Submit Report
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}