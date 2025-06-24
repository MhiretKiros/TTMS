'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // Import toast and Toaster
import { FiTool, FiUser, FiFileText, FiCalendar, FiTruck, FiSearch, FiSave } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';

// Updated to better align with the MaintenanceRequest.java entity and the expected API response
interface VehicleDetails {
  vehicleType: string;
  kilometerReading: number;
  reportingDriver: string;
  chassisNumber: string; // Added to fetch and display chassis number
  defectDetails: string; // To hold the driver's report from the backend
}

// Modified to split worksDone into level and description
interface RepairDetails {
  dateOfReceipt: string;
  dateStarted: string;
  dateFinished: string;
  duration: string;
  inspectorName: string;
  teamLeader: string;
  worksDoneLevel: 'low' | 'medium' | 'high' | '';
  worksDoneDescription: string; // New field for detailed description
}

interface RepairFieldConfig {
  key: keyof RepairDetails;
  label: string;
  type: 'text' | 'date' | 'select' | 'textarea'; // Added textarea type
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const repairFieldsConfig: RepairFieldConfig[] = [
  { key: 'dateOfReceipt', label: 'Date of Receipt', type: 'date' },
  { key: 'dateStarted', label: 'Date Started', type: 'date' },
  { key: 'dateFinished', label: 'Date Finished', type: 'date' },
  { key: 'duration', label: 'Duration for Maintenance', type: 'text', placeholder: 'e.g., 3 days, 5 hours' },
  { key: 'inspectorName', label: 'Inspector Name', type: 'text', placeholder: 'Enter inspector name' },
  { key: 'teamLeader', label: 'Leader of The Team', type: 'text', placeholder: 'Enter team leader name' },
  {
    key: 'worksDoneLevel', label: 'Works Done Level', type: 'select',
    options: [ { value: '', label: 'Select Level' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' } ]
  },
  { key: 'worksDoneDescription', label: 'Works Done Details', type: 'textarea', placeholder: 'Describe the work done in detail...' },
];

const initialRepairDetails: RepairDetails = {
  dateOfReceipt: '',
  dateStarted: '',
  dateFinished: '',
  duration: '',
  inspectorName: '',
  teamLeader: '',
  worksDoneLevel: '',
  worksDoneDescription: '',
};

const API_BASE_URL = 'http://localhost:8080';

export default function AddMaintenanceRecordPage() {
  const searchParams = useSearchParams();
  const initialPlateNumberFromUrl = searchParams.get('plateNumber') || '';
  const [plateNumber, setPlateNumber] = useState(initialPlateNumberFromUrl);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [driverDescription, setDriverDescription] = useState('');
  const [mechanicalRepair, setMechanicalRepair] = useState<RepairDetails>(initialRepairDetails);
  const [electricalRepair, setElectricalRepair] = useState<RepairDetails>(initialRepairDetails);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFetchDone = useRef(false); // Ref to track if initial fetch from URL param is done

  const resetForm = () => {
    setPlateNumber('');
    setVehicleDetails(null);
    setDriverDescription('');
    setMechanicalRepair(initialRepairDetails);
    setElectricalRepair(initialRepairDetails);
  };

  const handleFetchVehicleDetails = useCallback(async () => {
    if (!plateNumber) {
      toast.error('Please enter a plate number.');
      return;
    }
    setIsLoadingVehicle(true);
    setVehicleDetails(null);
    setDriverDescription('');
    console.log(`Fetching details for plate: ${plateNumber}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/vehicle-details?plateNumber=${encodeURIComponent(plateNumber)}`);
      if (!response.ok) {
        if (response.status === 404) {
          const errorText = await response.text();
          toast.error(errorText || `Vehicle with plate number '${plateNumber}' not found. Please check the plate number.`);
        } else {
          const errorData = await response.text();
          throw new Error(`Failed to fetch vehicle details: ${response.status} ${errorData}`);
        }
        setVehicleDetails(null);
        setDriverDescription('');
      } else {
        const rawData = await response.json();
        // Map the received data to the frontend's VehicleDetails interface.
        // This handles potential mismatches between backend field names (e.g., 'type', 'km') and frontend names.
        const mappedDetails: VehicleDetails = {
          vehicleType: rawData.vehicleType || rawData.type || 'N/A',
          kilometerReading: rawData.kilometerReading || rawData.km || 0,
          reportingDriver: rawData.reportingDriver || 'N/A',
          chassisNumber: rawData.chassisNumber || 'N/A',
          defectDetails: rawData.defectDetails || '',
        };
        setVehicleDetails(mappedDetails);
        setDriverDescription(mappedDetails.defectDetails); // Populate the driver description field
      }
    } catch (error: any) {
      console.error('Error fetching vehicle details:', error);
      toast.error(`Failed to fetch vehicle details: ${error.message}. Please check the plate number and ensure the backend is running.`);
      setVehicleDetails(null);
      setDriverDescription('');
    } finally {
      setIsLoadingVehicle(false);
    }
  }, [plateNumber]);

  useEffect(() => {
    // Only trigger initial fetch if plate number is from URL and hasn't been fetched yet
    // This prevents re-fetching (and showing error) if the user clears the input after initial load
    if (initialPlateNumberFromUrl && !initialFetchDone.current) {
      initialFetchDone.current = true; // Mark initial fetch as done
      handleFetchVehicleDetails();
    }
  }, [initialPlateNumberFromUrl, handleFetchVehicleDetails]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vehicleDetails) {
      toast.error('Please fetch and verify vehicle details before submitting.');
      return;
    }
    setIsSubmitting(true);

    // Constructing a payload that aligns with the MaintenanceRequest.java entity
    // CORRECTED: Constructing a payload that aligns with the backend's MaintenanceRecordDTO
    const formData = {
      plateNumber,
      vehicleDetails: {
        type: vehicleDetails.vehicleType,
        km: String(vehicleDetails.kilometerReading), // Ensure km is a string if the DTO expects it
        chassisNumber: vehicleDetails.chassisNumber,
      },
      driverDescription: driverDescription, // The driver's report from the dedicated text area
      requestingPersonnel: mechanicalRepair.inspectorName,
      authorizingPersonnel: mechanicalRepair.teamLeader,
      mechanicalRepair: mechanicalRepair, // The state object already matches the RepairDetailsDTO structure
      electricalRepair: electricalRepair, // The state object already matches the RepairDetailsDTO structure
    };

    console.log('Submitting maintenance record:', formData);
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      toast.success('Maintenance record submitted successfully!');
      resetForm();
    } catch (error: any) {
      console.error('Error submitting maintenance record:', error);
      toast.error(`Failed to submit maintenance record: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRepairSection = (
    title: string,
    details: RepairDetails,
    setter: React.Dispatch<React.SetStateAction<RepairDetails>>
  ) => (
    <div className="bg-slate-50 p-6 rounded-lg shadow-md border border-slate-200">
      <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
        <FiTool className="mr-3 text-blue-600" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {repairFieldsConfig.map((field) => {
          if (field.key === 'worksDoneDescription' && !details.worksDoneLevel) {
            return null;
          }

          return (
            <div key={field.key} className={field.key === 'worksDoneDescription' ? 'md:col-span-2' : ''}>
              <label htmlFor={`${title}-${field.key}`} className="block text-sm font-medium text-slate-700 mb-1">
                {field.label} {field.type === 'date' && <FiCalendar className="inline-block ml-1 mb-0.5" />}
              </label>
              {field.type === 'select' ? (
                <select
                  id={`${title}-${field.key}`}
                  value={details[field.key]}
                  onChange={(e) => setter({ ...details, [field.key]: e.target.value as RepairDetails['worksDoneLevel'] })}
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`${title}-${field.key}`}
                  rows={3}
                  value={details[field.key]}
                  onChange={(e) => setter({ ...details, [field.key]: e.target.value })}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <input
                  type={field.type}
                  id={`${title}-${field.key}`}
                  value={details[field.key]}
                  onChange={(e) => setter({ ...details, [field.key]: e.target.value })}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <Toaster /> {/* Add the Toaster component here */}
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800 border-b border-slate-300 pb-4 flex items-center">
          <FiTool className="inline-block mr-3 text-blue-600 text-3xl" />
          Add New Car Maintenance Record
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-slate-100 p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-6 text-slate-700 flex items-center">
              <FiTruck className="mr-3 text-blue-600" />
              Vehicle Information
            </h2>
            <div className="flex flex-col sm:flex-row items-end gap-4 mb-6">
              <div className="flex-grow">
                <label htmlFor="plateNumber" className="block text-sm font-medium text-slate-700 mb-1">Plate Number</label>
                <input
                  type="text"
                  id="plateNumber"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter vehicle plate number"
                />
              </div>
              <button
                type="button"
                onClick={handleFetchVehicleDetails}
                disabled={isLoadingVehicle || !plateNumber}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FiSearch className="mr-2 h-5 w-5" /> {isLoadingVehicle ? 'Fetching...' : 'Fetch Details'}
              </button>
            </div>

            {vehicleDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-slate-300 rounded-md bg-white shadow">
                <div><strong className="text-slate-600 font-medium">Type of Vehicle:</strong> <span className="text-slate-800">{vehicleDetails.vehicleType}</span></div>
                <div><strong className="text-slate-600 font-medium">Kilometers:</strong> <span className="text-slate-800">{vehicleDetails.kilometerReading}</span></div>
                <div><strong className="text-slate-600 font-medium">Chassis Number:</strong> <span className="text-slate-800">{vehicleDetails.chassisNumber}</span></div>
                <div><strong className="text-slate-600 font-medium">Reporting Driver:</strong> <span className="text-slate-800">{vehicleDetails.reportingDriver}</span></div>
              </div>
            )}
          </section>

          <section className="bg-slate-100 p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-700 flex items-center">
              <FiUser className="mr-3 text-blue-600" />Driver's Report
            </h2>
            <div>
              <label htmlFor="driverDescription" className="block text-sm font-medium text-slate-700 mb-1">Description from the driver</label>
              <textarea
                id="driverDescription"
                rows={4}
                value={driverDescription}
                readOnly
                className="mt-1 block w-full px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                placeholder="Driver's report will be fetched here..."
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center border-t border-slate-300 pt-6">
              <FiFileText className="mr-3 text-blue-600" />Shoplift Repair List
            </h2>
            {renderRepairSection(
              'Mechanical Repair',
              mechanicalRepair,
              setMechanicalRepair
            )}
            {renderRepairSection(
              'Electrical Repair',
              electricalRepair,
              setElectricalRepair
            )}
          </section>

          <div className="flex justify-end pt-6 border-t border-slate-300">
            <button
              type="submit"
              disabled={isSubmitting || !vehicleDetails}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
            >
              <FiSave className="mr-2 h-5 w-5" /> {isSubmitting ? 'Submitting...' : 'Save Maintenance Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
