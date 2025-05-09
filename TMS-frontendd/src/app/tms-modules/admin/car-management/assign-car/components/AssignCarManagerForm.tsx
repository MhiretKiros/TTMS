"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiChevronDown } from 'react-icons/fi';

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
  isRentCar?: boolean;
}

interface AssignmentRequest {
  _id: string;
  model: string;
  requestLetterNo: string;
  plateNumbers?: string;
  carIds?: string[];
  allCarModels?: string;
  status: string;
  // Add other properties from your request object as needed
}

interface FormData {
  requestLetterNo: string;
  requestDate: string;
  requesterName: string;
  rentalType: 'standard' | 'project' | 'organizational';
  position: 'Level 1';
  department: string;
  phoneNumber: string;
  travelWorkPercentage: 'low' | 'medium' | 'high';
  shortNoticePercentage: 'low' | 'medium' | 'high';
  mobilityIssue: 'yes' | 'no';
  gender: 'male' | 'female';
  selectedModels: string[];
}

interface AssignmentResult {
  success: boolean;
  message: string;
  details?: string;
  assignedCars?: Car[];
  assignedRequest?: FormData;
  status?: 'Pending' | 'Assigned';
  assignmentDate?: string;
  numberOfCar?: string;
}

const STATIC_CAR_MODELS = [
  "corola",
  "Vitz",
  "Honda",
  "Suzuki",
  "Nissan"
];

const parseMotorCapacity = (motorCapacity: string): number => {
  const numericValue = parseInt(motorCapacity.replace(/\D/g, ''), 10);
  return isNaN(numericValue) ? 0 : numericValue;
};

const travelPoints = { low: 15, medium: 25, high: 35 };
const noticePoints = { low: 35, medium: 45, high: 55 };

