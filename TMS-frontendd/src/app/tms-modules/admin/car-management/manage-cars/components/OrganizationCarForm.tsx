"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface OrganizationCar {
  id?: number;
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  model: string;
  carType: string;
  manufactureYear: string;
  motorCapacity: string;
  kmPerLiter: string;
  totalKm: string;
  fuelType: string;
  registeredDate: string;
  parkingLocation: string;
  driverName: string;
  driverAttributes: string;
  driverAddress: string;
  loadCapacity: string;
}

const OrganizationCarForm = ({ car, onClose, onSubmit, isSubmitting }: {
  car: OrganizationCar | null;
  onClose: () => void;
  onSubmit: (carData: OrganizationCar) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState<OrganizationCar>({
    plateNumber: '',
    ownerName: '',
    ownerPhone: '',
    model: '',
    carType: 'Minibus',
    manufactureYear: new Date().getFullYear().toString(),
    motorCapacity: '',
    kmPerLiter: '',
    totalKm: '',
    fuelType: 'Petrol',
    registeredDate: new Date().toISOString().split('T')[0],
    parkingLocation: '',
    driverName: '',
    driverAttributes: '',
    driverAddress: '',
    loadCapacity: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (car) {
      setFormData(car);
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.driverName) newErrors.driverName = 'Driver name is required';
    if (!formData.loadCapacity) newErrors.loadCapacity = 'Load capacity is required';
    
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
      
      await onSubmit(carData);
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
              {car ? 'Update Organization Car' : 'Register Organization Car'}
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
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                    <select
                      name="carType"
                      value={formData.carType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="Minibus">Minibus</option>
                      <option value="Bus">Bus</option>
                      <option value="Truck">Truck</option>
                      <option value="SUV">SUV</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Year</label>
                    <input
                      type="number"
                      name="manufactureYear"
                      value={formData.manufactureYear}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motor Capacity (cc)</label>
                    <input
                      type="number"
                      name="motorCapacity"
                      value={formData.motorCapacity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">KM per Liter</label>
                    <input
                      type="number"
                      name="kmPerLiter"
                      value={formData.kmPerLiter}
                      onChange={handleChange}
                      step="0.1"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total KM</label>
                    <input
                      type="number"
                      name="totalKm"
                      value={formData.totalKm}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

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
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Load Capacity (kg) *</label>
                    <input
                      type="number"
                      name="loadCapacity"
                      value={formData.loadCapacity}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.loadCapacity ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      disabled={isSubmitting}
                    />
                    {errors.loadCapacity && (
                      <p className="mt-1 text-sm text-red-600">{errors.loadCapacity}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Driver Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.driverName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      disabled={isSubmitting}
                    />
                    {errors.driverName && (
                      <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Attributes</label>
                    <input
                      type="text"
                      name="driverAttributes"
                      value={formData.driverAttributes}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver Address</label>
                    <textarea
                      name="driverAddress"
                      value={formData.driverAddress}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parking Location</label>
                    <input
                      type="text"
                      name="parkingLocation"
                      value={formData.parkingLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registered Date</label>
                    <input
                      type="date"
                      name="registeredDate"
                      value={formData.registeredDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
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
                  'Update Car'
                ) : (
                  'Register Car'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrganizationCarForm;