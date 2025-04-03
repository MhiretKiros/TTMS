"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMapPin, 
  FiCalendar, 
  FiTruck, 
  FiBriefcase, 
  FiPhone,
  FiMail,
  FiClock
} from 'react-icons/fi';
import { fetchTravelRequestById } from '../../api';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { motion } from 'framer-motion';

interface TravelRequest {
  id: number;
  startingPlace: string;
  travelerName: string;
  carType: string;
  startingDate: string;
  department: string;
  destinationPlace: string;
  travelReason: string;
  travelDistance: number;
  returnDate?: string;
  jobStatus: string;
  claimantName: string;
  approvement: string;
  teamLeaderName: string;
  createdAt: string;
  createdBy: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  assignedCar?: string;
  driverName?: string;
  phoneNumber?: string;
  email?: string;
  additionalRequirements?: string;
}

export default function TravelRequestView() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchTravelRequestById(Number(id));
        
        if (response.codStatus === 200 && response.travelRequest) {
          setRequest(response.travelRequest);
        } else {
          throw new Error(response.message || 'Request not found');
        }
      } catch (err) {
        console.error('Error loading travel request:', err);
        setError(err instanceof Error ? err.message : 'Failed to load travel request');
        Swal.fire({
          title: 'Error!',
          text: err instanceof Error ? err.message : 'Failed to load travel request',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadRequest();
  }, [id]);

  const handleAssignCar = async () => {
    const { value: result } = await Swal.fire({
      title: 'Assign Car',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Car</label>
            <select id="carSelect" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">-- Select a car --</option>
              <option value="ABC-123">ABC-123 (Toyota Camry)</option>
              <option value="XYZ-789">XYZ-789 (Honda CR-V)</option>
              <option value="DEF-456">DEF-456 (Ford Transit)</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Driver (if needed)</label>
            <input id="driverInput" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Optional driver name">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Assign',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const select = Swal.getPopup()?.querySelector('#carSelect') as HTMLSelectElement;
        const driverInput = Swal.getPopup()?.querySelector('#driverInput') as HTMLInputElement;
        return {
          car: select.value,
          driver: driverInput.value
        };
      }
    });
  }

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 flex justify-center items-center h-64"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          {error}
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/tms-modules/admin/request-management')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Requests
        </motion.button>
      </motion.div>
    );
  }

  if (!request) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <p>Travel request not found</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/tms-modules/admin/request-management')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Requests
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <motion.h1 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
      >
        Travel Request #{request.id}
      </motion.h1>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traveler Information */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 group"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <motion.span 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
                className="w-3 h-3 bg-blue-500 rounded-full mr-2"
              />
              Traveler Information
            </h2>
            <div className="space-y-4">
              {[
                { label: "Traveler Name", value: request.travelerName, icon: <FiUser className="mr-1" /> },
                { label: "Phone Number", value: request.phoneNumber, icon: <FiPhone className="mr-1" /> },
                { label: "Email", value: request.email, icon: <FiMail className="mr-1" /> },
                { label: "Department", value: request.department },
                { label: "Claimant", value: request.claimantName },
                { label: "Team Leader", value: request.teamLeaderName },
                { label: "Created By", value: request.createdBy }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ 
                    x: 5,
                    backgroundColor: "rgba(239, 246, 255, 0.5)"
                  }}
                  className="flex border-b border-gray-100 pb-3 px-2 rounded-md transition-all duration-200"
                >
                  <span className="font-medium text-gray-600 w-40 group-hover:text-blue-600 transition-colors">
                    {item.label}:
                  </span>
                  <motion.span 
                    whileHover={{ scale: 1.03 }}
                    className="text-gray-800 font-medium flex items-center"
                  >
                    {item.icon && item.icon}
                    {item.value || '-'}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Trip Details */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 group"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <motion.span 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5
                }}
                className="w-3 h-3 bg-purple-500 rounded-full mr-2"
              />
              Trip Details
            </h2>
            <div className="space-y-4">
              {[
                { label: "Starting Place", value: request.startingPlace, icon: <FiMapPin className="mr-1" /> },
                { label: "Destination", value: request.destinationPlace, icon: <FiMapPin className="mr-1" /> },
                { label: "Start Date", value: new Date(request.startingDate).toLocaleDateString(), icon: <FiCalendar className="mr-1" /> },
                { label: "Return Date", value: request.returnDate ? new Date(request.returnDate).toLocaleDateString() : '-', icon: <FiCalendar className="mr-1" /> },
                { label: "Travel Distance", value: `${request.travelDistance} km` },
                { label: "Car Type", value: request.carType, icon: <FiTruck className="mr-1" /> },
                { label: "Travel Reason", value: request.travelReason },
                { label: "Additional Requirements", value: request.additionalRequirements || '-' },
                { label: "Approval Status", value: request.approvement },
                { label: "Request Status", value: request.status },
                { label: "Assigned Car", value: request.assignedCar || '-' },
                { label: "Driver", value: request.driverName || '-' },
                { label: "Created At", value: new Date(request.createdAt).toLocaleString(), icon: <FiClock className="mr-1" /> }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ 
                    x: 5,
                    backgroundColor: "rgba(245, 243, 255, 0.5)"
                  }}
                  className="flex border-b border-gray-100 pb-3 px-2 rounded-md transition-all duration-200"
                >
                  <span className="font-medium text-gray-600 w-40 group-hover:text-purple-600 transition-colors">
                    {item.label}:
                  </span>
                  <motion.span 
                    whileHover={{ scale: 1.03 }}
                    className={`text-gray-800 font-medium flex items-center ${
                      item.label === 'Request Status' ? 
                        request.status === 'Pending' ? 'text-yellow-600' :
                        request.status === 'Approved' ? 'text-green-600' :
                        request.status === 'Rejected' ? 'text-red-600' :
                        'text-blue-600' : ''
                    }`}
                  >
                    {item.icon && item.icon}
                    {item.value}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ 
            scale: 1.05,
            background: "linear-gradient(to right, #4f46e5, #7c3aed)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/tms-modules/admin/request-management")}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <motion.span
            whileHover={{ x: -3 }}
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" /> 
            <span>Back to Requests</span>
          </motion.span>
        </motion.button>

        <motion.button
          whileHover={{ 
            scale: 1.05,
            background: "linear-gradient(to right, #10b981, #059669)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAssignCar}
          disabled={request.status === 'Completed'}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Assign Car
        </motion.button>
      </div>
    </motion.div>
  );
}