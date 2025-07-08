'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; // Import FiEdit
import { FiList, FiEye, FiPlusCircle, FiEdit } from 'react-icons/fi';

// This interface should match the MaintenanceRecordDTO from the backend.
// It's based on the structure from the 'add-maintenance-record' page.
interface RepairDetails {
  dateOfReceipt: string;
  dateStarted: string;
  dateFinished: string;
  duration: string;
  inspectorName: string;
  teamLeader: string;
  worksDoneLevel: 'low' | 'medium' | 'high' | '';
  worksDoneDescription: string;
}

interface MaintenanceRecord {
  id: number;
  plateNumber: string;
  vehicleDetails: {
    type: string;
    km: string;
    chassisNumber: string;
  };
  driverDescription: string;
  requestingPersonnel: string;
  authorizingPersonnel: string;
  mechanicalRepair: RepairDetails;
  electricalRepair: RepairDetails;
  createdAt?: string;
  // New fields for follow-up/final status
  finalInspectionNotes?: string;
  isProblemFixed?: boolean;
  problemResolutionDetails?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function MaintenanceRecordsPage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const plateNumber = searchParams.get('plateNumber');

  const fetchMaintenanceRecords = useCallback(async () => {
    const fetchMaintenanceRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let url = `${API_BASE_URL}/api/maintenance/records`;
        if (plateNumber) {
          url += `?plateNumber=${encodeURIComponent(plateNumber)}`;
        }
        console.log(`Fetching maintenance records from: ${url}`);

        const response = await fetch(url);

        console.log("Response:", response);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to fetch maintenance records: ${response.status}`);
        }
        const data: MaintenanceRecord[] = await response.json();
        setRecords(data);
      } catch (err: any) {
        console.error('Error fetching maintenance records:', err);
        const errorMessage = err.message || 'An unknown error occurred.';
        setError(errorMessage);
        toast.error(`Failed to fetch records: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceRecords();
  }, [plateNumber]); // Dependency array for useCallback

  useEffect(() => {
    fetchMaintenanceRecords();
  }, [fetchMaintenanceRecords]); // Dependency array for useEffect

  const getStatus = (record: MaintenanceRecord) => {
    // Using mechanical repair as the primary indicator for status
    const { dateFinished, dateStarted, dateOfReceipt } = record.mechanicalRepair || {};
    if (dateFinished) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>;
    }
    if (dateStarted) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span>;
    }
    if (dateOfReceipt) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Pending</span>;
    }
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-10 text-slate-600">Loading maintenance records...</div>;
    }

    if (error) {
      return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">Error: {error}</div>;
    }

    if (records.length === 0) {
      return <div className="text-center py-10 text-slate-500">No maintenance records found.</div>;
    }

    return (
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plate Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Chassis Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inspector</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Started</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{record.plateNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{record.vehicleDetails.chassisNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{record.vehicleDetails.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{record.requestingPersonnel || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{record.mechanicalRepair?.dateStarted || 'Not Started'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{getStatus(record)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/tms-modules/admin/car-management/maintenance-records/${record.id}`} className="text-blue-600 hover:text-blue-800 flex items-center justify-end">
                      <FiEye className="mr-1" /> View Details
                  </Link>
                  <Link href={`/tms-modules/admin/car-management/update-maintenance-record/${record.id}`} className="ml-4 text-green-600 hover:text-green-800 flex items-center justify-end">
  <FiEdit className="mr-1" /> Update Status
</Link>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-300 pb-4 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center">
            <FiList className="inline-block mr-3 text-blue-600 text-3xl" />
            Maintenance Records
          </h1>
          <Link href="/tms-modules/admin/car-management/add-maintenance-record" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
              <FiPlusCircle className="mr-2 h-5 w-5" /> Add New Record
          </Link>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
}