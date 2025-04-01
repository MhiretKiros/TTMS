// app/tms-modules/admin/request-management/page.tsx
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiRefreshCw, FiTruck, FiMapPin, FiEye, FiUser, FiPhone, FiCalendar, FiHome, FiBriefcase, FiCheck, FiX, FiClock, FiInfo } from 'react-icons/fi';
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
  returnTime: string;
  purpose: string;
  status: RequestStatus;
  createdAt: string;
  assignedCar: string | null;
  notes: string;
  carType: string;
}

interface TravelRequest {
  id: number;
  travelerName: string;
  employeeId: string;
  department: string;
  destination: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  assignedCar: string | null;
  carType: string;
  travelDistance: string;
  passengers: number;
  approver: string;
  budgetCode: string;
  claimantName: string;
  teamLeaderName: string;
}

const serviceRequests: ServiceRequest[] = [
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
    assignedCar: null,
    notes: 'Need car with GPS',
    carType: 'Sedan'
  },
  // Add more mock data...
];

const travelRequests: TravelRequest[] = [
  {
    id: 1,
    travelerName: 'Mike Johnson',
    employeeId: 'EMP002',
    department: 'Sales',
    destination: 'Client Office',
    startDate: '2023-05-20',
    endDate: '2023-05-21',
    reason: 'Annual client review meeting',
    status: 'Approved',
    createdAt: '2023-05-10',
    assignedCar: 'ABC-123',
    carType: 'Sedan',
    travelDistance: '120 km',
    passengers: 3,
    approver: 'Sarah Williams',
    budgetCode: 'SALES-2023-05',
    claimantName: 'Mike Johnson',
    teamLeaderName: 'David Brown'
  },
  // Add more mock data...
];

export default function RequestManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'service' | 'travel'>('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showSuccessAlert = (message: string) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showSuccessAlert('Requests refreshed successfully');
    }, 1000);
  };

  const handleViewRequest = (id: number) => {
    router.push(`/tms-modules/admin/request-management/${activeTab}/${id}`);
  };

  const handleAssignCar = (id: number) => {
    Swal.fire({
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
    }).then((result) => {
      if (result.isConfirmed && result.value.car) {
        showSuccessAlert(`Car ${result.value.car} assigned${result.value.driver ? ` with driver ${result.value.driver}` : ''}`);
      }
    });
  };

  const filteredServiceRequests = serviceRequests.filter(request => 
    Object.values(request).some(
      value => value && 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredTravelRequests = travelRequests.filter(request => 
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
    <div className="p-6 space-y-6 overflow-hidden"> {/* Changed to overflow-hidden */}
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
          <FiTruck /> Service Requests ({serviceRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('travel')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'travel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FiMapPin /> Travel Requests ({travelRequests.length})
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
            value: activeTab === 'service' ? serviceRequests.length : travelRequests.length,
            icon: <FiInfo className="h-6 w-6" />, 
            color: 'text-blue-600', 
            bgColor: 'bg-blue-100' 
          },
          { 
            title: 'Pending', 
            value: activeTab === 'service' 
              ? serviceRequests.filter(r => r.status === 'Pending').length
              : travelRequests.filter(r => r.status === 'Pending').length,
            icon: <FiClock className="h-6 w-6" />, 
            color: 'text-yellow-600', 
            bgColor: 'bg-yellow-100' 
          },
          { 
            title: 'Approved', 
            value: activeTab === 'service' 
              ? serviceRequests.filter(r => r.status === 'Approved').length
              : travelRequests.filter(r => r.status === 'Approved').length,
            icon: <FiCheck className="h-6 w-6" />, 
            color: 'text-green-600', 
            bgColor: 'bg-green-100' 
          },
          { 
            title: 'Completed', 
            value: activeTab === 'service' 
              ? serviceRequests.filter(r => r.status === 'Completed').length
              : travelRequests.filter(r => r.status === 'Completed').length,
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === 'service' ? 'Service Car Requests' : 'Travel Requests'}
          </h2>
          <div className="text-sm text-gray-500">
            Showing {activeTab === 'service' ? filteredServiceRequests.length : filteredTravelRequests.length} records
          </div>
        </div>

        <div className="overflow-x-auto"> {/* Horizontal scroll only for the table */}
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
                      <FiMapPin /> Destination
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiCalendar /> Dates
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiInfo /> Trip Details
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FiBriefcase /> Team Info
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
                      <div className="text-sm text-gray-500">{request.email}</div>
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
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Return:</span> {request.returnTime}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{request.purpose}</div>
                      {request.notes && (
                        <div className="text-xs text-gray-500">Notes: {request.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.carType}</div>
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
                      <div className="text-sm text-gray-500">{request.employeeId}</div>
                      <div className="text-sm text-gray-500">{request.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.destination}</div>
                      <div className="text-sm text-gray-500">{request.travelDistance}</div>
                      <div className="text-xs text-gray-500">Passengers: {request.passengers}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {new Date(request.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{request.reason}</div>
                      <div className="text-xs text-gray-500">Budget: {request.budgetCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Approver: {request.approver}</div>
                      <div className="text-sm text-gray-500">Claimant: {request.claimantName}</div>
                      <div className="text-sm text-gray-500">Team Lead: {request.teamLeaderName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.carType}</div>
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
