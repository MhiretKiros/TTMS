"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface RentCar {
  id?: number;
  frameNo: string;
  companyName: string;
  vehiclesUsed: string;
  bodyType: string;
  model: string;
  motorNumber: string;
  proYear: string;
  cc: string;
  department: string;
  vehiclesType: string;
  plateNumber: string;
  color: string;
  door: string;
  cylinder: string;
  fuelType: string;
  status: string;
  otherDescription: string;
  radio: string;
  antena: string;
  krik: string;
  krikManesha: string;
  tyerStatus: string;
  gomaMaficha: string;
  mefcha: string;
  reserveTayer: string;
  gomaGet: string;
  pinsa: string;
  kacavite: string;
  fireProtection: string;
  source: string;
  vehiclesDonorName: string;
  dateOfIn: string;
  dateOfOut: string;
  vehiclesPhoto: string;
  vehiclesUserName: string;
  position: string;
  libre: string;
  transmission: string;
  // dataAntollerNatue: string;
  km: string;
}

// Define initial state outside the component for stability and reusability
const initialRentCarFormData: RentCar = {
  frameNo: '',
  companyName: '',
  vehiclesUsed: '',
  bodyType: '',
  model: '',
  motorNumber: '',
  proYear: new Date().getFullYear().toString(),
  cc: '',
  department: '',
  vehiclesType: '',
  plateNumber: '',
  color: '',
  door: '',
  cylinder: '',
  fuelType: 'Petrol',
  status: 'NOT_INSPECTED', // Default status
  otherDescription: '',
  radio: '',
  antena: '',
  krik: '',
  krikManesha: '',
  tyerStatus: '',
  gomaMaficha: '',
  mefcha: '',
  reserveTayer: '',
  gomaGet: '',
  pinsa: '',
  kacavite: '',
  fireProtection: '',
  source: '',
  vehiclesDonorName: '',
  dateOfIn: new Date().toISOString().split('T')[0],
  dateOfOut: '',
  vehiclesPhoto: '',
  vehiclesUserName: '',
  position: '',
  libre: '',
  transmission: '',
  // dataAntollerNatue: '',
  km: ''
};

