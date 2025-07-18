"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Car } from '../types';
import { useNotification } from '@/app/contexts/NotificationContext';




const CarForm = ({ car, onClose, onSubmit, isSubmitting }: {
  car: Car | null;
  onClose: () => void;
  onSubmit: (carData: Car) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState<Omit<Car, 'id'>>({
    plateNumber: '',
    AgentName: '',
    AgentPhone: '',
    model: '',
    carType: 'Authomobile',
    manufactureYear: new Date().getFullYear().toString(),
    motorCapacity: '',
    kmPerLiter: '',
    totalKm: '',
    fuelType: 'Petrol',
    status: 'NOT_INSPECTED',
    registeredDate: new Date().toISOString().split('T')[0],
    parkingLocation: ''
  });

  const { addNotification } = useNotification();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (car) {
      setFormData({
        plateNumber: car.plateNumber,
        ownerName: car.ownerName,
        ownerPhone: car.ownerPhone,
        model: car.model,
        carType: car.carType,
        manufactureYear: car.manufactureYear,
        motorCapacity: car.motorCapacity,
        kmPerLiter: car.kmPerLiter,
        totalKm: car.totalKm,
        fuelType: car.fuelType,
        status: car.status,
        registeredDate: car.registeredDate,
        parkingLocation: car.parkingLocation
      });
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    if (!formData.ownerName) newErrors.ownerName = 'Agent name is required';
    if (!formData.ownerPhone) newErrors.ownerPhone = 'Agent phone is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.manufactureYear) newErrors.manufactureYear = 'Manufacture year is required';
    if (!formData.motorCapacity) newErrors.motorCapacity = 'Motor capacity is required';
    if (!formData.kmPerLiter) newErrors.kmPerLiter = 'KM per liter is required';
    if (!formData.totalKm) newErrors.totalKm = 'Total KM is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const carData = car 
        ? { ...formData, id: car.id } 
        : { ...formData, id: 0 };
      
      await onSubmit(carData as Car);

      //add notification
     try {
      await addNotification(
        `New ${formData.carType} registered: ${formData.plateNumber}`,
        `/tms-modules/admin/car-management/vehicle-inspection`,
        'INSPECTOR'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }

    } catch (error) {
      // Error is handled in parent component
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {car ? 'Update Vehicle Details' : 'Register New Vehicle'}
            </h2>
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              disabled={isSubmitting}
            >
              <FiX className="h-6 w-6" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plate Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.plateNumber ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.plateNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.plateNumber}</p>
                )}
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.ownerName ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.ownerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
                )}
              </div>

              {/* Owner Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Phone *</label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.ownerPhone ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.ownerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerPhone}</p>
                )}
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                )}
              </div>

              {/* Car Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                <select
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="Authomobile">Authomobile</option>
                  
                </select>
              </div>

              {/* Manufacture Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Year *</label>
                <input
                  type="number"
                  name="manufactureYear"
                  value={formData.manufactureYear}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.manufactureYear ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.manufactureYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.manufactureYear}</p>
                )}
              </div>

              {/* Motor Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motor Capacity (cc) *</label>
                <input
                  type="number"
                  name="motorCapacity"
                  value={formData.motorCapacity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.motorCapacity ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.motorCapacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.motorCapacity}</p>
                )}
              </div>

              {/* KM per Liter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KM per Liter *</label>
                <input
                  type="number"
                  name="kmPerLiter"
                  value={formData.kmPerLiter}
                  onChange={handleChange}
                  step="0.1"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.kmPerLiter ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.kmPerLiter && (
                  <p className="mt-1 text-sm text-red-600">{errors.kmPerLiter}</p>
                )}
              </div>

              {/* Total KM */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total KM *</label>
                <input
                  type="number"
                  name="totalKm"
                  value={formData.totalKm}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.totalKm ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.totalKm && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalKm}</p>
                )}
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Parking Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parking Location *</label>
                <input
                  type="text"
                  name="parkingLocation"
                  value={formData.parkingLocation}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.parkingLocation ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isSubmitting}
                />
                {errors.parkingLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.parkingLocation}</p>
                )}
              </div>

              {/* Status */}
              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">Status</label> */}
                {/* <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="NOT_INSPECTED">Not Inspected</option>
                  <option value="Approved">Approved</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select> */}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    {car ? 'Updating...' : 'Registering...'}
                  </span>
                ) : car ? (
                  'Update Vehicle'
                ) : (
                  'Register Vehicle'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CarForm;