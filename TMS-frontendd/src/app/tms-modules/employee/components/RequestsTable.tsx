"use client";
import { useState } from 'react';
import Swal from 'sweetalert2';
import { TravelRequest } from '../api/handlers';

interface RequestsTableProps {
  requests: TravelRequest[];
  actorType: 'user' | 'manager' | 'corporator';
  onRowClick: (request: TravelRequest) => void;
  onStatusChange?: (id: number, status: 'Approved' | 'Rejected') => Promise<void>;
}

export default function RequestsTable({ requests, actorType, onRowClick, onStatusChange }: RequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [status, setStatus] = useState<'Approved' | 'Rejected'>('Approved');
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
  // Filter the requests to show only "Approved" ones for the manager
const filteredRequests = actorType === 'manager' 
? requests.filter(req => req.status === 'APPROVED') // Adjusted to match the status enum value from API
: requests;


  const showRejectedAlert = (request: TravelRequest) => {
    Swal.fire({
      title: 'Request Rejected',
      text: `Request from ${request.claimantName} has been rejected and cannot be processed.`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Travel Requests</h3>
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travelers</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr 
                key={request.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedRequest?.id === request.id ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  if (actorType === 'manager' && request.status === 'Rejected') {
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    request.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {actorType === 'corporator' && selectedRequest && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-700 mb-3">Change Request Status</h4>
          <div className="flex items-center space-x-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Approved' | 'Rejected')}
              className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="Approved">Approve</option>
              <option value="Rejected">Reject</option>
            </select>
            <button
              onClick={handleStatusSubmit}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}