const RentCarForm = ({ car, onClose, onSubmit, isSubmitting }: {
  car: RentCar | null;
  onClose: () => void;
  onSubmit: (carData: RentCar) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState<RentCar>(initialRentCarFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (car) {
      // When editing, set form data from car prop.
      // Ensure status from car is used, or fallback if car.status is missing/falsy.
      setFormData({
        ...initialRentCarFormData, // Spread initial state first to ensure all fields are present
        ...car,                   // Then spread car to override with its values
        status: car.status || initialRentCarFormData.status, // Explicitly handle status, fallback to default
      });
    } else {
      // When creating a new car (car is null), or if form is cleared.
      // Reset to the initial default state.
      setFormData(initialRentCarFormData);
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      // The dropdowns used 'Yes'/'No'. We map boolean to that.
      setFormData(prev => ({ ...prev, [name]: checked ? 'Yes' : 'No' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.frameNo) newErrors.frameNo = 'Frame No is required';
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    if (!formData.model) newErrors.model = 'Model is required';
    // Add validation for status, ensuring it's not empty.
    if (!formData.status) newErrors.status = 'Status is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // For new cars, send formData as is. It includes 'status' from initialization.
      // For existing cars (update), ensure 'id' is included from the 'car' prop.
      const carDataToSubmit = (car && car.id)
        ? { ...formData, id: car.id } // Update existing car
        : { ...formData };            // Create new car
      
      await onSubmit(carDataToSubmit as RentCar);
    } catch (error) {
      console.error("Error during form submission in RentCarForm:", error);
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {car ? 'Update Organization Vehicle' : 'Register Organization Vehicle'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frame No *</label>
                    <input
                      type="text"
                      name="frameNo"
                      value={formData.frameNo}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.frameNo ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      disabled={isSubmitting}
                    />
                    {errors.frameNo && (
                      <p className="mt-1 text-sm text-red-600">{errors.frameNo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      disabled={isSubmitting}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                    )}
                  </div>

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
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicles Used</label>
                    <input
                      type="text"
                      name="vehiclesUsed"
                      value={formData.vehiclesUsed}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
                    <select
                      name="bodyType"
                      value={formData.bodyType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Body Type</option>
                      <option value="Auto Mobile">Auto Mobile</option>
                      <option value="mini bus">Mini bus</option>
                      <option value="bus">Bus</option>
                      <option value="Truck">Truck</option>
                      
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motor Number</label>
                    <input
                      type="text"
                      name="motorNumber"
                      value={formData.motorNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Production Year</label>
                    <input
                      type="number"
                      name="proYear"
                      value={formData.proYear}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
                    <input
                      type="text"
                      name="cc"
                      value={formData.cc}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicles Type</label>
                    <select
                      name="vehiclesType"
                      value={formData.vehiclesType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Type</option>
                      <option value="Authomobile">Authomobile</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Door</label>
                    <input
                      type="text"
                      name="door"
                      value={formData.door}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder</label>
                    <input
                      type="text"
                      name="cylinder"
                      value={formData.cylinder}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
<div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicles Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="NOT_INSPECTED">Not Inspected</option>
                      <option value="Approved">Approved</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
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
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Description</label>
                    <textarea
                      name="otherDescription"
                      value={formData.otherDescription}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Details */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center pt-6">
                    <input
                      id="radio-checkbox"
                      type="checkbox"
                      name="radio"
                      checked={formData.radio === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="radio-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Radio
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="antena-checkbox"
                      type="checkbox"
                      name="antena"
                      checked={formData.antena === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="antena-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Antena
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="krik-checkbox"
                      type="checkbox"
                      name="krik"
                      checked={formData.krik === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="krik-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Krik
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="krikManesha-checkbox"
                      type="checkbox"
                      name="krikManesha"
                      checked={formData.krikManesha === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="krikManesha-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Krik Manesha
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tyer Status</label>
                    <select
                      name="tyerStatus"
                      value={formData.tyerStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="">Select</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="gomaMaficha-checkbox"
                      type="checkbox"
                      name="gomaMaficha"
                      checked={formData.gomaMaficha === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="gomaMaficha-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Goma Maficha
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="mefcha-checkbox"
                      type="checkbox"
                      name="mefcha"
                      checked={formData.mefcha === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="mefcha-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Mefcha
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="reserveTayer-checkbox"
                      type="checkbox"
                      name="reserveTayer"
                      checked={formData.reserveTayer === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="reserveTayer-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Reserve Tayer
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="gomaGet-checkbox"
                      type="checkbox"
                      name="gomaGet"
                      checked={formData.gomaGet === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="gomaGet-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Goma Get
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="pinsa-checkbox"
                      type="checkbox"
                      name="pinsa"
                      checked={formData.pinsa === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="pinsa-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Pinsa
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="kacavite-checkbox"
                      type="checkbox"
                      name="kacavite"
                      checked={formData.kacavite === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="kacavite-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Kacavite
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      id="fireProtection-checkbox"
                      type="checkbox"
                      name="fireProtection"
                      checked={formData.fireProtection === 'Yes'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="fireProtection-checkbox" className="ml-3 block text-sm font-medium text-gray-900">
                      Fire Protection
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicles Donor Name</label>
                    <input
                      type="text"
                      name="vehiclesDonorName"
                      value={formData.vehiclesDonorName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Of In</label>
                    <input
                      type="date"
                      name="dateOfIn"
                      value={formData.dateOfIn}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Of Out</label>
                    <input
                      type="date"
                      name="dateOfOut"
                      value={formData.dateOfOut}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicles Photo URL</label>
                    <input
                      type="text"
                      name="vehiclesPhoto"
                      value={formData.vehiclesPhoto}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicles User Name</label>
                    <input
                      type="text"
                      name="vehiclesUserName"
                      value={formData.vehiclesUserName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Libre</label>
                    <input
                      type="text"
                      name="libre"
                      value={formData.libre}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="">Select</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Antoller Natue</label>
                    <input
                      type="text"
                      name="dataAntollerNatue"
                      value={formData.dataAntollerNatue}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">KM</label>
                    <input
                      type="text"
                      name="km"
                      value={formData.km}
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
              className="px-4 py-2 border border-[#3c8dbc] text-[#3c8dbc] rounded-lg hover:bg-[#ecf4f8] transition-colors"
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
                  : 'bg-[#3c8dbc] hover:bg-[#2a6a90]'
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

export default RentCarForm;