// src/app/tms-modules/admin/car-management/assign-cars/page.tsx
'use client'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Car {
  id: number | string;
  plateNumber: string;
  model: string;
  carType: string;
  manufactureYear: number;
  motorCapacity: string;
  status: string;
  fuelType: string;
  parkingLocation: string;
  totalKm?: number;
}

interface FormData {
  requestLetterNo: string;
  requestDate: string;
  requesterName: string;
  rentalType: 'standard' | 'project' | 'organizational';
  position: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5';
  department: string;
  phoneNumber: string;
  travelWorkPercentage: 'low' | 'medium' | 'high';
  shortNoticePercentage: 'low' | 'medium' | 'high';
  mobilityIssue: 'yes' | 'no';
  gender: 'male' | 'female';
}

interface AssignmentResult {
  success: boolean;
  message: string;
  assignedCar?: Car;
}

const parseMotorCapacity = (motorCapacity: string): number => {
  const numericValue = parseInt(motorCapacity.replace(/\D/g, ''), 10);
  return isNaN(numericValue) ? 0 : numericValue;
};

const positionLabels = {
  'Level 1': 'Directorate',
  'Level 2': 'Director',
  'Level 3': 'Sub Director',
  'Level 4': 'Division',
  'Level 5': 'Experts'
};

