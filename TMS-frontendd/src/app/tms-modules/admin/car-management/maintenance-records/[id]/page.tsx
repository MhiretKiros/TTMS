'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiTruck, FiUser, FiTool, FiFileText, FiCalendar, FiClock, FiCheckCircle, FiSettings } from 'react-icons/fi';

// Interfaces should match the MaintenanceRecordDTO from the backend
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
  authorizingPersonnel:string;
  mechanicalRepair: RepairDetails;
  electricalRepair: RepairDetails;
  createdAt?: string; // Assuming backend might provide this
  // New fields for follow-up/final status
  finalInspectionNotes?: string;
  isProblemFixed?: boolean;
  problemResolutionDetails?: string;
}

const API_BASE_URL = 'http://localhost:8080';

// A reusable component to display repair details in a structured card format
const RepairDetailView = ({ title, details }: { title:string; details: RepairDetails | null }) => {
  if (!details || Object.values(details).every(val => !val || val === '')) {
    return (
      <div className="bg-slate-50 p-6 rounded-lg shadow-md border border-slate-200">
        <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
          <FiTool className="mr-3 text-blue-600" />
          {title}
        </h3>
        <p className="text-slate-500 italic">No {title.toLowerCase()} details have been recorded for this maintenance entry.</p>
      </div>
    );
  }

  const detailItems = [
    { icon: <FiCalendar className="text-slate-500" />, label: 'Date of Receipt', value: details.dateOfReceipt },
    { icon: <FiSettings className="text-slate-500" />, label: 'Date Started', value: details.dateStarted },
    { icon: <FiCheckCircle className="text-slate-500" />, label: 'Date Finished', value: details.dateFinished },
    { icon: <FiClock className="text-slate-500" />, label: 'Duration', value: details.duration },
    { icon: <FiUser className="text-slate-500" />, label: 'Inspector', value: details.inspectorName },
    { icon: <FiUser className="text-slate-500" />, label: 'Team Leader', value: details.teamLeader },
  ];

  return (
    <div className="bg-slate-50 p-6 rounded-lg shadow-md border border-slate-200">
      <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
        <FiTool className="mr-3 text-blue-600" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        {detailItems.map(item => (
          <div key={item.label} className="flex items-start">
            <div className="mr-3 pt-1">{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              <p className="text-md font-semibold text-slate-800">{item.value || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
      {details.worksDoneDescription && (
        <div className="mt-6 border-t border-slate-200 pt-4">
          <h4 className="text-md font-semibold text-slate-700 mb-2">Works Done (Level: <span className="capitalize font-bold">{details.worksDoneLevel || 'N/A'}</span>)</h4>
          <p className="text-slate-600 whitespace-pre-wrap bg-white p-4 rounded-md border">{details.worksDoneDescription}</p>
        </div>
      )}
    </div>
  );
};


export default function MaintenanceRecordDetailPage() {
  const [record, setRecord] = useState<MaintenanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/maintenance/records/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to fetch record: ${response.status}`);
        }
        const data: MaintenanceRecord = await response.json();
        setRecord(data);
      } catch (err: any) {
        console.error('Error fetching maintenance record:', err);
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-50 text-slate-600">Loading record details...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  if (!record) {
    return <div className="text-center py-10 text-slate-500">Maintenance record not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-300 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Maintenance Details for <span className="text-blue-600">{record.plateNumber}</span>
          </h1>
          <Link href="/tms-modules/admin/car-management/maintenance-records" className="text-blue-600 hover:text-blue-800 flex items-center">
            <FiArrowLeft className="mr-2" /> Back to Records List
          </Link>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-100 p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center">
              <FiTruck className="mr-3 text-blue-600" />
              Vehicle Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><strong className="text-slate-600 font-medium">Vehicle Type:</strong> <span className="text-slate-800">{record.vehicleDetails.type}</span></div>
              <div><strong className="text-slate-600 font-medium">Kilometers:</strong> <span className="text-slate-800">{record.vehicleDetails.km}</span></div>
              <div><strong className="text-slate-600 font-medium">Chassis Number:</strong> <span className="text-slate-800">{record.vehicleDetails.chassisNumber}</span></div>
              <div><strong className="text-slate-600 font-medium">Inspector:</strong> <span className="text-slate-800">{record.requestingPersonnel || 'N/A'}</span></div>
            </div>
          </section>

          <section className="bg-slate-100 p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center">
              <FiFileText className="mr-3 text-blue-600" />
              Driver's Report
            </h2>
            <p className="text-slate-600 whitespace-pre-wrap bg-white p-4 rounded-md border">{record.driverDescription || 'No description provided.'}</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800 flex items-center border-t border-slate-300 pt-6">
              <FiTool className="mr-3 text-blue-600" />
              Shoplift Repair Details
            </h2>
            <RepairDetailView title="Mechanical Repair" details={record.mechanicalRepair} />
            <RepairDetailView title="Electrical Repair" details={record.electricalRepair} />
          </section>
        </div>
      </div>
    </div>
  );
}