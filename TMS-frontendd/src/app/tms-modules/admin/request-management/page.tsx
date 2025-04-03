// app/tms-modules/admin/request-management/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiTruck, 
  FiMapPin, 
  FiEye, 
  FiUser, 
  FiPhone, 
  FiCalendar, 
  FiHome, 
  FiBriefcase, 
  FiCheck, 
  FiClock,
  FiInfo,
  FiX,
  FiMail
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

interface ServiceRequest {
  id: number;
  employeeId: string;
  fullName: string;
  department: string;
  phoneNumber: string;
  email: string;
  homeLocation: string;
  pickupLocation: string;
  preferredTime: string;
  returnTime?: string;
  purpose: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  assignedCar?: string;
  driverName?: string;
  notes?: string;
  carType: string;
  createdBy?: string;
  approver?: string;
  budgetCode?: string;
  requestType?: 'DAILY' | 'OCCASIONAL';
  passengers?: number;
  additionalRequirements?: string;
  approvalDate?: string;
  rejectionReason?: string;
  completionDate?: string;
}

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
  status: RequestStatus;
  assignedCar?: string | null;
}

export default function RequestManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'service' | 'travel'>('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serviceRequestsData, setServiceRequestsData] = useState<ServiceRequest[]>([]);
  const [travelRequestsData, setTravelRequestsData] = useState<TravelRequest[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockServiceRequests: ServiceRequest[] = [
      {
        id: 1,
        employeeId: 'EMP001',
        fullName: 'John Doe',
        department: 'Software Development',
        phoneNumber: '1234567890',
        email: 'john.doe@example.com',
        homeLocation: 'Downtown',
        pickupLocation: 'Main Office',
        preferredTime: '08:00 AM',
        returnTime: '05:00 PM',
        purpose: 'Client visit',
        status: 'Pending',
        createdAt: '2023-05-15',
        carType: 'Sedan',
        requestType: 'DAILY',
        passengers: 3,
        additionalRequirements: 'Need child seat',
        createdBy: 'admin@example.com'
      },
    ];

    const mockTravelRequests: TravelRequest[] = [
      {
        id: 1,
        startingPlace: 'New York',
        travelerName: 'John Doe',
        carType: 'SUV',
        startingDate: '2025-04-10',
        department: 'IT',
        destinationPlace: 'Los Angeles',
        travelReason: 'Business Meeting',
        travelDistance: 450.5,
        returnDate: '2025-04-15',
        jobStatus: 'Pending',
        claimantName: 'Jane Smith',
        approvement: 'Awaiting',
        teamLeaderName: 'Robert Johnson',
        createdAt: '2025-04-01T17:04:51.548398',
        createdBy: 'anonymousUser',
        status: 'Pending'
      },
      {
        id: 2,
        startingPlace: 'Adiss Abeba',
        travelerName: 'Amlakie Doe',
        carType: 'SUV',
        startingDate: '2025-04-10',
        department: 'SW',
        destinationPlace: 'Bolie',
        travelReason: 'Business Meeting',
        travelDistance: 450.5,
        returnDate: '2025-04-15',
        jobStatus: 'Pending',
        claimantName: 'Jane Smith',
        approvement: 'Awaiting',
        teamLeaderName: 'Robert Johnson',
        createdAt: '2025-04-01T21:36:30.26756',
        createdBy: 'anonymousUser',
        status: 'Pending'
      },
      {
        id: 3,
        startingPlace: 'Mexico',
        travelerName: 'Bruke',
        carType: 'SUV',
        startingDate: '2025-04-10',
        department: 'SW',
        destinationPlace: 'Ayat',
        travelReason: 'project doing',
        travelDistance: 300.5,
        returnDate: '2025-04-15',
        jobStatus: 'Pending',
        claimantName: 'Jane Smith',
        approvement: 'Awaiting',
        teamLeaderName: 'Robert Johnson',
        createdAt: '2025-04-01T21:37:36.049827',
        createdBy: 'anonymousUser',
        status: 'Pending'
      }
    ];

    setServiceRequestsData(mockServiceRequests);
    setTravelRequestsData(mockTravelRequests);
  }, []);

  const showSuccessAlert = (message: string) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // In a real app, you would fetch fresh data here
      // const serviceRes = await fetchServiceRequests();
      // const travelRes = await fetchTravelRequests();
      // setServiceRequestsData(serviceRes.data);
      // setTravelRequestsData(travelRes.data);
      
      // For demo purposes, we'll just simulate a refresh
      setTimeout(() => {
        setIsRefreshing(false);
        showSuccessAlert('Requests refreshed successfully');
      }, 1000);
    } catch (error) {
      setIsRefreshing(false);
      Swal.fire('Error', 'Failed to refresh requests', 'error');
    }
  };

  const handleViewRequest = (id: number) => {
    router.push(`/tms-modules/admin/request-management/${activeTab}/${id}`);
  };

  const handleAssignCar = async (id: number) => {
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

    if (result?.car) {
      try {
        // Update local state for demo purposes
        if (activeTab === 'service') {
          setServiceRequestsData(prev => prev.map(req => 
            req.id === id ? { ...req, assignedCar: result.car, driverName: result.driver, status: 'Approved' } : req
          ));
        } else {
          setTravelRequestsData(prev => prev.map(req => 
            req.id === id ? { ...req, assignedCar: result.car, status: 'Approved' } : req
          ));
        }
        
        showSuccessAlert(`Car ${result.car} assigned${result.driver ? ` with driver ${result.driver}` : ''}`);
      } catch (error) {
        Swal.fire('Error', 'Failed to assign car', 'error');
      }
    }
  };

  const filteredServiceRequests = serviceRequestsData.filter(request => 
    Object.values(request).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredTravelRequests = travelRequestsData.filter(request => 
    Object.values(request).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Completed: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="p-6 space-y-6 overflow-x-hidden">
      {/* Header and Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <h1 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Request Management
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search all fields..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            disabled={isRefreshing}
          >
            <FiRefreshCw className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex border-b border-gray-200"
      >
        <button
          onClick={() => setActiveTab('service')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'service' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiTruck /> Service Requests ({serviceRequestsData.length})
        </button>
        <button
          onClick={() => setActiveTab('travel')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'travel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiMapPin /> Travel Requests ({travelRequestsData.length})
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { 
            title: 'Total Requests', 
            value: activeTab === 'service' ? serviceRequestsData.length : travelRequestsData.length,
            icon: <FiInfo className="h-6 w-6" />, 
            color: 'text-blue-600', 
            bgColor: 'bg-blue-100' 
          },
          { 
            title: 'Pending', 
            value: activeTab === 'service' 
              ? serviceRequestsData.filter(r => r.status === 'Pending').length
              : travelRequestsData.filter(r => r.status === 'Pending').length,
            icon: <FiClock className="h-6 w-6" />, 
            color: 'text-yellow-600', 
            bgColor: 'bg-yellow-100' 
          },
          { 
            title: 'Approved', 
            value: activeTab === 'service' 
              ? serviceRequestsData.filter(r => r.status === 'Approved').length
              : travelRequestsData.filter(r => r.status === 'Approved').length,
            icon: <FiCheck className="h-6 w-6" />, 
            color: 'text-green-600', 
            bgColor: 'bg-green-100' 
          },
          { 
            title: 'Completed', 
            value: activeTab === 'service' 
              ? serviceRequestsData.filter(r => r.status === 'Completed').length
              : travelRequestsData.filter(r => r.status === 'Completed').length,
            icon: <FiCheck className="h-6 w-6" />, 
            color: 'text-purple-600', 
            bgColor: 'bg-purple-100' 
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl"
            onClick={() => setSearchTerm(stat.title.split(' ')[0].toLowerCase())}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Request Table */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === 'service' ? 'Service Car Requests' : 'Travel Requests'}
          </h2>
          <div className="text-sm text-gray-500">
            Showing {activeTab === 'service' ? filteredServiceRequests.length : filteredTravelRequests.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {activeTab === 'service' ? (
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiUser /> Employee
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiPhone /> Contact
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiHome /> Locations
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiCalendar /> Schedule
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiBriefcase /> Purpose
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiTruck /> Vehicle
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiUser /> Traveler
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiMapPin /> Start/Destination
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiCalendar /> Dates
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiTruck /> Car Type
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiBriefcase /> Department
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiMapPin /> Distance
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiInfo /> Reason
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiUser /> Claimant
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiCheck /> Approval
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiUser /> Team Leader
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiCalendar /> Created
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === 'service' ? (
                filteredServiceRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{request.fullName}</div>
                      <div className="text-sm text-gray-500">{request.employeeId}</div>
                      <div className="text-sm text-gray-500">{request.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <FiPhone size={14} /> {request.phoneNumber}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <FiMail size={14} /> {request.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">From:</span> {request.pickupLocation}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">To:</span> {request.homeLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Pickup:</span> {request.preferredTime}
                      </div>
                      {request.returnTime && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Return:</span> {request.returnTime}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Created: {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{request.purpose}</div>
                      {request.notes && (
                        <div className="text-xs text-gray-500">Notes: {request.notes}</div>
                      )}
                      {request.additionalRequirements && (
                        <div className="text-xs text-blue-500">Requirements: {request.additionalRequirements}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.carType}</div>
                      {request.passengers && (
                        <div className="text-xs text-gray-500">{request.passengers} passengers</div>
                      )}
                      {request.requestType && (
                        <div className="text-xs text-purple-500">{request.requestType}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.assignedCar ? (
                        <>
                          <div>{request.assignedCar}</div>
                          {request.driverName && (
                            <div className="text-xs text-gray-400">Driver: {request.driverName}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="View details"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAssignCar(request.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                          title="Assign car"
                          disabled={request.status === 'Completed'}
                        >
                          <FiTruck className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredTravelRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{request.travelerName}</div>
                      <div className="text-xs text-gray-500">Created by: {request.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">From:</span> {request.startingPlace}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">To:</span> {request.destinationPlace}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Start:</span> {new Date(request.startingDate).toLocaleDateString()}
                      </div>
                      {request.returnDate && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Return:</span> {new Date(request.returnDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.carType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.travelDistance} km</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{request.travelReason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.claimantName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.approvement}</div>
                      <div className="text-xs text-gray-500">{request.jobStatus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.teamLeaderName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.assignedCar || (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="View details"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAssignCar(request.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                          title="Assign car"
                          disabled={request.status === 'Completed'}
                        >
                          <FiTruck className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}