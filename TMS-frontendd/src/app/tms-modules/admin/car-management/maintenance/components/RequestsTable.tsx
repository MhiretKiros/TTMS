'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MaintenanceRequest } from '../api/handlers';
import { FiCheckCircle, FiAlertCircle, FiTool } from 'react-icons/fi';

interface RequestsTableProps {
  requests: MaintenanceRequest[];
  actorType: 'driver' | 'distributor' | 'maintenance';
  onRowClick: (request: MaintenanceRequest) => void;
}

export default function RequestsTable({ 
  requests, 
  actorType, 
  onRowClick 
}: RequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  const handleRowClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    onRowClick(request);
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
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CHECKED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'APPROVED': return 'bg-purple-100 text-purple-800';
      case 'INSPECTION': return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-8">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {actorType === 'driver' ? 'Status' : 'Driver'}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <motion.tr 
                key={request.id} 
                variants={rowVariants}
                whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                className={`hover:bg-gray-50 cursor-pointer ${selectedRequest?.id === request.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleRowClick(request)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.plateNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.vehicleType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.categoryWorkProcess}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {actorType === 'driver' ? (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  ) : (
                    request.reportingDriver
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </div>
  );
}