const AutoCarConfirmation = ({ 
  cars, 
  onConfirm, 
  onCancel 
}: {
  cars: Car[];
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Confirm Auto-Assignment</h3>
      <p className="mb-4">The following vehicles will be assigned:</p>
      
      <ul className="mb-4 max-h-60 overflow-y-auto">
        {cars.map((car) => (
          <li key={car.plateNumber} className="py-2 border-b">
            <p><strong>Model:</strong> {car.model}</p>
            <p><strong>Plate:</strong> {car.plateNumber}</p>
            <p><strong>Type:</strong> {car.isRentCar ? 'Rent-Car' : 'Regular Car'}</p>
          </li>
        ))}
      </ul>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Confirm Assignment
        </button>
      </div>
    </div>
  </div>
);

export default function AssignCarManagerForm() {
  const [formData, setFormData] = useState<FormData>({
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
    gender: 'male',
    selectedModels: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCarModelDropdown, setShowCarModelDropdown] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [proposedCars, setProposedCars] = useState<Car[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [autoAssignCars, setAutoAssignCars] = useState<Car[]>([]);
  const [showAutoConfirm, setShowAutoConfirm] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);

  const isHighPriority = totalPercentage >= 70;

  useEffect(() => {
    let total = 0;
    total += travelPoints[formData.travelWorkPercentage] || 0;
    total += noticePoints[formData.shortNoticePercentage] || 0;
    total += formData.mobilityIssue === 'yes' ? 5 : 0;
    total += formData.gender === 'female' ? 5 : 1;
    setTotalPercentage(total);
  }, [formData.travelWorkPercentage, formData.shortNoticePercentage, 
      formData.mobilityIssue, formData.gender]);

  const fetchData = useCallback(async () => {
    try {
      const [carsResponse, rentCarsResponse, pendingResponse] = await Promise.all([
        axios.get('http://localhost:8080/auth/car/approved'),
        axios.get('http://localhost:8080/auth/rent-car/approved'),
        axios.get('http://localhost:8080/auth/assignments/pending')
      ]);

      const allAvailableCars = [];
      
      if (carsResponse.data.codStatus === 200) {
        const cars = carsResponse.data.carList
          .filter((car: any) => car.status.toLowerCase() === 'approved')
          .map((car: any) => ({
            ...car,
            carType: car.carType?.toLowerCase() || '',
            isRentCar: false
          }));
        allAvailableCars.push(...cars);
      }

      if (rentCarsResponse.data.codStatus === 200) {
        const rentCars = rentCarsResponse.data.rentCarList
          .filter((car: any) => car.status.toLowerCase() === 'approved')
          .map((car: any) => ({
            ...car,
            carType: car.carType?.toLowerCase() || '',
            isRentCar: true
          }));
        allAvailableCars.push(...rentCars);
      }

      setAvailableCars(allAvailableCars);

      if (pendingResponse.data.codStatus === 200) {
        setPendingRequests(pendingResponse.data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  
  const processPendingRequests = useCallback(async () => {
    try {
      for (const request of pendingRequests as AssignmentRequest[]) {
        try {
          // Split model string into assigned/unassigned parts
          const modelParts = request.model.split('/');
          
          // Process assigned models (before /)
          const assignedModels = modelParts[0]?.split(',')
            .map((m: string) => m.trim().toLowerCase())
            .filter((m: string) => m) || [];
          
          // Process unassigned models (after /)
          const unassignedModels = modelParts[1]?.split(',')
            .map((m: string) => m.trim().toLowerCase())
            .filter((m: string) => m) || [];
  
          // Skip if no unassigned models
          if (unassignedModels.length === 0) continue;
  
          // Find eligible cars from available cars
          const eligibleCars = availableCars.filter((car: Car) => {
            if (car.status.toLowerCase() !== 'approved') return false;
            const carModel = car.model.toLowerCase().trim();
            return unassignedModels.some((model: string) => 
              carModel === model.toLowerCase().trim()
            );
          });
  
          // Skip if no eligible cars found
          if (eligibleCars.length === 0) continue;
  
          // Match cars to unassigned models
          const carsToAssign: Car[] = [];
          const newlyAssignedModels: string[] = [];
          
          for (const model of unassignedModels) {
            const normalizedModel = model.toLowerCase().trim();
            const carForModel = eligibleCars.find((car: Car) => 
              car.model.toLowerCase().trim() === normalizedModel && 
              !carsToAssign.some((c: Car) => c.plateNumber === car.plateNumber)
            );
            
            if (carForModel) {
              carsToAssign.push(carForModel);
              newlyAssignedModels.push(model);
            }
          }
  
          // Skip if no cars matched
          if (carsToAssign.length === 0) continue;
  
          // Set state for auto-assignment confirmation
          setAutoAssignCars(carsToAssign);
          setCurrentRequest(request);
          setShowAutoConfirm(true);
          return;
  
        } catch (error) {
          console.error(`Error processing request ${request.requestLetterNo}:`, error);
        }
      }
    } catch (error) {
      console.error('Auto-assign process failed:', error);
    }
  }, [availableCars, pendingRequests]);
  
  const confirmAutoAssignment = async () => {
    // Validate current request and cars to assign
    if (!currentRequest || autoAssignCars.length === 0) {
      setShowAutoConfirm(false);
      return;
    }
    else{
      alert('Please make sure that you have selected the correct cars to assign.');
    }
    setIsAssigning(true);
    
    try {
      // Split model string into assigned/unassigned parts
      const modelParts = currentRequest.model.split('/');
      
      // Process assigned models (before /)
      const assignedModels = modelParts[0]?.split(',')
        .map((m: string) => m.trim().toLowerCase())
        .filter((m: string) => m) || [];
      
      // Process unassigned models (after /)
      const unassignedModels = modelParts[1]?.split(',')
        .map((m: string) => m.trim().toLowerCase())
        .filter((m: string) => m) || [];
  
      // Get newly assigned models from selected cars
      const newlyAssignedModels = autoAssignCars.map((c: Car) => c.model.toLowerCase().trim());
      const remainingUnassigned = unassignedModels.filter((m: string) => !newlyAssignedModels.includes(m));
  
      // Update status of all assigned cars
      await Promise.all(
        autoAssignCars.map((car: Car) => {
          const endpoint = car.isRentCar
            ? `http://localhost:8080/auth/rent-car/status/${car.plateNumber}`
            : `http://localhost:8080/auth/car/status/${car.plateNumber}`;
          
          return axios.put(endpoint, {
            status: 'Assigned',
            assignmentDate: new Date().toISOString().split('T')[0]
          });
        })
      );
  
      // Prepare updated model string
      const updatedAssigned = [...assignedModels, ...newlyAssignedModels];
      const isFullyAssigned = remainingUnassigned.length === 0;
      
      // Prepare update data for the request
      const updateData = {
        ...currentRequest,
        model: isFullyAssigned
          ? updatedAssigned.join(',')
          : `${updatedAssigned.join(',')}/${remainingUnassigned.join(',')}`,
        status: isFullyAssigned ? 'Assigned' : 'Pending',
        plateNumbers: [
          ...(currentRequest.plateNumbers?.split(', ') || []),
          ...autoAssignCars.map((c: Car) => c.plateNumber)
        ].join(', '),
        carIds: [
          ...(currentRequest.carIds || []),
          ...autoAssignCars.map((c: Car) => c.id)
        ],
        allCarModels: [
          ...(currentRequest.allCarModels?.split(', ') || []),
          ...autoAssignCars.map((c: Car) => c.model)
        ].join(', '),
        numberOfCar: isFullyAssigned
          ? `${updatedAssigned.length}/${updatedAssigned.length}`
          : `${updatedAssigned.length}/${assignedModels.length + unassignedModels.length}`
      };
  
      // Update the assignment record
      const updateResponse = await axios.put(
        `http://localhost:8080/auth/car/assign/${currentRequest._id}`,
        updateData
      );
  
      // Handle successful update
      if (updateResponse.data.codStatus === 200) {
        if (isFullyAssigned) {
          setAssignmentResult({
            success: true,
            message: `Request ${currentRequest.requestLetterNo} fully assigned!`,
            assignedCars: autoAssignCars,
            status: 'Assigned',
            details: `Assigned ${autoAssignCars.length} vehicles`
          });
          setShowSuccessModal(true);
        }
  
        // Refresh data
        await fetchData();
      }
  
    } catch (error) {
      console.error('Assignment failed:', error);
      setAssignmentResult({
        success: false,
        message: 'Failed to complete assignment'
      });
      setShowSuccessModal(true);
    } finally {
      // Clean up
      setIsAssigning(false);
      setShowAutoConfirm(false);
      setAutoAssignCars([]);
      setCurrentRequest(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (pendingRequests.length > 0) {
        await processPendingRequests();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pendingRequests, processPendingRequests]);

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as FormData[keyof FormData]
    }));
  };

  const handleModelSelect = (model: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedModels.includes(model);
      if (isSelected) {
        return {
          ...prev,
          selectedModels: prev.selectedModels.filter(m => m !== model)
        };
      } else {
        if (prev.selectedModels.length < 3) {
          if (errors.selectedModels) {
            setErrors(prevErrors => ({ ...prevErrors, selectedModels: '' }));
          }
          return {
            ...prev,
            selectedModels: [...prev.selectedModels, model]
          };
        }
        return prev;
      }
    });
  };

  const filterAndSortCars = useCallback((cars: Car[], selectedModels: string[], isHighPriorityReq: boolean) => {
    const filtered = cars.filter(car => {
      const carType = car.carType?.toLowerCase() || '';
      const isAutomobile = carType.includes('auto') || carType.includes('autho');
      
      if (!isAutomobile) return false;
      
      if (selectedModels.length > 0 && !selectedModels.includes(car.model)) {
        return false;
      }

      const cc = parseMotorCapacity(car.motorCapacity);
      const year = car.manufactureYear;

      return isHighPriorityReq ? true : (cc >= 1200 || year >= 2010);
    });

    return filtered.sort((a, b) => {
      const aCC = parseMotorCapacity(a.motorCapacity);
      const bCC = parseMotorCapacity(b.motorCapacity);
      const ccCompare = bCC - aCC;

      if (ccCompare === 0) {
        return b.manufactureYear - a.manufactureYear;
      }
      return ccCompare;
    });
  }, []);

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.selectedModels.length === 0) {
      setErrors({ selectedModels: 'Please select at least one car model' });
      return;
    }
    
    setIsAssigning(true);
    setAssignmentResult(null);
  
    try {
      const eligibleCars = filterAndSortCars(
        availableCars,
        formData.selectedModels,
        isHighPriority
      );

      if (eligibleCars.length === 0) {
        const payload = {
          ...formData,
          totalPercentage,
          status: 'Pending',
          carIds: [],
          plateNumbers: '',
          model: `/${formData.selectedModels.join(',')}`,
          numberOfCar: `0/${formData.selectedModels.length}`
        };

        const response = await axios.post('http://localhost:8080/auth/car/assign', payload);
  
        if (response.data.codStatus === 200) {
          setAssignmentResult({
            success: true,
            message: 'No available automobiles matching criteria. Your request has been saved and will be processed when matching vehicles become available.',
            status: 'Pending',
            numberOfCar: `0/${formData.selectedModels.length}`
          });
          setShowSuccessModal(true);
          resetForm();
          await fetchData();
        } else {
          throw new Error(response.data.message || 'Failed to save request');
        }
        return;
      }
  
      let selectedCars: Car[] = [];
      const assignedModels: string[] = [];
      
      for (const model of formData.selectedModels) {
        const carForModel = eligibleCars.find(car => 
          car.model === model && 
          !selectedCars.some(c => c.plateNumber === car.plateNumber)
        );
        
        if (carForModel) {
          selectedCars.push(carForModel);
          assignedModels.push(model);
        }
      }

      const unassignedModels = formData.selectedModels.filter(m => !assignedModels.includes(m));
      
      const modelString = unassignedModels.length > 0 ?
        `${assignedModels.join(',')}/${unassignedModels.join(',')}` :
        assignedModels.join(',');

      setProposedCars(selectedCars);
      
      if (selectedCars.length > 0) {
        setShowConfirmation(true);
      } else {
        throw new Error('No matching cars found for selected models');
      }
  
    } catch (error) {
      console.error('Assignment error:', error);
      setAssignmentResult({
        success: false,
        message: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Error processing assignment'
      });
      setShowSuccessModal(true);
    } finally {
      setIsAssigning(false);
    }
  };

  const confirmAssignment = async () => {
    if (proposedCars.length === 0) return;

    setIsAssigning(true);
  
    try {
      const assignedModels = proposedCars.map(car => car.model);
      const unassignedModels = formData.selectedModels.filter(m => !assignedModels.includes(m));
      
      const modelString = unassignedModels.length > 0 ?
        `${assignedModels.join(',')}/${unassignedModels.join(',')}` :
        assignedModels.join(',');

      const assignedCount = proposedCars.length;
      const requestedCount = formData.selectedModels.length;
      const isFullyAssigned = assignedCount === requestedCount;
      const status = isFullyAssigned ? 'Assigned' : 'Pending';
      const numberOfCar = `${assignedCount}/${requestedCount}`;

      await Promise.all(
        proposedCars.map(car => 
          axios.put(`http://localhost:8080/auth/car/status/${car.plateNumber}`, {
            status: 'Assigned',
            assignmentDate: new Date().toISOString().split('T')[0]
          })
        )
      );

      const payload = {
        ...formData,
        totalPercentage,
        status,
        carIds: proposedCars.map(car => car.id),
        plateNumbers: proposedCars.map(car => car.plateNumber).join(', '),
        model: modelString,
        numberOfCar
      };

      const response = await axios.post('http://localhost:8080/auth/car/assign', payload);
  
      if (response.data.codStatus === 200) {
        setAssignmentResult({
          success: true,
          message: isFullyAssigned 
            ? 'All requested vehicles assigned successfully!' 
            : `Partially assigned (${assignedCount} of ${requestedCount} vehicles). Remaining will be assigned automatically when available.`,
          assignedCars: proposedCars,
          assignedRequest: formData,
          status,
          assignmentDate: new Date().toISOString().split('T')[0],
          numberOfCar
        });
        
        setShowConfirmation(false);
        setShowSuccessModal(true);
        resetForm();
        await fetchData();
      } else {
        throw new Error(response.data.message || 'Failed to create assignment');
      }
  
    } catch (error) {
      console.error('Assignment error:', error);
      setAssignmentResult({
        success: false,
        message: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Error processing assignment'
      });
      setShowSuccessModal(true);
    } finally {
      setIsAssigning(false);
    }
  };

  const resetForm = () => {
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
      gender: 'male',
      selectedModels: []
    });
    setProposedCars([]);
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
          <h2 className="text-xl font-bold text-gray-800">Directorate Vehicle Assignment</h2>
          
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
                    <option value="Director General">Director General</option>
                    <option value="Deputy Director">Deputy Director</option>
                    <option value="Executive Office">Executive Office</option>
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
                    🌍 Travel/Work Percentage
                  </label>
                  <select
                    name="travelWorkPercentage"
                    value={formData.travelWorkPercentage}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </motion.div>
  
              <motion.div whileHover={{ scale: 1.02 }}>
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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </motion.div>
            </div>
          </div>
            
          {/* Three Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mobility Issue */}
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
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </motion.div>
  
            {/* Gender */}
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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </motion.div>
  
            {/* Car Model Selection */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="form-group">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Car Models (Max 3)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCarModelDropdown(!showCarModelDropdown)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.selectedModels ? 'border-red-500' : 'border-gray-300'
                    } text-left flex justify-between items-center bg-gray-50`}
                  >
                    {formData.selectedModels.length > 0 
                      ? formData.selectedModels.join(', ')
                      : 'Select car models'}
                    <FiChevronDown className={`transition-transform ${showCarModelDropdown ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {showCarModelDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto">
                      {STATIC_CAR_MODELS.map(model => (
                        <div key={model} className="flex items-center p-2 hover:bg-gray-100 rounded">
                          <input
                            type="checkbox"
                            id={`car-${model}`}
                            checked={formData.selectedModels.includes(model)}
                            onChange={() => handleModelSelect(model)}
                            disabled={!formData.selectedModels.includes(model) && formData.selectedModels.length >= 3}
                            className="mr-2"
                          />
                          <label htmlFor={`car-${model}`} className="cursor-pointer">
                            {model}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.selectedModels && (
                    <p className="mt-1 text-sm text-red-500">{errors.selectedModels}</p>
                  )}
                  {formData.selectedModels.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {formData.selectedModels.length}/3
                    </p>
                  )}
                </div>
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
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAssigning ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                '🚀 Assign Vehicles'
              )}
            </button>
          </motion.div>
        </form>
  
        {/* Auto-Assign Confirmation Modal */}
        {showAutoConfirm && (
          <AutoCarConfirmation
            cars={autoAssignCars}
            onConfirm={confirmAutoAssignment}
            onCancel={() => setShowAutoConfirm(false)}
          />
        )}
  
        {/* Assignment Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && proposedCars.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-0 max-w-2xl w-full border border-gray-200 shadow-xl flex flex-col"
                style={{ maxHeight: '90vh' }}
              >
                {/* Fixed Header */}
                <div className="sticky top-0 bg-white px-8 pt-8 pb-4 border-b border-gray-200 z-10">
                  <h3 className="text-2xl font-bold text-blue-800">
                    🚨 Confirm Vehicle Assignment
                  </h3>
                </div>
  
                {/* Scrollable Content */}
                <div className="overflow-y-auto px-8 py-4 flex-1">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Request Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">👤</span>
                        <div>
                          <p className="text-sm text-blue-600">Requester</p>
                          <p className="font-medium text-gray-800">
                            {formData.requesterName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">📋</span>
                        <div>
                          <p className="text-sm text-blue-600">Position</p>
                          <p className="font-medium text-gray-800">
                            Directorate (Level 1)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">📊</span>
                        <div>
                          <p className="text-sm text-blue-600">Priority Score</p>
                          <p className="font-medium text-gray-800">
                            {totalPercentage}% {isHighPriority && '(High Priority)'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-2xl">🔢</span>
                        <div>
                          <p className="text-sm text-blue-600">Vehicles Requested</p>
                          <p className="font-medium text-gray-800">
                            {formData.selectedModels.length > 0 
                              ? `${proposedCars.length} of ${formData.selectedModels.length}`
                              : '1'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Selected Vehicles</h4>
                  <div className="space-y-4 mb-8">
                    {proposedCars.map((car, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-2xl">🚗</span>
                          <div>
                            <p className="text-sm text-blue-600">Plate Number</p>
                            <p className="font-medium text-gray-800">
                              {car.plateNumber || 'Not available'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-2xl">📝</span>
                          <div>
                            <p className="text-sm text-blue-600">Model</p>
                            <p className="font-medium text-gray-800">
                              {car.model || 'Not available'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-2xl">🏷️</span>
                          <div>
                            <p className="text-sm text-blue-600">Type</p>
                            <p className="font-medium text-gray-800">
                              {car.carType || 'Not available'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-2xl">⚙️</span>
                          <div>
                            <p className="text-sm text-blue-600">Motor Capacity</p>
                            <p className="font-medium text-gray-800">
                              {parseMotorCapacity(car.motorCapacity)}cc
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
  
                {/* Fixed Footer */}
                <div className="sticky bottom-0 bg-white px-8 py-4 border-t border-gray-200 z-10">
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowConfirmation(false);
                        setProposedCars([]);
                      }}
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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
  
        {/* Success/Failure Modal */}
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
                  assignmentResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {assignmentResult.success ? '✅ Assignment Successful' : '❌ Assignment Failed'}
                </h3>
  
                <div className="flex-1 overflow-y-auto max-h-[70vh] pr-4">
                  <div className="space-y-6">
                    <p className={`text-lg font-medium ${
                      assignmentResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {assignmentResult.message}
                    </p>
  
                    {assignmentResult.success && (
                      <>
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-800">Assignment Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">📄</span>
                              <div>
                                <p className="text-sm text-gray-600">Request Letter No</p>
                                <p className="font-medium text-gray-800">
                                  {formData.requestLetterNo}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">👤</span>
                              <div>
                                <p className="text-sm text-gray-600">Requester</p>
                                <p className="font-medium text-gray-800">
                                  {formData.requesterName}
                                </p>
                              </div>
                            </div>
                            {assignmentResult.assignedCars && (
                              <>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <span className="text-2xl">🚗</span>
                                  <div>
                                    <p className="text-sm text-gray-600">Assigned Vehicles</p>
                                    <p className="font-medium text-gray-800">
                                      {assignmentResult.assignedCars.map(c => c.plateNumber).join(', ')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <span className="text-2xl">📅</span>
                                  <div>
                                    <p className="text-sm text-gray-600">Assignment Date</p>
                                    <p className="font-medium text-gray-800">
                                      {new Date(assignmentResult.assignmentDate || '').toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">🔢</span>
                              <div>
                                <p className="text-sm text-gray-600">Assignment Status</p>
                                <p className="font-medium text-gray-800">
                                  {assignmentResult.status}
                                  {assignmentResult.numberOfCar && 
                                   ` (${assignmentResult.numberOfCar})`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
  
                <div className="mt-8 flex justify-end pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowSuccessModal(false);
                      setAssignmentResult(null);
                    }}
                    className={`px-6 py-2 ${
                      assignmentResult.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    } text-white rounded-lg transition-colors`}
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