"use client";
import { useState } from 'react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { DailyServiceRequest } from '../api/dailyServiceHandlers';

interface DriverDailyRequestsTableProps {
  requests: DailyServiceRequest[];
  actorType: 'manager' | 'driver';
  onRowClick: (request: DailyServiceRequest) => void;
  onCompleteTrip?: (id: number) => Promise<void>;
  driverSearchQuery?: string; // Add this line
}

export default function DriverDailyRequestsTable({ 
  requests, 
  actorType, 
  onRowClick, 
  onCompleteTrip,
  driverSearchQuery = '' // Add default value
}: DriverDailyRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<DailyServiceRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRowClick = (request: DailyServiceRequest) => {
    setSelectedRequest(request);
    onRowClick(request);
  };

  const handleCompleteTrip = async () => {
    if (selectedRequest && onCompleteTrip) {
      setIsUpdating(true);
      try {
        await onCompleteTrip(selectedRequest.id);
        setSelectedRequest(null);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Filter requests based on actor type
  const filteredRequests = actorType === 'manager' 
    ? requests.filter(req => req.status === 'PENDING')
    : actorType === 'driver'
    ? requests.filter(req => req.status === 'ASSIGNED')
    : requests;

  const showRejectedAlert = (request: DailyServiceRequest) => {
    Swal.fire({
      title: 'Request Rejected',
      text: `Request from ${request.claimantName} has been rejected and cannot be processed.`,
      icon: 'info',
      confirmButtonText: 'OK'
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

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        {actorType === 'manager' ? 'Pending Service Requests' : 'My Completed Trips'}
      </h3>
      
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <motion.table
          className="min-w-full divide-y divide-gray-300"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travelers</th>
              {actorType === 'manager' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <motion.tr 
                key={request.id} 
                variants={rowVariants}
                whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(request)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.startingPlace}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.endingPlace}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.travelers.slice(0, 2).join(', ')}
                  {request.travelers.length > 2 && ` +${request.travelers.length - 2}`}
                </td>
                {actorType === 'manager' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.claimantName}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${request.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                     request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                     'bg-yellow-100 text-yellow-800'}`}>
                    {request.status}
                  </span>
                </td>
                {actorType === 'driver' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.kmDifference || '-'} km
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>

      {selectedRequest && actorType === 'driver' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-800">Trip Details</h4>
              <p className="text-sm text-blue-700 mt-1">
                {selectedRequest.startingPlace} → {selectedRequest.endingPlace}
              </p>
            </div>
            <button
              onClick={handleCompleteTrip}
              disabled={isUpdating}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Processing...' : 'Confirm Completion'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}