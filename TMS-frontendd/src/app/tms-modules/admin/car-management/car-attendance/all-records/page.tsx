// Conceptual structure for a page displaying all attendance records
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { FiSearch, FiX, FiArrowLeft } from 'react-icons/fi'; // Added FiArrowLeft for back button
import { fetchAllAttendanceRecordsAPI, FrontendAttendanceEntry } from '../components/carAttendanceApi';

type AttendanceEntryWithRemarks = FrontendAttendanceEntry & { remarks?: string };

export default function AllAttendanceRecordsPage() {
  const [allRecords, setAllRecords] = useState<AttendanceEntryWithRemarks[]>([]); // Store all fetched records
  const [filteredRecords, setFilteredRecords] = useState<AttendanceEntryWithRemarks[]>([]); // Records to display
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const router = useRouter(); // Initialize router
  const [selectedRecordModal, setSelectedRecordModal] = useState<AttendanceEntryWithRemarks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const records = await fetchAllAttendanceRecordsAPI();
        const mappedRecords = records.map((rec: any) => ({
          ...rec,
          kmAtFueling: rec.kmAtFueling ?? rec.km_at_fueling, // map snake_case to camelCase
        }));
        setAllRecords(mappedRecords);
        setFilteredRecords(mappedRecords); // Initially, display all records
      } catch (err: any) {
        setError(err.message || 'Failed to load attendance records.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(allRecords);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      setFilteredRecords(
        allRecords.filter(record =>
          record.plateNumber.toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* <FiLoader className="animate-spin text-4xl text-indigo-600" /> */}
        <p className="text-xl ml-3">Loading attendance records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-red-500 bg-red-100 p-4 rounded">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center self-start sm:self-center"
        >
          <FiArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">All Car Attendance Records</h1>
        <div className="flex items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Plate Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full sm:w-auto"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FiSearch />
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <p className="text-center text-gray-500">No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Plate Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Car Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Driver Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Morning KM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Evening KM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Daily KM Diff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Overnight KM Diff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Fuel Added (L)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">KM at Fueling</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">KM/L</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Remarks</th>
               </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr
                  key={record.id}
                  className={`cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-100`}
                  onClick={() => setSelectedRecordModal(record)}
                >
                  <td className="px-4 py-3">{record.plateNumber}</td>
                  <td className="px-4 py-3">{record.carType}</td>
                  <td className="px-4 py-3">{record.driverName}</td>
                  <td className="px-4 py-3">{new Date(record.date + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-4 py-3">{record.morningKm ?? 'N/A'}</td>
                  <td className="px-4 py-3">{record.nightKm ?? 'N/A'}</td>
                  <td className="px-4 py-3">{record.kmDifference ?? 'N/A'}</td>
                  <td className="px-4 py-3">{record.overnightKmDifference ?? 'N/A'}</td>
                  <td className="px-4 py-3">{record.fuelLitersAdded ?? 'N/A'}</td>
                  <td className="px-4 py-3">{record.kmAtFueling ?? 'N/A'}</td>
                  <td className="px-4 py-3">{record.kmPerLiter === 0 && record.driverName === 'N/A' ? 'N/A' : record.kmPerLiter}</td>
                  <td className="px-4 py-3">{record.remarks ?? 'N/A'}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for record details */}
      {selectedRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Attendance Record Details</h2>
              <button onClick={() => setSelectedRecordModal(null)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {Object.entries(selectedRecordModal).map(([key, value]) => (
                <p key={key}>
                  <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>{" "}
                  {typeof value === 'string' && (key.toLowerCase().includes('date') || key.toLowerCase().includes('at'))
                    ? new Date(value).toLocaleString()
                    : value ?? 'N/A'}
                </p>
              ))}
            </div>
            <button
              onClick={() => setSelectedRecordModal(null)}
              className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
