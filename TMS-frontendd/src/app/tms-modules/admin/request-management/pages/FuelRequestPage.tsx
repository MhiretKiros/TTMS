"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTruck, FiPackage, FiSearch, FiX, FiCheck, FiUser, FiCalendar, FiMapPin } from 'react-icons/fi';
import Swal from 'sweetalert2';
import RequestsTable from '../components/RequestsTable';
import { FuelRequestForm } from '../components/FuelForms/FuelRequestForm';
import { FuelReturnForm } from '../components/FuelForms/FuelReturnForm';
import { TravelApi, TravelRequest } from '../api/handlers';
import { useNotification } from '@/app/contexts/NotificationContext';

const FuelManagementPage = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'returns'>('requests');
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [returns, setReturns] = useState<TravelRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'DISTRIBUTOR' | 'NEZEK'>('DISTRIBUTOR');
  const { addNotification } = useNotification();

  useEffect(() => {
    // Get user role from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role?.toUpperCase();
        
        // Set user role based on localStorage
        if (role === 'DISTRIBUTOR' || role === 'HEAD_OF_DISTRIBUTOR') {
          setUserRole('DISTRIBUTOR');
        } else if (role === 'NEZEK') {
          setUserRole('NEZEK');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserRole('DISTRIBUTOR');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const loadData = async () => {
      try {
        const data = await TravelApi.getRequests(userRole.toLowerCase() as 'distributor' | 'nezek');
        
        if (userRole === 'DISTRIBUTOR') {
          if (activeTab === 'requests') {
            setRequests(data.filter(req => req.status === 'ASSIGNED'));
          } else {
            setReturns(data.filter(req => req.status === 'FINISHED'));
          }
        } else { // NEZEK
          if (activeTab === 'requests') {
            setRequests(data.filter(req => req.status === 'COMPLETED'));
          } else {
            setReturns(data.filter(req => req.status === 'SUCCESED'));
          }
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to load requests', 'error');
      }
    };
    loadData();
  }, [activeTab, userRole, loading]);

  const handleSuccess = () => {
    setSelectedRequest(null);
    TravelApi.getRequests(userRole.toLowerCase() as 'distributor' | 'nezek')
      .then(data => {
        if (userRole === 'DISTRIBUTOR') {
          if (activeTab === 'requests') {
            setRequests(data.filter(req => req.status === 'ASSIGNED'));
          } else {
            setReturns(data.filter(req => req.status === 'FINISHED'));
          }
        } else { // NEZEK
          if (activeTab === 'requests') {
            setRequests(data.filter(req => req.status === 'COMPLETED'));
          } else {
            setReturns(data.filter(req => req.status === 'SUCCESED'));
          }
        }
      });
  };

  const handleNezekApprove = async () => {
    if (!selectedRequest?.id) return;

    try {
      setIsSubmitting(true);

      const newStatus: 'ACCEPTED' | 'ENDED' =
        activeTab === 'requests' ? 'ACCEPTED' : 'ENDED';

      const updatedRequest = await TravelApi.updateRequestStatus(
        selectedRequest.id,
        newStatus
      );

      showSuccessAlert(
        'Success!',
        `Request has been ${updatedRequest.status.toLowerCase()}`
      );
      handleSuccess();
      if(newStatus=="ACCEPTED"){
   try {
      await addNotification(
        `New Field Request is Completed Now You can go to field `,
        `/tms-modules/admin/request-management/request-field`,
        'DRIVER'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }
      }
    
    } catch (error: any) {
      Swal.fire(
        'Error',
        error.message || 'Failed to update request status',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessAlert = (title: string, message: string) => {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg'
      }
    });
  };

  const renderDetailField = (label: string, value: any, icon?: React.ReactNode) => (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100">
      {icon && <span className="text-gray-400 mt-1">{icon}</span>}
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value || '-'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Tab Navigation (for both roles) */}
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
            {userRole === 'DISTRIBUTOR' ? 'New Fuel Requests' : 'Completed Requests'}
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
            {userRole === 'DISTRIBUTOR' ? 'Fuel Returns' : 'Successful Returns'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-auto">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
      </div>

      {/* View title based on role */}
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        {activeTab === 'requests' ? (
          <>
            <FiTruck className="mr-2" />
            {userRole === 'DISTRIBUTOR' 
              ? 'New Fuel Requests' 
              : 'Completed Fuel Requests (Ready for Approval)'}
          </>
        ) : (
          <>
            <FiPackage className="mr-2" />
            {userRole === 'DISTRIBUTOR' 
              ? 'Fuel Returns' 
              : 'Successful Fuel Returns (Ready for Completion)'}
          </>
        )}
      </h2>

      <RequestsTable
        requests={activeTab === 'requests' ? requests : returns}
        actorType={userRole.toLowerCase() as 'distributor' | 'nezek'}
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
                    {activeTab === 'requests' ? (
                      <FiTruck className="mr-2 inline-block" />
                    ) : (
                      <FiPackage className="mr-2 inline-block" />
                    )}
                    {userRole === 'DISTRIBUTOR' ? (
                      activeTab === 'requests' ? 'Fuel Request for Fieldwork' : 'Fuel Request for Return to Fieldwork'
                    ) : (
                      activeTab === 'requests' ? 'Fuel Request Approval' : 'Fuel Return Completion'
                    )}
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiX className="text-gray-500" />
                  </button>
                </div>

                {userRole === 'DISTRIBUTOR' ? (
                  activeTab === 'requests' ? (
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
                        accountNumber: selectedRequest.accountNumber,
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
                        startingKilometrs: selectedRequest.startingKilometers,
                        endingKilometrs: selectedRequest.endingKilometers,
                        kmDifference: selectedRequest.kmDifference
                      }}
                      onSuccess={handleSuccess}
                    />
                  )
                ) : (
                  <div className="space-y-4">
                    {/* Request Details Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-3 text-lg">Request Details</h3>
                      
                      {renderDetailField('Service Number', `FR-${selectedRequest.id}`)}
                      {renderDetailField('Claimant Name', selectedRequest.claimantName, <FiUser />)}
                      {renderDetailField('Starting Date', selectedRequest.actualStartingDate ? new Date(selectedRequest.actualStartingDate).toLocaleDateString() : '-', <FiCalendar />)}
                      {renderDetailField('Ending Date', selectedRequest.actualReturnDate ? new Date(selectedRequest.actualReturnDate).toLocaleDateString() : '-', <FiCalendar />)}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          {renderDetailField('Starting Place', selectedRequest.startingPlace, <FiMapPin />)}
                        </div>
                        <div>
                          {renderDetailField('Destination', selectedRequest.destinationPlace, <FiMapPin />)}
                        </div>
                      </div>
                      
                      {/* Additional fields from FuelRequestForm */}
                      {activeTab === 'requests' && (
                        <>
                          {renderDetailField('Travel Distance', `${selectedRequest.travelDistance} km`)}
                          {renderDetailField('Vehicle Type', selectedRequest.assignedCarType, <FiTruck />)}
                          {renderDetailField('License Plate', selectedRequest.vehicleDetails)}
                          {renderDetailField('Assigned Driver', selectedRequest.assignedDriver)}
                          {renderDetailField('Trip Explanation', selectedRequest.travelReason)}
                          {renderDetailField('Account Number', selectedRequest.accountNumber)}
                          {renderDetailField('Payment Type', selectedRequest.accountNumber ? 'Cash' : 'Fuel')}
                          {renderDetailField('Authorizer Name', selectedRequest.authorizerName)}
                        </>
                      )}
                      
                      {/* Additional fields from FuelReturnForm */}
                      {activeTab === 'returns' && (
                        <>
                          {renderDetailField('Starting Kilometers', selectedRequest.startingKilometers)}
                          {renderDetailField('Ending Kilometers', selectedRequest.endingKilometers)}
                          {renderDetailField('Distance Traveled', `${selectedRequest.kmDifference} km`)}
                          {renderDetailField('Vehicle Type', selectedRequest.assignedCarType, <FiTruck />)}
                          {renderDetailField('License Plate', selectedRequest.vehicleDetails)}
                          {renderDetailField('Assigned Driver', selectedRequest.assignedDriver)}
                          {renderDetailField('Trip Explanation', selectedRequest.travelReason)}
                          {renderDetailField('Assembler Name', selectedRequest.assemblerName)}
                        </>
                      )}
                    </div>

                    {/* Confirmation Checkbox (always checked for nezek) */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <label className="inline-flex items-start gap-2 text-sm text-blue-800">
                        <input
                          type="checkbox"
                          checked={true}
                          readOnly
                          className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>
                          {activeTab === 'requests' 
                            ? 'Fuel request has been properly completed by distributor' 
                            : 'Fuel return has been properly documented and verified'}
                        </span>
                      </label>
                    </div>

                    {/* Approval button for nezek */}
                    <div className="flex justify-end pt-4">
                      <motion.button
                        onClick={handleNezekApprove}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSubmitting}
                        className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiCheck className="mr-2" />
                            {activeTab === 'requests' ? 'Accept Request' : 'Accept Return'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
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