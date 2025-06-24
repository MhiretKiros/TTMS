'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiList, FiEdit, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// This interface should align with the MaintenanceRequest.java entity from the backend.
interface MaintenanceRequest {
  id: number; // Corresponds to Long id
  plateNumber: string;
  vehicleType: string;
  reportingDriver: string;
  categoryWorkProcess: string;
  kilometerReading: number;
  defectDetails: string; // This is the "Driver Report"
  mechanicDiagnosis: string | null;
  requestingPersonnel: string | null;
  authorizingPersonnel: string | null;
  status: 'PENDING' | 'CHECKED' | 'REJECTED' | 'INSPECTION' | 'COMPLETED' | 'APPROVED';
  createdAt: string; // Corresponds to LocalDateTime, will be an ISO string
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

const API_BASE_URL = 'http://localhost:8080';

export default function ApprovedMaintenanceRequestsPage() {
  const [allRequests, setAllRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchApprovedRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/approved`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch approved requests: ${response.status} ${errorText}`);
      }
      const data: MaintenanceRequest[] = await response.json();
      setAllRequests(data);
      setFilteredRequests(data); // Initially, filtered list is all requests
    } catch (err: any) {
      console.error('Error fetching approved maintenance requests:', err);
      setError(err.message || 'An unknown error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovedRequests();
  }, [fetchApprovedRequests]);

  // Effect to filter requests based on search term whenever searchTerm or allRequests changes
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = allRequests.filter(request =>
      request.plateNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.vehicleType?.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.defectDetails?.toLowerCase().includes(lowerCaseSearchTerm) ||
      request.reportingDriver?.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredRequests(results);
  }, [searchTerm, allRequests]);

  const handleRecordMaintenance = (plateNumber: string) => {
    // Navigate to the AddMaintenanceRecordPage with the plate number as a query parameter
    router.push(`/tms-modules/admin/car-management/add-maintenance-record?plateNumber=${encodeURIComponent(plateNumber)}`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800 border-b border-slate-300 pb-4 flex items-center">
          <FiList className="inline-block mr-3 text-blue-600 text-3xl" />
          Approved Maintenance Requests
        </h1>

        {/* Search Bar Section */}
        <section className="bg-slate-100 p-6 rounded-lg shadow-md border border-slate-200 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center">
            <FiSearch className="mr-3 text-blue-600" />
            Search Requests
          </h2>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="searchPlate" className="block text-sm font-medium text-slate-700 mb-1">Search by Plate Number, Type, Driver, or Report</label>
              <input
                type="text"
                id="searchPlate"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter plate number, vehicle type, driver name, or report keyword"
              />
            </div>
            <button
              type="button"
              onClick={fetchApprovedRequests} // Button to manually refresh the list from backend
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <FiRefreshCw className="mr-2 h-5 w-5" /> Refresh List
            </button>
          </div>
        </section>

        {/* Display Area for Requests */}
        {isLoading ? (
          <div className="text-center py-8 text-slate-600 flex items-center justify-center">
            <FiRefreshCw className="animate-spin mr-3 text-blue-500 text-xl" /> Loading approved requests...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>Error: {error}</p>
            <button onClick={fetchApprovedRequests} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Try Again
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p>No approved maintenance requests found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Vehicle Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Driver Report Summary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{request.plateNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{request.vehicleType || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">{request.defectDetails || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRecordMaintenance(request.plateNumber)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center px-3 py-1.5 border border-blue-600 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiEdit className="mr-1" /> Record Maintenance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
