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
  frameNo?: string;
  companyName?: string;
  vehiclesUsed?: string;
  bodyType?: string;
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
  details?: string;
  assignedCar?: Car;
  status?: 'Pending' | 'Assigned' | 'Not Assigned';
  assignmentDate?: string; // Add this
}

interface PendingRequest {
  id: string;
  formData: FormData;
  totalPercentage: number;
  createdAt: string;
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

const positionPriority = {
  'Level 1': 1,
  'Level 2': 2,
  'Level 3': 3,
  'Level 4': 4,
  'Level 5': 5
};

export default function RentalRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    requestLetterNo: '',
    requestDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
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

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [proposedCar, setProposedCar] = useState<Car | null>(null);
  const [approvedCars, setApprovedCars] = useState<Car[]>([]);
  const [autoCheckInterval, setAutoCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const isHighPriority = totalPercentage >= 70;

  
  // Fetch data on component mount
  useEffect(() => {
    fetchApprovedCars(formData.rentalType);
    fetchPendingRequests();
    
    // Set up auto-check every 30 seconds
    const interval = setInterval(() => {
      fetchApprovedCars(formData.rentalType);
      fetchPendingRequests();
      checkForPendingMatches();
    }, 30000);
    
    setAutoCheckInterval(interval);
    
    return () => {
      if (autoCheckInterval) clearInterval(autoCheckInterval);
    };
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

  const fetchApprovedCars = async (rentalType: string) => {
    try {
      const endpoint = rentalType === 'organizational' 
        ? 'http://localhost:8080/auto/rent-car/approved' 
        : 'http://localhost:8080/auth/car/approved';
      
      const response = await axios.get(endpoint);
      const data = response.data;

      if (data.codStatus === 200 || (data.status && data.status === 200)) {
        const rawCars = rentalType === 'organizational' ? data.rentCarList : data.carList;
        
        const validCars = rawCars
          .filter((car: any) => car.status.toLowerCase() === 'approved')
          .map((car: any) => rentalType === 'organizational' ? {
            id: car.id,
            plateNumber: car.plateNumber,
            model: car.model,
            carType: car.vehiclesType,
            manufactureYear: parseInt(car.proYear),
            motorCapacity: car.cc,
            status: car.status,
            fuelType: car.fuelType,
            parkingLocation: car.department,
            frameNo: car.frameNo,
            companyName: car.companyName,
            vehiclesUsed: car.vehiclesUsed,
            bodyType: car.bodyType
          } : car);

        setApprovedCars(validCars);
      }
    } catch (error) {
      console.error('Error fetching approved cars:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/auth/assignments/not-assigned');
      if (response.data.codStatus === 200) {
        setPendingRequests(response.data.assignments);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const checkForPendingMatches = async () => {
    if (pendingRequests.length === 0 || approvedCars.length === 0) return;

    // Sort pending requests by priority (highest first)
    const sortedRequests = [...pendingRequests].sort((a, b) => {
      // First sort by percentage (descending)
      if (a.totalPercentage !== b.totalPercentage) {
        return b.totalPercentage - a.totalPercentage;
      }
      // Then by position priority (ascending because Level 1 is highest)
      return positionPriority[a.formData.position] - positionPriority[b.formData.position];
    });

    for (const request of sortedRequests) {
      const eligibleCars = filterAndSortCars(
        approvedCars.filter(car => 
          car.carType.toLowerCase() === 'authomobile' && car.status === 'Approved'
        ),
        request.formData.position,
        request.totalPercentage >= 70
      );

      if (eligibleCars.length > 0) {
        const bestCar = eligibleCars[0];
        setProposedCar(bestCar);
        setSubmittedData(request.formData);
        setTotalPercentage(request.totalPercentage);
        setShowConfirmation(true);
        return; // Only show one confirmation at a time
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as FormData[keyof FormData]
    }));
  };

  const filterAndSortCars = (cars: Car[], position: string, isHighPriorityReq: boolean) => {
    const currentPosition = position;
    const isElectric = (car: Car) => car.fuelType.toLowerCase() === 'electric';
  
    return cars.filter(car => {
      const cc = parseMotorCapacity(car.motorCapacity);
      const year = car.manufactureYear;
  
      if (isHighPriorityReq) {
        if (currentPosition === 'Level 5') {
          if (cc === 1200) return year >= 2001 && year < 2018;
          if (cc < 1200) return year >= 2001;
          return false;
        }
        return true;
      }
  
      if (currentPosition === 'Level 5') {
        if (cc === 1200) return year >= 2001 && year < 2018;
        if (cc < 1200) return year >= 2001;
        return false;
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
          car.carType.toLowerCase() === 'authomobile' && car.status === 'Approved'
        ),
        formData.position,
        isHighPriority
      );
  
      if (eligibleCars.length === 0) {
        // No cars available - handle unassigned case immediately
        const payload = {
          requestLetterNo: formData.requestLetterNo,
          requestDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          requesterName: formData.requesterName,
          rentalType: formData.rentalType,
          position: formData.position,
          department: formData.department,
          phoneNumber: formData.phoneNumber,
          travelWorkPercentage: formData.travelWorkPercentage,
          shortNoticePercentage: formData.shortNoticePercentage,
          mobilityIssue: formData.mobilityIssue,
          gender: formData.gender,
          totalPercentage: totalPercentage,
          status: 'Not Assigned',
          carId: null,
          plateNumber: null
        };
  
        const endpoint = formData.rentalType === 'organizational' 
          ? 'http://localhost:8080/auth/rent-car/assign' 
          : 'http://localhost:8080/auth/car/assign';
  
        const response = await axios.post(endpoint, payload);
  
        if (response.data.codStatus === 200 || response.data.status === 200 || response.status === 200) {
          setAssignmentResult({
            success: true,
            message: 'No available automobiles matching criteria. Your request has been saved and will be processed when a matching vehicle becomes available.',
            status: 'Not Assigned'
          });
          setShowSuccessModal(true);
          
          // Reset form
          setFormData({
            requestLetterNo: '',
            requestDate: new Date().toISOString().split('T')[0],
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
        } else {
          throw new Error(response.data.message || 'Failed to save unassigned request');
        }
        return;
      }
  
      // If cars are available, show confirmation with the best car
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
        message: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Error processing assignment'
      });
    } finally {
      setIsAssigning(false);
    }
  };
  
  const confirmAssignment = async (rentalType: string) => {
    const currentPendingRequests = pendingRequests || [];
    const currentProposedCar = proposedCar || currentPendingRequests.find(
      req => req?.formData?.requestLetterNo === (submittedData?.requestLetterNo || formData.requestLetterNo)
    )?.assignedCar;
  
    const assignmentFormData = submittedData || formData;
    setIsAssigning(true);
  
    try {
      // Prepare payload for assigned car
      const payload = {
        requestLetterNo: assignmentFormData.requestLetterNo,
        requestDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        requesterName: assignmentFormData.requesterName,
        rentalType: assignmentFormData.rentalType,
        position: assignmentFormData.position,
        department: assignmentFormData.department,
        phoneNumber: assignmentFormData.phoneNumber,
        travelWorkPercentage: assignmentFormData.travelWorkPercentage,
        shortNoticePercentage: assignmentFormData.shortNoticePercentage,
        mobilityIssue: assignmentFormData.mobilityIssue,
        gender: assignmentFormData.gender,
        totalPercentage: totalPercentage,
        status: 'Pending',
        [rentalType === 'organizational' ? 'rentCarId' : 'carId']: currentProposedCar!.id,
        plateNumber: currentProposedCar!.plateNumber
      };
  
      const assignEndpoint = rentalType === 'organizational' 
        ? 'http://localhost:8080/auth/rent-car/assign' 
        : 'http://localhost:8080/auth/car/assign';
  
      const statusEndpoint = rentalType === 'organizational'
        ? `http://localhost:8080/auth/rent-car/status/${currentProposedCar!.plateNumber}`
        : `http://localhost:8080/auth/car/status/${currentProposedCar!.plateNumber}`;
  
      // Execute both requests in parallel
      const [assignmentResponse, statusResponse] = await Promise.all([
        axios.post(assignEndpoint, payload),
        axios.put(statusEndpoint, { 
          status: 'Pending',
          assignmentDate: new Date().toISOString().split('T')[0] 
        })
      ]);
  
      // Check both responses
      const assignmentSuccess = assignmentResponse.data.codStatus === 200 || 
                               assignmentResponse.data.status === 200 || 
                               assignmentResponse.status === 200;
      
      const statusSuccess = statusResponse.data.codStatus === 200 || 
                           statusResponse.data.status === 200 || 
                           statusResponse.status === 200;
  
      if (!assignmentSuccess || !statusSuccess) {
        const errors = [
          !assignmentSuccess ? `Assignment failed: ${assignmentResponse.data?.message || 'Unknown error'}` : null,
          !statusSuccess ? `Status update failed: ${statusResponse.data?.message || 'Unknown error'}` : null
        ].filter(Boolean).join('; ');
        
        throw new Error(errors || 'Assignment failed on server');
      }
  
      setAssignmentResult({
        success: true,
        message: 'Vehicle assigned successfully!',
        assignedCar: currentProposedCar,
        status: 'Pending',
        assignmentDate: new Date().toISOString().split('T')[0]
      });
  
      // Reset form if this was a new request (not from pending)
      if (!currentPendingRequests.some(req => req.formData?.requestLetterNo === formData.requestLetterNo)) {
        setFormData({
          requestLetterNo: '',
          requestDate: new Date().toISOString().split('T')[0],
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
      }
  
      setShowConfirmation(false);
      setShowSuccessModal(true);
      setProposedCar(null);
      
      // Refresh data
      await Promise.all([
        fetchApprovedCars(rentalType),
        fetchPendingRequests()
      ]);
  
    } catch (error) {
      console.error('Assignment error:', error);
      
      let errorMessage = 'Assignment failed';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      setAssignmentResult({
        success: false,
        message: errorMessage,
        details: axios.isAxiosError(error) 
          ? JSON.stringify(error.response?.data) 
          : error instanceof Error ? error.message : 'Unknown error'
      });
      
      setShowConfirmation(false);
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
                    placeholder='Enter request letter number'
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
                    placeholder='Enter requester name'
                  />
                </div>
              </motion.div>

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
                    📅 Request Date
                  </label>
                  <input
                    type="date"
                    name="requestDate"
                    value={formData.requestDate}
                    disabled
                    className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none border border-gray-300 transition-all cursor-not-allowed"
                    readOnly
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
                    placeholder='Enter phone number'
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    🏢 Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Development">Development</option>
                    <option value="Security">Security</option>
                    <option value="Networking">Networking</option>                    
                    <option value="IT">Information Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Operations">Operations</option>
                  </select>
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
                  : ''
              }`}
              style={{
                backgroundColor: !isAssigning ? '#3c8dbc' : undefined
              }}
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
                  {submittedData?.requestLetterNo === formData.requestLetterNo 
                    ? '🚨 Confirm Vehicle Assignment' 
                    : '🚨 New Vehicle Available for Pending Request'}
                </h3>
                
                {/* Request Details */}
                {submittedData && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Request Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="text-sm text-blue-600">Request Letter No</p>
                          <p className="font-medium text-gray-800">
                            {submittedData.requestLetterNo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">👤</span>
                        <div>
                          <p className="text-sm text-blue-600">Requester</p>
                          <p className="font-medium text-gray-800">
                            {submittedData.requesterName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">📋</span>
                        <div>
                          <p className="text-sm text-blue-600">Position</p>
                          <p className="font-medium text-gray-800">
                            {positionLabels[submittedData.position]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <p className="text-sm text-blue-600">Priority Score</p>
                          <p className="font-medium text-gray-800">
                            {totalPercentage}% {totalPercentage >= 70 ? '(High Priority)' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Vehicle Details */}
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Vehicle Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                    onClick={() => {
                      setShowConfirmation(false);
                      setProposedCar(null);
                      setSubmittedData(null);
                    }}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => confirmAssignment(submittedData?.rentalType || formData.rentalType)}
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
          {showSuccessModal && assignmentResult && (
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
                <h3 className={`text-2xl font-bold mb-6 ${
                  assignmentResult.success ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {assignmentResult.success ? '✅ Assignment Successful' : '⚠️ Request Saved'}
                </h3>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto max-h-[70vh] pr-4">
                  <div className="space-y-6">
                    <p className={`text-lg font-medium ${
                      assignmentResult.success ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {assignmentResult.message}
                    </p>

                    {assignmentResult.success && submittedData && (
                      <>
                        {/* Requester Details */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-800">Request Details</h4>
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

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">🔄</span>
                              <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium text-gray-800">
                                  {assignmentResult.status || 'Pending'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Details */}
                        {assignmentResult.assignedCar && (
                          <div className="border-t pt-6">
                            <h4 className="text-lg font-semibold text-blue-800 mb-4">Vehicle Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">🚗</span>
                                <div>
                                  <p className="text-sm text-gray-600">Plate Number</p>
                                  <p className="font-medium text-gray-800">
                                    {assignmentResult.assignedCar.plateNumber || 'Not available'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">📝</span>
                                <div>
                                  <p className="text-sm text-gray-600">Model</p>
                                  <p className="font-medium text-gray-800">
                                    {assignmentResult.assignedCar.model || 'Not available'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">🏷️</span>
                                <div>
                                  <p className="text-sm text-gray-600">Type</p>
                                  <p className="font-medium text-gray-800">
                                    {assignmentResult.assignedCar.carType || 'Not available'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">📅</span>
                                <div>
                                  <p className="text-sm text-gray-600">Year</p>
                                  <p className="font-medium text-gray-800">
                                    {assignmentResult.assignedCar.manufactureYear || 'Not available'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">⛽</span>
                                <div>
                                  <p className="text-sm text-gray-600">Fuel Type</p>
                                  <p className="font-medium text-gray-800">
                                    {assignmentResult.assignedCar.fuelType || 'Not available'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">⚙️</span>
                                <div>
                                  <p className="text-sm text-gray-600">Motor Capacity</p>
                                  <p className="font-medium text-gray-800">
                                    {parseMotorCapacity(assignmentResult.assignedCar.motorCapacity)}cc
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-2xl">📍</span>
                                <div>
                                  <p className="text-sm text-gray-600">Parking Location</p>
                                  <p className="font-medium text-gray-800">
                                    {assignmentResult.assignedCar.parkingLocation || 'Not available'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="mt-8 flex justify-end pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowSuccessModal(false);
                      setAssignmentResult(null);
                      setSubmittedData(null);
                    }}
                    className={`px-6 py-2 ${
                      assignmentResult.success ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-lg transition-colors`}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {assignmentResult?.success === false && !showSuccessModal && (
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