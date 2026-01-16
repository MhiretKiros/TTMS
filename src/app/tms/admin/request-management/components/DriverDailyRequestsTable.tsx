"use client";
import { useState } from 'react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { 
  FiMapPin, 
  FiUsers, 
  FiUser, 
  FiNavigation, 
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowRight,
  FiPlayCircle,
  FiChevronRight,
  FiMail,
  FiSend
} from 'react-icons/fi';
import { DailyServiceRequest } from '../api/dailyServiceHandlers';

interface DriverDailyRequestsTableProps {
  requests: DailyServiceRequest[];
  actorType: 'manager' | 'driver' | 'corporator';
  onRowClick: (request: DailyServiceRequest) => void;
  onCompleteTrip?: (id: number) => Promise<void>;
  driverSearchQuery?: string;
}

export default function DriverDailyRequestsTable({
  requests,
  actorType,
  onRowClick,
  onCompleteTrip,
  driverSearchQuery = '',
}: DriverDailyRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<DailyServiceRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRowClick = (request: DailyServiceRequest) => {
    setSelectedRequest(request);
    onRowClick(request);
  };

  const handleCompleteTrip = async () => {
    if (selectedRequest && typeof selectedRequest.id === 'number' && onCompleteTrip) {
      setIsUpdating(true);
      try {
        await onCompleteTrip(selectedRequest.id);
        setSelectedRequest(null);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const filteredRequests =
    actorType === 'manager'
      ? requests.filter((req) => req.status === 'PENDING')
      : actorType === 'driver'
      ? requests.filter((req) => req.status === 'ASSIGNED')
      : requests;

  const showRejectedAlert = (request: DailyServiceRequest) => {
    Swal.fire({
      title: 'Request Rejected',
      text: `Request from ${request.claimantName} has been rejected and cannot be processed.`,
      icon: 'info',
      confirmButtonText: 'OK',
      background: '#fff',
      color: '#374151',
      confirmButtonColor: '#3c8dbc',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'ASSIGNED':
        return <FiPlayCircle className="h-4 w-4" />;
      case 'PENDING':
        return <FiClock className="h-4 w-4" />;
      case 'REJECTED':
        return <FiAlertCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const getRouteIcon = (index: number) => {
    const icons = ['🚗', '🚙', '🚐', '🚖', '🚘'];
    return icons[index % icons.length];
  };

  const getPassengerCountColor = (count: number) => {
    if (count === 1) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (count <= 3) return 'bg-green-50 text-green-700 border-green-100';
    return 'bg-orange-50 text-orange-700 border-orange-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden border border-gray-200 shadow-lg"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-[#3c8dbc] via-[#5aa5d8] to-[#7bc1ff]">
            <tr>
              {['ID', 'Route', 'Travelers', 'Requester', 'Date', 'Status', 'Distance', 'Actions'].map((header, index) => (
                <motion.th
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
                >
                  {header === 'Travelers' ? (
                    <span className="opacity-90">Travelers</span>
                  ) : header === 'Date' ? (
                    <span className="opacity-90">Date</span>
                  ) : (
                    header
                  )}
                </motion.th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredRequests.map((request, index) => (
              <motion.tr 
                key={request.id}
                variants={rowVariants}
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: 'rgba(60, 141, 188, 0.03)',
                  boxShadow: '0 4px 12px rgba(60, 141, 188, 0.1)'
                }}
                className="transition-all duration-200 cursor-pointer"
                onClick={() => handleRowClick(request)}
              >
                {/* ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#3c8dbc]/80 to-blue-400/80 rounded-lg flex items-center justify-center">
                      <div className="text-white text-lg">
                        {getRouteIcon(index)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">TRIP-{request.id}</div>
                      <div className="text-xs text-gray-500 opacity-70">#{request.id}</div>
                    </div>
                  </div>
                </td>

                {/* Route */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center text-sm font-medium text-gray-900 mb-1">
                      <FiMapPin className="h-3 w-3 text-[#3c8dbc] mr-2" />
                      {request.startingPlace}
                    </div>
                    <FiArrowRight className="h-4 w-4 text-gray-400 my-1 ml-1" />
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <FiNavigation className="h-3 w-3 text-green-600 mr-2" />
                      {request.endingPlace}
                    </div>
                  </div>
                </td>

                {/* Travelers */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiUsers className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPassengerCountColor(request.travelers.length)} opacity-90`}>
                      {request.travelers.length} {request.travelers.length === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                  {request.travelers.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 truncate max-w-xs opacity-80">
                      {request.travelers.slice(0, 3).join(', ')}
                      {request.travelers.length > 3 && ` +${request.travelers.length - 3}`}
                    </div>
                  )}
                </td>

                {/* Requester */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{request.claimantName}</div>
                      <div className="text-xs text-gray-500 opacity-70">Requester</div>
                    </div>
                    {/* Replaced Telegram icon with Mail icon */}
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(60, 141, 188, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // You can replace this with your email functionality
                        Swal.fire({
                          title: 'Contact Requester',
                          text: `Send message to ${request.claimantName}?`,
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonColor: '#3c8dbc',
                          cancelButtonColor: '#6b7280',
                          confirmButtonText: 'Send Email',
                          cancelButtonText: 'Cancel',
                          background: '#fff',
                          color: '#374151',
                        });
                      }}
                      className="ml-3 p-1.5 rounded-lg text-[#3c8dbc] hover:bg-blue-50 transition-colors"
                      title="Contact requester"
                    >
                      <FiMail className="h-4 w-4 opacity-80" />
                    </motion.button>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiCalendar className="h-3 w-3 text-gray-400 mr-2 opacity-80" />
                    <span className="opacity-90">
                      {formatDate(request.createdAt || new Date().toISOString())}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${getStatusColor(request.status)} opacity-90`}
                  >
                    <span className="mr-2">{getStatusIcon(request.status)}</span>
                    {request.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </motion.div>
                </td>

                {/* Distance */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.kmDifference ? (
                    <div className="flex items-center">
                      <div className="relative w-16 bg-gray-200 rounded-full h-2 mr-3 opacity-70">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((request.kmDifference / 100) * 50, 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`absolute h-2 rounded-full ${
                            request.kmDifference > 200 ? 'bg-red-500' : 
                            request.kmDifference > 100 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          } opacity-80`}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 opacity-90">
                        {request.kmDifference.toLocaleString()} km
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 opacity-70">-</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(60, 141, 188, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(request);
                      }}
                      className="p-2 rounded-lg text-[#3c8dbc] hover:bg-blue-50 transition-colors opacity-90"
                      title="View details"
                    >
                      <FiChevronRight className="h-5 w-5" />
                    </motion.button>
                    
                    {actorType === 'driver' && request.status === 'ASSIGNED' && onCompleteTrip && (
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          Swal.fire({
                            title: 'Complete Trip?',
                            text: `Are you sure you want to mark trip #${request.id} as completed?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#10b981',
                            cancelButtonColor: '#6b7280',
                            confirmButtonText: 'Yes, complete it!',
                            cancelButtonText: 'Cancel',
                            background: '#fff',
                            color: '#374151',
                          }).then((result) => {
                            if (result.isConfirmed && typeof request.id === 'number') {
                              handleCompleteTrip();
                            }
                          });
                        }}
                        className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors opacity-90"
                        title="Complete trip"
                        disabled={isUpdating}
                      >
                        <FiCheckCircle className="h-5 w-5" />
                      </motion.button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredRequests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#3c8dbc]/70 to-blue-400/70 mb-4">
            <FiNavigation className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 opacity-90">
            {actorType === 'manager' 
              ? 'No pending requests found' 
              : actorType === 'driver'
              ? 'No assigned trips found'
              : 'No trip requests found'}
          </h3>
          <p className="text-gray-500 opacity-80">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Status Legend */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1 opacity-80"></div>
            <span className="text-gray-600 opacity-90">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1 opacity-80"></div>
            <span className="text-gray-600 opacity-90">Assigned</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1 opacity-80"></div>
            <span className="text-gray-600 opacity-90">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1 opacity-80"></div>
            <span className="text-gray-600 opacity-90">Rejected</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}