export default function RentalRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    requestLetterNo: '',
    requestDate: '',
    requesterName: '',
    rentalType: 'standard',
    position: 'Level 1',
    department: '',
    phoneNumber: '',
    travelWorkPercentage: 'low',
    shortNoticePercentage: 'low',
    mobilityIssue: 'no',
    gender: 'male'
  });

  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [proposedCar, setProposedCar] = useState<Car | null>(null);
  const [approvedCars, setApprovedCars] = useState<Car[]>([]);

  const isHighPriority = totalPercentage >= 70;

  useEffect(() => {
    fetchApprovedCars();
  }, []);

  useEffect(() => {
    let total = 0;
    const travelPoints = { low: 15, medium: 25, high: 35 };
    const noticePoints = { low: 35, medium: 45, high: 55 };

    total += travelPoints[formData.travelWorkPercentage] || 0;
    total += noticePoints[formData.shortNoticePercentage] || 0;
    total += formData.mobilityIssue === 'yes' ? 5 : 0;
    total += formData.gender === 'female' ? 5 : 1;
    setTotalPercentage(total);
  }, [formData.travelWorkPercentage, formData.shortNoticePercentage, 
      formData.mobilityIssue, formData.gender]);

  const fetchApprovedCars = async () => {
    try {
      const response = await axios.get('http://localhost:8080/auth/car/approved');
      const data = response.data;

      if (data.codStatus === 200) {
        const validCars = data.carList.filter((car: Car) => 
          car.status.toLowerCase().replace(/[^a-z]/g, '') === 'approved'
        );
        setApprovedCars(validCars);
      }
    } catch (error) {
      console.error('Error fetching approved cars:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as FormData[keyof FormData]
    }));
  };

  const filterAndSortCars = (cars: Car[]) => {
    const currentPosition = formData.position;
    const isElectric = (car: Car) => car.fuelType.toLowerCase() === 'electric';
  
    return cars.filter(car => {
      const cc = parseMotorCapacity(car.motorCapacity);
      const year = car.manufactureYear;
  
      if (isHighPriority) {
        if (currentPosition === 'Level 5') return cc < 1000;
        return true;
      }
  
      if (currentPosition === 'Level 5') {
        return cc < 1000;
      }
  
      if (isElectric(car)) {
        return cc >= 120 && cc <= 130 && year >= 2020;
      }
  
      return (
        (cc >= 1200 && cc < 1300 && year >= 2018) ||
        (cc >= 1300 && year >= 2010)
      );
    }).sort((a, b) => {
      const aCC = parseMotorCapacity(a.motorCapacity);
      const bCC = parseMotorCapacity(b.motorCapacity);
      const ccCompare = bCC - aCC;
  
      if (ccCompare === 0) {
        return b.manufactureYear - a.manufactureYear;
      }
      return ccCompare;
    });
  };

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAssigning(true);
    setAssignmentResult(null);

    try {
      const eligibleCars = filterAndSortCars(
        approvedCars.filter(car => 
          car.carType.toLowerCase() === 'authomobile'
        )
      );

      if (eligibleCars.length === 0) {
        setAssignmentResult({
          success: false,
          message: 'No available automobiles matching criteria'
        });
        return;
      }

      const bestCar = eligibleCars[0];
      const sameSpecCars = eligibleCars.filter(car => 
        parseMotorCapacity(car.motorCapacity) === parseMotorCapacity(bestCar.motorCapacity) &&
        car.manufactureYear === bestCar.manufactureYear
      );

      const selectedCar = sameSpecCars.length > 1 
        ? sameSpecCars[Math.floor(Math.random() * sameSpecCars.length)]
        : bestCar;

      setProposedCar(selectedCar);
      setShowConfirmation(true);

    } catch (error) {
      console.error('Assignment error:', error);
      setAssignmentResult({
        success: false,
        message: 'Error processing assignment'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const confirmAssignment = async () => {
    if (!proposedCar) return;
    setIsAssigning(true);

    try {
      // Preserve form data before resetting
      setSubmittedData(formData);
      
      await axios.post('http://localhost:8080/auth/car/assign', {
        ...formData,
        totalPercentage,
        carId: proposedCar.id,
        requestDate: new Date().toISOString()
      });

      await axios.put(
        `http://localhost:8080/auth/car/status/${proposedCar.plateNumber}`,
        { status: 'Assigned' }
      );

      // Reset form
      setFormData({
        requestLetterNo: '',
        requestDate: '',
        requesterName: '',
        rentalType: 'standard',
        position: 'Level 1',
        department: '',
        phoneNumber: '',
        travelWorkPercentage: 'low',
        shortNoticePercentage: 'low',
        mobilityIssue: 'no',
        gender: 'male'
      });

      setAssignmentResult({
        success: true,
        message: `Vehicle assigned successfully! Priority: ${
          isHighPriority ? 'High' : positionLabels[formData.position]
        }`,
        assignedCar: proposedCar
      });

      await fetchApprovedCars();
      setShowConfirmation(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Confirmation error:', error);
      setAssignmentResult({
        success: false,
        message: error instanceof Error ? error.message : 'Assignment failed'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 border border-gray-200"
      >
        <div className="bg-blue-600 p-6">
          <h1 className="text-3xl font-bold text-white">
            🚀 Vehicle Assignment Portal
          </h1>
        </div>

        <form onSubmit={handleAssign} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    📄 Request Letter Number
                  </label>
                  <input
                    type="text"
                    name="requestLetterNo"
                    value={formData.requestLetterNo}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    📅 Request Date
                  </label>
                  <input
                    type="date"
                    name="requestDate"
                    value={formData.requestDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    👤 Requester Name
                  </label>
                  <input
                    type="text"
                    name="requesterName"
                    value={formData.requesterName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    🏷️ Rental Type
                  </label>
                  <select
                    name="rentalType"
                    value={formData.rentalType}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  >
                    <option value="standard">Standard</option>
                    <option value="project">Project</option>
                    <option value="organizational">Organizational</option>
                  </select>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    📊 Position Level
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    required
                  >
                    <option value="Level 1">Directorate</option>
                    <option value="Level 2">Director</option>
                    <option value="Level 3">Sub Director</option>
                    <option value="Level 4">Division</option>
                    <option value="Level 5">Experts</option>
                  </select>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    🏢 Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    📱 Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    pattern="[0-9]{10,}"
                    title="Please enter a valid phone number"
                    required
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    🌍 Travel/Work Percentage
                  </label>
                  <select
                    name="travelWorkPercentage"
                    value={formData.travelWorkPercentage}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  >
                    <option value="low">Low (15%)</option>
                    <option value="medium">Medium (25%)</option>
                    <option value="high">High (35%)</option>
                  </select>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  🚨 Short Notice Availability
                </label>
                <select
                  name="shortNoticePercentage"
                  value={formData.shortNoticePercentage}
                  onChange={handleChange}
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                >
                  <option value="low">Low (35%)</option>
                  <option value="medium">Medium (45%)</option>
                  <option value="high">High (55%)</option>
                </select>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  ♿ Mobility Issue
                </label>
                <select
                    name="mobilityIssue"
                    value={formData.mobilityIssue}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  >
                    <option value="no">No (0%)</option>
                    <option value="yes">Yes (5%)</option>
                  </select>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    👫 Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  >
                    <option value="male">Male (1%)</option>
                    <option value="female">Female (5%)</option>
                  </select>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-blue-50 rounded-xl border border-blue-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <span className="text-lg font-medium text-blue-800">
                  🎯 Calculated Priority Score
                </span>
                <div className={`px-6 py-3 rounded-full ${
                  isHighPriority 
                    ? 'bg-gradient-to-r from-red-100 to-yellow-100 border border-red-200'
                    : 'bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200'
                }`}>
                  <span className={`text-2xl font-bold ${
                    isHighPriority ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {totalPercentage}% {isHighPriority && '(High Priority)'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex justify-end"
            >
              <button
                type="submit"
                disabled={isAssigning}
                className={`px-8 py-4 rounded-xl font-bold text-white transition-all ${
                  isAssigning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                }`}
              >
                {isAssigning ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  '🚀 Assign Vehicle'
                )}
              </button>
            </motion.div>
          </form>

        <AnimatePresence>
          {showConfirmation && proposedCar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-gray-200 shadow-xl"
              >
                <h3 className="text-2xl font-bold text-blue-800 mb-6">
                  🚨 Confirm Vehicle Assignment
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="text-sm text-blue-600">Plate Number</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.plateNumber || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="text-sm text-blue-600">Model</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.model || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">🏷️</span>
                    <div>
                      <p className="text-sm text-blue-600">Type</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.carType || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-sm text-blue-600">Year</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.manufactureYear || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">⛽</span>
                    <div>
                      <p className="text-sm text-blue-600">Fuel Type</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.fuelType || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <p className="text-sm text-blue-600">Motor Capacity</p>
                      <p className="font-medium text-gray-800">
                        {parseMotorCapacity(proposedCar.motorCapacity)}cc
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-sm text-blue-600">Parking Location</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.parkingLocation || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmAssignment}
                    disabled={isAssigning}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    {isAssigning ? 'Confirming...' : 'Confirm Assignment'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccessModal && assignmentResult?.success && submittedData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-gray-200 shadow-xl flex flex-col"
              >
                <h3 className="text-2xl font-bold text-green-600 mb-6">
                  ✅ Assignment Successful
                </h3>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto max-h-[70vh] pr-4">
                  <div className="space-y-6">
                    {/* Requester Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="text-sm text-gray-600">Request Letter No</p>
                          <p className="font-medium text-gray-800">
                            {submittedData.requestLetterNo || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">👤</span>
                        <div>
                          <p className="text-sm text-gray-600">Requester Name</p>
                          <p className="font-medium text-gray-800">
                            {submittedData.requesterName || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">📱</span>
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-gray-800">
                            {submittedData.phoneNumber || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">🏢</span>
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium text-gray-800">
                            {submittedData.department || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">📋</span>
                        <div>
                          <p className="text-sm text-gray-600">Position</p>
                          <p className="font-medium text-gray-800">
                            {positionLabels[submittedData.position]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <p className="text-sm text-gray-600">Priority Score</p>
                          <p className="font-medium text-gray-800">
                            {totalPercentage}% {isHighPriority && '(High Priority)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="text-sm text-gray-600">Assignment Date</p>
                          <p className="font-medium text-gray-800">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-blue-800 mb-4">Vehicle Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposedCar && (
                          <>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">🚗</span>
                              <div>
                                <p className="text-sm text-gray-600">Plate Number</p>
                                <p className="font-medium text-gray-800">
                                  {proposedCar.plateNumber || 'Not available'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">📝</span>
                              <div>
                                <p className="text-sm text-gray-600">Model</p>
                                <p className="font-medium text-gray-800">
                                  {proposedCar.model || 'Not available'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">🏷️</span>
                              <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-medium text-gray-800">
                                  {proposedCar.carType || 'Not available'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">📅</span>
                              <div>
                                <p className="text-sm text-gray-600">Year</p>
                                <p className="font-medium text-gray-800">
                                  {proposedCar.manufactureYear || 'Not available'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">⛽</span>
                              <div>
                                <p className="text-sm text-gray-600">Fuel Type</p>
                                <p className="font-medium text-gray-800">
                                  {proposedCar.fuelType || 'Not available'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">⚙️</span>
                              <div>
                                <p className="text-sm text-gray-600">Motor Capacity</p>
                                <p className="font-medium text-gray-800">
                                  {parseMotorCapacity(proposedCar.motorCapacity)}cc
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">📍</span>
                              <div>
                                <p className="text-sm text-gray-600">Parking Location</p>
                                <p className="font-medium text-gray-800">
                                  {proposedCar.parkingLocation || 'Not available'}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="mt-8 flex justify-end pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSuccessModal(false)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {assignmentResult?.success === false && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-gray-200 shadow-xl"
              >
                <h3 className="text-2xl font-bold text-red-600 mb-6">
                  ❌ Assignment Failed
                </h3>
                
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-gray-800">
                    {assignmentResult.message}
                  </p>
                </div>

                <div className="mt-8 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAssignmentResult(null)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}