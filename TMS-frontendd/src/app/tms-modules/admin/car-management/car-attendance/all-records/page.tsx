// Conceptual structure for a page displaying all attendance records
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { FiSearch, FiX, FiArrowLeft } from 'react-icons/fi'; // Added FiArrowLeft for back button
import { fetchAllAttendanceRecordsAPI, FrontendAttendanceEntry } from '../components/carAttendanceApi';
// You might want a loading spinner component
// import { FiLoader } from 'react-icons/fi'; 

export default function AllAttendancePage() {
  const router = useRouter(); // Initialize router
  const [allRecords, setAllRecords] = useState<FrontendAttendanceEntry[]>([]); // Store all fetched records
  const [filteredRecords, setFilteredRecords] = useState<FrontendAttendanceEntry[]>([]); // Records to display
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecordModal, setSelectedRecordModal] = useState<FrontendAttendanceEntry | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const records = await fetchAllAttendanceRecordsAPI();
        setAllRecords(records);
        setFilteredRecords(records); // Initially, display all records
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning KM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening KM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily KM Diff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Added (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overnight KM Diff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM at Fueling</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM/L</th>
                {/* Driver Name could be added here or kept for modal for brevity */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr 
                  key={record.id} 
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedRecordModal(record)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.plateNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.carType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.morningKm ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.nightKm ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.kmDifference ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.fuelLitersAdded ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.overnightKmDifference ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.kmAtFueling ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.kmPerLiter === 0 && record.driverName === 'N/A' ? 'N/A' : record.kmPerLiter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
              <p><strong>ID:</strong> {selectedRecordModal.id}</p>
              <p><strong>Plate Number:</strong> {selectedRecordModal.plateNumber}</p>
              <p><strong>Car Type:</strong> <span className="capitalize">{selectedRecordModal.carType}</span></p>
              <p><strong>Driver Name:</strong> {selectedRecordModal.driverName}</p>
              <p><strong>KM per Liter:</strong> {selectedRecordModal.kmPerLiter === 0 && selectedRecordModal.driverName === 'N/A' ? 'N/A' : `${selectedRecordModal.kmPerLiter} km/l`}</p>
              <p><strong>Date:</strong> {new Date(selectedRecordModal.date + 'T00:00:00').toLocaleDateString()}</p>
              <p><strong>Morning KM:</strong> {selectedRecordModal.morningKm ?? 'N/A'}</p>
              <p><strong>Evening KM (Night KM):</strong> {selectedRecordModal.nightKm ?? 'N/A'}</p>
              <p><strong>Daily KM Difference:</strong> {selectedRecordModal.kmDifference ?? 'N/A'}</p>
              <p><strong>Overnight KM Difference:</strong> {selectedRecordModal.overnightKmDifference ?? 'N/A'}</p>
              <p><strong>Fuel Liters Added:</strong> {selectedRecordModal.fuelLitersAdded ?? 'N/A'}</p>
              <p><strong>KM at Fueling:</strong> {selectedRecordModal.kmAtFueling ?? 'N/A'}</p>
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
