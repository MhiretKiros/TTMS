"use client";
import { useState } from 'react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { TravelRequest } from '../api/handlers';

interface RequestsTableProps {
  requests: TravelRequest[];
  actorType: 'user' | 'manager' | 'corporator' | 'driver';
  onRowClick: (request: TravelRequest) => void;
  onStatusChange?: (id: number, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  onCompleteTrip?: (id: number) => Promise<void>;
  driverSearchQuery?: string;
}

export default function RequestsTable({ 
  requests, 
  actorType, 
  onRowClick, 
  onStatusChange,
  onCompleteTrip,
  driverSearchQuery = ''
}: RequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRowClick = (request: TravelRequest) => {
    setSelectedRequest(request);
    onRowClick(request);
  };

  const handleStatusSubmit = async () => {
    if (selectedRequest && onStatusChange) {
      setIsUpdating(true);
      try {
        await onStatusChange(selectedRequest.id, status);
        setSelectedRequest(null);
      } finally {
        setIsUpdating(false);
      }
    }
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

  // Updated sorting logic for corporator
  const filteredRequests = actorType === 'manager' 
    ? requests.filter(req => req.status === 'APPROVED')
    : actorType === 'driver'
    ? requests.filter(req => req.status === 'COMPLETED')
    : actorType === 'corporator'
    ? [...requests].sort((a, b) => {
        // Show PENDING first, others in their original order
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
        return 0;
      })
    : requests;

  const showRejectedAlert = (request: TravelRequest) => {
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
        {actorType === 'manager' ? 'Approved Travel Requests' : 
         actorType === 'corporator' ? 'All Travel Requests' : 
         actorType === 'driver' ? 'My Assigned Trips' : 'Travel Requests'}
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {actorType === 'driver' ? 'Driver' : 'Department'}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
        </motion.table>
        
        <div className="overflow-y-auto max-h-[calc(7*3.5rem)]">
          <motion.table
            className="min-w-full divide-y divide-gray-300"
            initial="hidden"
            animate="show"
            variants={containerVariants}
          >
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <motion.tr 
                  key={request.id} 
                  variants={rowVariants}
                  whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedRequest?.id === request.id ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (actorType === 'manager' && request.status === 'REJECTED') {
                      showRejectedAlert(request);
                    } else {
                      handleRowClick(request);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.startingPlace}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.destinationPlace}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.travelers.slice(0, 2).map(t => typeof t === 'object' ? t.name : t).join(', ')}
                    {request.travelers.length > 2 && ` +${request.travelers.length - 2}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {actorType === 'driver' ? request.assignedDriver || '-' : request.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                       request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                       request.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                       'bg-yellow-100 text-yellow-800'}`}>
                      {request.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </div>
    </div>
  );
}