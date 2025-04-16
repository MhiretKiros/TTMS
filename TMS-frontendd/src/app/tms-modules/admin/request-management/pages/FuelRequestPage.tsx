// components/FuelManagementPage.tsx
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTruck, FiPackage, FiSearch ,FiX} from 'react-icons/fi';
import Swal from 'sweetalert2';
import RequestsTable from '../components/RequestsTable';
import { FuelRequestForm } from '../components/FuelForms/FuelRequestForm';
import { FuelReturnForm } from '../components/FuelForms/FuelReturnForm';
import { TravelApi, TravelRequest } from '../api/handlers';

const FuelManagementPage = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'returns'>('requests');
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [returns, setReturns] = useState<TravelRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === 'requests') {
          const data = await TravelApi.getRequests('corporator');
          setRequests(data.filter(req => req.status === 'ASSIGNED'));
        } else {
          const data = await TravelApi.getRequests('corporator');
          setReturns(data.filter(req => req.status === 'FINISHED'));
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to load requests', 'error');
      }
    };
    loadData();
  }, [activeTab]);

  const handleSuccess = () => {
    setSelectedRequest(null);
    TravelApi.getRequests('corporator')
      .then(data => {
        if (activeTab === 'requests') {
          setRequests(data.filter(req => req.status === 'ASSIGNED'));
        } else {
          setReturns(data.filter(req => req.status === 'FINISHED'));
        }
      });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'requests' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <FiTruck className="mr-2 inline-block" />
            New Fuel Requests
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'returns' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <FiPackage className="mr-2 inline-block" />
            Fuel Returns
          </button>
        </div>
        
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <RequestsTable
        requests={activeTab === 'requests' ? requests : returns}
        actorType={activeTab === 'requests' ? 'corporator' : 'corporator'}
        onRowClick={setSelectedRequest}
        driverSearchQuery={searchQuery}
      />

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                  {activeTab === 'requests' ? <FiTruck className="mr-2 inline-block" /> : <FiPackage className="mr-2 inline-block" />}
                    {activeTab === 'requests' ? 'Fuel Request for Fieldwork' : 'Fuel Request for Return to Fieldwork'}
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiX className="text-gray-500" />
                  </button>
                </div>

                {activeTab === 'requests' ? (
                  <FuelRequestForm
                    travelRequestId={selectedRequest.id}
                    defaultValues={{
                      travelers: selectedRequest.travelers,
                      startingPlace: selectedRequest.startingPlace,
                      destinationPlace: selectedRequest.destinationPlace,
                      vehicleType: selectedRequest.assignedCarType,
                      licensePlate: selectedRequest.vehicleDetails,
                      assignedDriver: selectedRequest.assignedDriver,
                      travelDistance: selectedRequest.travelDistance,
                      tripExplanation: selectedRequest.travelReason,
                      claimantName: selectedRequest.claimantName,
                      serviceNumber: `FR-${selectedRequest.id}`,
                      actualStartingDate: selectedRequest.actualStartingDate,
                      actualReturnDate: selectedRequest.actualReturnDate,
                    }}
                    onSuccess={handleSuccess}
                  />
                ) : (
                  <FuelReturnForm 
                  travelRequestId={selectedRequest.id}
                    defaultValues={{
                      startingPlace: selectedRequest.startingPlace,
                      destinationPlace: selectedRequest.destinationPlace,
                      vehicleType: selectedRequest.assignedCarType,
                      licensePlate: selectedRequest.vehicleDetails,
                      assignedDriver: selectedRequest.assignedDriver,
                      tripExplanation: selectedRequest.travelReason,
                      claimantName: selectedRequest.claimantName,
                      serviceNumber: `FR-${selectedRequest.id}`,
                      actualStartingDate: selectedRequest.actualStartingDate,
                      actualReturnDate: selectedRequest.actualReturnDate,
                      startingKilometrs:selectedRequest.startingKilometers,
                      endingKilometrs:selectedRequest.endingKilometers,
                      kmDifference:selectedRequest.kmDifference
                    }}
                    onSuccess={handleSuccess}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuelManagementPage;