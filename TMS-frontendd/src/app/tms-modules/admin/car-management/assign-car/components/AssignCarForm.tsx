// src/app/tms-modules/admin/car-management/assign-cars/page.tsx
'use client'
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/app/contexts/NotificationContext';

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
  assignedRequest?: FormData;
  status?: 'Pending' | 'Assigned' | 'Not Assigned';
  assignmentDate?: string;
}

interface PendingRequest {
  id: string;
  formData: FormData;
  totalPercentage: number;
  createdAt: string;
  status: 'Pending' | 'Assigned' | 'Not Assigned';
}

const parseMotorCapacity = (motorCapacity: string): number => {
  const numericValue = parseInt(motorCapacity.replace(/\D/g, ''), 10);
  return isNaN(numericValue) ? 0 : numericValue;
};

const positionLabels = {
  'Level 2': 'Director',
  'Level 3': 'Sub Director',
  'Level 4': 'Division',
  'Level 5': 'Experts'
};

const positionPriority = {
  'Level 2': 2,
  'Level 3': 3,
  'Level 4': 4,
  'Level 5': 5
};

const travelPoints = { low: 15, medium: 25, high: 35 };
const noticePoints = { low: 35, medium: 45, high: 55 };

export default function RentalRequestForm() {
  // Manual assignment state
  const [formData, setFormData] = useState<FormData>({
    requestLetterNo: '',
    requestDate: new Date().toISOString().split('T')[0],
    requesterName: '',
    rentalType: 'standard',
    position: 'Level 2',
    department: '',
    phoneNumber: '',
    travelWorkPercentage: 'low',
    shortNoticePercentage: 'low',
    mobilityIssue: 'no',
    gender: 'male'
  });

  const { addNotification } = useNotification();
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [proposedCar, setProposedCar] = useState<Car | null>(null);

  // Automatic checking state
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [approvedStandardCars, setApprovedStandardCars] = useState<Car[]>([]);
  const [approvedOrgCars, setApprovedOrgCars] = useState<Car[]>([]);
  const [showAutoConfirmation, setShowAutoConfirmation] = useState(false);
  const [autoAssignment, setAutoAssignment] = useState<{
    car: Car;
    request: PendingRequest;
  } | null>(null);

  const isHighPriority = totalPercentage >= 70;

  // Calculate priority score
  useEffect(() => {
    let total = 0;
    total += travelPoints[formData.travelWorkPercentage] || 0;
    total += noticePoints[formData.shortNoticePercentage] || 0;
    total += formData.mobilityIssue === 'yes' ? 5 : 0;
    total += formData.gender === 'female' ? 5 : 1;
    setTotalPercentage(total);
  }, [formData.travelWorkPercentage, formData.shortNoticePercentage, 
      formData.mobilityIssue, formData.gender]);

  // Enhanced filterAndSortCars function
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

  // Enhanced request sorting with Level 5 percentage priority
  const sortRequests = useCallback((requests: PendingRequest[]) => {
    return [...requests].sort((a, b) => {
      // Special case: Both are Level 5 - sort by percentage descending
      if (a.formData.position === 'Level 5' && b.formData.position === 'Level 5') {
        return b.totalPercentage - a.totalPercentage;
      }
      
      // Check high priority (70%+)
      const aIsHighPriority = a.totalPercentage >= 70;
      const bIsHighPriority = b.totalPercentage >= 70;
      
      // If one is high priority and other isn't, high priority comes first
      if (aIsHighPriority !== bIsHighPriority) {
        return aIsHighPriority ? -1 : 1;
      }
      
      // Otherwise sort by position level (Level 1 first)
      return positionPriority[a.formData.position] - positionPriority[b.formData.position];
    });
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      console.log('Fetching all data...');
      const [standardCars, orgCars, requests] = await Promise.all([
        fetchApprovedCars('standard'),
        fetchApprovedCars('organizational'),
        fetchPendingRequests()
      ]);
      
      console.log('Fetched standard cars:', standardCars.length);
      console.log('Fetched org cars:', orgCars.length);
      console.log('Fetched requests:', requests.length);
      
      setApprovedStandardCars(standardCars);
      setApprovedOrgCars(orgCars);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const fetchApprovedCars = async (rentalType: string): Promise<Car[]> => {
    try {
      const endpoint = rentalType === 'organizational' 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/approved` 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/approved`;
      
      const response = await axios.get(endpoint);
      const data = response.data;

      if (data.codStatus === 200 || (data.status && data.status === 200)) {
        const rawCars = rentalType === 'organizational' ? data.rentCarList : data.carList;
        
        return rawCars
          .filter((car: any) => car.status.toLowerCase() === 'inspectedandready')
          .map((car: any) => rentalType === 'organizational' ? {
            id: car.id,
            plateNumber: car.plateNumber,
            model: car.model,
            carType: car.vehiclesType?.toLowerCase() || car.carType?.toLowerCase() || '',
            manufactureYear: parseInt(car.proYear || car.manufactureYear),
            motorCapacity: car.cc || car.motorCapacity,
            status: car.status,
            fuelType: car.fuelType,
            parkingLocation: car.department || car.parkingLocation,
            frameNo: car.frameNo,
            companyName: car.companyName,
            vehiclesUsed: car.vehiclesUsed,
            bodyType: car.bodyType
          } : {
            ...car,
            carType: car.carType?.toLowerCase() || ''
          });
      }
      return [];
    } catch (error) {
      console.error('Error fetching approved cars:', error);
      return [];
    }
  };

const fetchPendingRequests = async (): Promise<PendingRequest[]> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/assignments/pending`);
    
    if (!response.data) {
      console.error('No data received in response');
      return [];
    }

    if (response.data.codStatus === 200) {
      const requests = response.data.assignmentHistoryList || [];
      
      return requests
        .filter((req: any) => req.position !== 'Level 1') // Exclude Level 1 requests
        .map((req: any) => ({
          id: req.id.toString(),
          formData: {
            requestLetterNo: req.requestLetterNo,
            requestDate: req.requestDate.split('T')[0],
            requesterName: req.requesterName,
            rentalType: req.rentalType.toLowerCase() as 'standard' | 'project' | 'organizational',
            position: req.position as 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5',
            department: req.department,
            phoneNumber: req.phoneNumber,
            travelWorkPercentage: req.travelWorkPercentage.toLowerCase() as 'low' | 'medium' | 'high',
            shortNoticePercentage: req.shortNoticePercentage.toLowerCase() as 'low' | 'medium' | 'high',
            mobilityIssue: req.mobilityIssue.toLowerCase() as 'yes' | 'no',
            gender: req.gender.toLowerCase() as 'male' | 'female'
          },
          totalPercentage: req.totalPercentage,
          createdAt: req.assignedDate,
          status: req.status as 'Pending' | 'Assigned' | 'Not Assigned'
        }));
    }
    
    console.error('Unexpected response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
};

  // Enhanced automatic assignment with proper modal handling
const checkForAutoAssignments = useCallback(async () => {
  // Skip if any modal is already open
  if (showAutoConfirmation || showConfirmation || showSuccessModal) {
    console.log('Skipping auto-assignment - modal already open');
    return;
  }

  try {
    console.log('Starting auto-assignment check...');
    
    // Get all approved automobiles from both sources
    const allApprovedAutomobiles = [...approvedStandardCars, ...approvedOrgCars]
      .filter(car => {
        const carType = car.carType?.toLowerCase() || '';
        const isAutomobile = carType.includes('auto') || carType.includes('autho');
        return isAutomobile && car.status === 'InspectedAndReady';
      });

    console.log('Total approved automobiles:', allApprovedAutomobiles.length);
    
    if (allApprovedAutomobiles.length === 0 || pendingRequests.length === 0) {
      console.log('No cars or requests available for auto-assignment');
      return;
    }

    // Sort requests by priority (already excludes Level 1 from fetch)
    const sortedRequests = sortRequests(pendingRequests);
    console.log('Pending requests to process:', sortedRequests.length);

    // Process requests in priority order
    for (const request of sortedRequests) {
      // Additional safeguard (though fetch should have filtered already)
      if (request.formData.position === 'Level 1') {
        console.log('Skipping Level 1 request:', request.id);
        continue;
      }
      
      console.log(`Processing request ${request.id} (${request.formData.position})`);
      
      const isHighPriority = request.totalPercentage >= 70;
      const eligibleCars = filterAndSortCars(
        allApprovedAutomobiles,
        request.formData.position,
        isHighPriority
      );

      console.log(`Found ${eligibleCars.length} eligible cars for request ${request.id}`);
      
      if (eligibleCars.length > 0) {
        const bestCar = eligibleCars[0];
        console.log('Found matching car:', bestCar.plateNumber);
        
        // Set the assignment and show confirmation
        setAutoAssignment({
          car: bestCar,
          request: request
        });
        setShowAutoConfirmation(true);
        console.log('Showing auto-assignment confirmation');
        return; // Stop after first match
      }
    }
  } catch (error) {
    console.error('Auto assignment error:', error);
  }
}, [
  approvedStandardCars, 
  approvedOrgCars, 
  pendingRequests, 
  showAutoConfirmation, 
  showConfirmation,
  showSuccessModal
]);

  // Enhanced useEffect for data loading and auto-assignment
  useEffect(() => {
    let isMounted = true;
    
    const loadDataAndCheckAssignments = async () => {
      try {
        console.log('Loading all data...');
        await fetchAllData();
        
        if (isMounted) {
          // Initial check after data load
          await checkForAutoAssignments();
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    loadDataAndCheckAssignments();

    // Setup interval for periodic checks
    const interval = setInterval(() => {
      if (isMounted && !showAutoConfirmation && !showConfirmation && !showSuccessModal) {
        checkForAutoAssignments();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchAllData, checkForAutoAssignments]);

  // Manual assignment functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as FormData[keyof FormData]
    }));
  };

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAssigning(true);
    setAssignmentResult(null);
  
    try {
      const allApprovedCars = [...approvedStandardCars, ...approvedOrgCars];
      const eligibleCars = filterAndSortCars(
        allApprovedCars.filter(car => {
          const carType = car.carType?.toLowerCase() || '';
          return (carType.includes('auto') || carType.includes('autho')) && 
                 car.status === 'InspectedAndReady';
        }),
        formData.position,
        isHighPriority
      );
  
      if (eligibleCars.length === 0) {
        const payload = {
          requestLetterNo: formData.requestLetterNo,
          requestDate: new Date().toISOString().split('T')[0],
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
          status: 'Pending',
          carId: null,
          plateNumber: null
        };
  
        const endpoint = formData.rentalType === 'organizational' 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/assign` 
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/assign`;
  
        const response = await axios.post(endpoint, payload);
  
        if (response.data.codStatus === 200 || response.data.status === 200) {
          setAssignmentResult({
            success: true,
            message: 'No available automobiles matching criteria. Your request has been saved and will be processed when a matching vehicle becomes available.',
            status: 'Not Assigned'
          });
          setShowSuccessModal(true);
          
          setFormData({
            requestLetterNo: '',
            requestDate: new Date().toISOString().split('T')[0],
            requesterName: '',
            rentalType: 'standard',
            position: 'Level 2',
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

  const confirmAutoAssignment = async () => {
    if (!autoAssignment) return;
  
    setIsAssigning(true);
    
    try {
      const { car, request } = autoAssignment;
      const isOrgCar = approvedOrgCars.some(c => c.id === car.id);
  
      // Prepare the update payload according to your backend requirements
      const updatePayload = {
        status: 'Assigned',
        carId: car.id,
        rentalType: request.formData.rentalType,
        plateNumber: car.plateNumber,
        assignmentDate: new Date().toISOString()
      };
  
      console.log('Update payload:', updatePayload);
  
      // Determine the correct endpoint based on car type
      const endpoint = isOrgCar 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/assignments/update/${request.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/assignments/update/${request.id}`;
  
      // Make the API call to update assignment history
      const updateResponse = await axios.put(endpoint, updatePayload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Check if the update was successful
      const updateSuccess = (updateResponse.data?.codStatus === 200) || 
                           (updateResponse.data?.status === 200);
  
      if (!updateSuccess) {
        throw new Error(updateResponse.data?.message || 'Failed to update assignment history');
      }
  
      // Update the car status separately
      const statusEndpoint = isOrgCar
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status/${car.plateNumber}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${car.plateNumber}`;
  
      const statusResponse = await axios.put(statusEndpoint, { 
        status: 'Assigned',
        assignmentDate: new Date().toISOString()
      });
  
      const statusSuccess = (statusResponse.data?.codStatus === 200) || 
                           (statusResponse.data?.status === 200);
  
      if (!statusSuccess) {
        throw new Error('Failed to update car status');
      }
  
      // Update state with the successful assignment
      setAssignmentResult({
        success: true,
        message: 'Vehicle assignment updated successfully!',
        assignedCar: car,
        assignedRequest: request.formData,
        status: 'Assigned',
        assignmentDate: new Date().toISOString().split('T')[0] 
      });
  
       try {
      await addNotification(
        `New vehicle has been assigned to ${formData.requesterName} needs Approved`,
        `/tms-modules/admin/car-management/assign-car`,
        'HEAD_OF_DISTRIBUTOR' // Role that should see this notification
      );
      
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }
      // Refresh data
      await fetchAllData();
      
    } catch (error) {
      console.error('Assignment update error:', error);
      
      setAssignmentResult({
        success: false,
        message: 'Failed to update assignment',
        details: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : error instanceof Error ? error.message : 'Unknown error'
      });
      
    } finally {
      setIsAssigning(false);
      setShowAutoConfirmation(false);
      setShowSuccessModal(true);
      setAutoAssignment(null);
    }
  };
  
  const confirmAssignment = async (rentalType: string) => {
    if (!proposedCar) return;

    setIsAssigning(true);
  
    try {
      const isOrgCar = rentalType === 'organizational';
      const endpoint = isOrgCar 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/assign` 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/assign`;
  
      const statusEndpoint = isOrgCar
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status/${proposedCar.plateNumber}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${proposedCar.plateNumber}`;
  
      const payload = {
        requestLetterNo: formData.requestLetterNo,
        requestDate: new Date().toISOString().split('T')[0],
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
        status: 'Assigned',
        [isOrgCar ? 'rentCarId' : 'carId']: proposedCar.id,
        plateNumber: proposedCar.plateNumber,
        model: proposedCar.model,
        numberOfCar: '1',
      };
  
      const [assignmentResponse, statusResponse] = await Promise.all([
        axios.post(endpoint, payload),
        axios.put(statusEndpoint, { 
          status: 'Assigned',
          assignmentDate: new Date().toISOString().split('T')[0] 
        })
      ]);
  
      const assignmentSuccess = assignmentResponse.data.codStatus === 200 || 
                               assignmentResponse.data.status === 200;
      
      const statusSuccess = statusResponse.data.codStatus === 200 || 
                           statusResponse.data.status === 200;
  
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
        assignedCar: proposedCar,
        assignedRequest: formData,
        status: 'Assigned',
        assignmentDate: new Date().toISOString().split('T')[0]
      });
  
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
  
      try {
      await addNotification(
        `New vehicle has been assigned to ${formData.requesterName} needs Approved`,
        `/tms-modules/admin/car-management/assign-car`,
        'HEAD_OF_DISTRIBUTOR' // Role that should see this notification
      );
      
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }
      setShowConfirmation(false);
      setShowSuccessModal(true);
      setProposedCar(null);
      
      await fetchAllData();
  
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

  // Initialize and auto-check
  useEffect(() => {
    fetchAllData();
    
    const interval = setInterval(() => {
      if (!showAutoConfirmation && !showSuccessModal) {
        checkForAutoAssignments();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllData, showAutoConfirmation, showSuccessModal, checkForAutoAssignments]);

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 border border-gray-200"
      >
        {/* Manual Assignment Form */}
        <form onSubmit={handleAssign} className="p-8 space-y-8">
          <h2 className="text-xl font-bold text-gray-800">Car Assignment Form</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Request Letter Number
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
                    Requester Name
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
                    Position Level
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                    required
                  >
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
                    Rental Type
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
                    Request Date
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
                    Phone Number
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
                    Department
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
                    Travel/Work Percentage
                  </label>
                  <select
                    name="travelWorkPercentage"
                    value={formData.travelWorkPercentage}
                    onChange={handleChange}
                    className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                  >
                    <option value="low">Low </option>
                    <option value="medium">Medium </option>
                    <option value="high">High </option>
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
                  Short Notice Availability
                </label>
                <select
                  name="shortNoticePercentage"
                  value={formData.shortNoticePercentage}
                  onChange={handleChange}
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                >
                  <option value="low">Low </option>
                  <option value="medium">Medium </option>
                  <option value="high">High</option>
                </select>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Mobility Issue
                </label>
                <select
                  name="mobilityIssue"
                  value={formData.mobilityIssue}
                  onChange={handleChange}
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                >
                  <option value="no">No </option>
                  <option value="yes">Yes </option>
                </select>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <div className="form-group">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
                >
                  <option value="male">Male </option>
                  <option value="female">Female</option>
                </select>
              </div>
            </motion.div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              disabled={isAssigning}
              className={`px-8 py-2 rounded-xl font-bold text-white transition-all ${
                isAssigning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#3c8dbc] hover:bg-[#367fa9]'
              }`}
              style={{ backgroundColor: '#3c8dbc' }}
            >
              {isAssigning ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Assign'
              )}
            </button>
          </motion.div>
        </form>

        {/* Manual Assignment Confirmation Modal */}
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
                  Confirm Vehicle Assignment
                </h3>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Request Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-blue-600">Requester</p>
                        <p className="font-medium text-gray-800">
                          {formData.requesterName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-blue-600">Position</p>
                        <p className="font-medium text-gray-800">
                          {positionLabels[formData.position]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Plate Number</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.plateNumber || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Model</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.model || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Type</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.carType || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Year</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.manufactureYear || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Fuel Type</p>
                      <p className="font-medium text-gray-800">
                        {proposedCar.fuelType || 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Motor Capacity</p>
                      <p className="font-medium text-gray-800">
                        {parseMotorCapacity(proposedCar.motorCapacity)}cc
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
                    }}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => confirmAssignment(formData.rentalType)}
                    disabled={isAssigning}
                    className="px-6 py-2 text-white rounded-lg transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#3c8dbc' }}
                  >
                    {isAssigning ? 'Confirming...' : 'Confirm Assignment'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Automatic Assignment Confirmation Modal */}
        <AnimatePresence>
          {showAutoConfirmation && autoAssignment && (
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
                  Automatic Assignment Available
                </h3>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Pending Request</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-blue-600">Request Letter No</p>
                        <p className="font-medium text-gray-800">
                          {autoAssignment.request.formData.requestLetterNo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-blue-600">Requester</p>
                        <p className="font-medium text-gray-800">
                          {autoAssignment.request.formData.requesterName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-blue-600">Position</p>
                        <p className="font-medium text-gray-800">
                          {positionLabels[autoAssignment.request.formData.position]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-sm text-blue-600">Priority Score</p>
                        <p className="font-medium text-gray-800">
                          {autoAssignment.request.totalPercentage}% 
                          {autoAssignment.request.totalPercentage >= 70 ? ' (High Priority)' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Available Vehicle</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Plate Number</p>
                      <p className="font-medium text-gray-800">
                        {autoAssignment.car.plateNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Model</p>
                      <p className="font-medium text-gray-800">
                        {autoAssignment.car.model || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Type</p>
                      <p className="font-medium text-gray-800">
                        {autoAssignment.car.carType || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm text-blue-600">Year</p>
                      <p className="font-medium text-gray-800">
                        {autoAssignment.car.manufactureYear || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAutoConfirmation(false)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmAutoAssignment}
                    disabled={isAssigning}
                    className="px-6 py-2 text-white rounded-lg transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#3c8dbc' }}
                  >
                    {isAssigning ? 'Confirming...' : 'Confirm Assignment'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success/Failure Modal (shared for both manual and auto) */}
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
                  {assignmentResult.success ? 'Assignment Successful' : 'Assignment Failed'}
                </h3>

                <div className="flex-1 overflow-y-auto max-h-[70vh] pr-4">
                  <div className="space-y-6">
                    <p className={`text-lg font-medium ${
                      assignmentResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {assignmentResult.message}
                    </p>

                    {assignmentResult.success && assignmentResult.assignedCar && (
                      <>
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-800">Assignment Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assignmentResult.assignedRequest && (
                              <>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="text-sm text-gray-600">Request Letter No</p>
                                    <p className="font-medium text-gray-800">
                                      {assignmentResult.assignedRequest.requestLetterNo}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="text-sm text-gray-600">Requester</p>
                                    <p className="font-medium text-gray-800">
                                      {assignmentResult.assignedRequest.requesterName}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm text-gray-600">Assigned Vehicle</p>
                                <p className="font-medium text-gray-800">
                                  {assignmentResult.assignedCar.plateNumber}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm text-gray-600">Assignment Date</p>
                                <p className="font-medium text-gray-800">
                                  {new Date(assignmentResult.assignmentDate || '').toLocaleDateString()}
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
};