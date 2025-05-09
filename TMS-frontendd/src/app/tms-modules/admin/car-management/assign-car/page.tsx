// src/app/tms-modules/admin/car-management/assign-cars/page.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiPlusCircle, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import AssignCarForm from './components/AssignCarForm';
import AssignCarManagerForm from './components/AssignCarManagerForm';
import AssignedCarTable from './components/AssignedCarTable';
import AssignedCarStats from './components/AssignedCarStats';
import ManualAssignmentView from './/components/ManualAssignmentView';
import {
  fetchAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus
} from './api/assignmentServices';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

type TabType = 'assigned' | 'assign';
type ActorType = 'manager' | 'top-manager';

interface Car {
  plateNumber: string;
  model?: string;
  carType?: string;
  manufactureYear?: number;
  motorCapacity?: string;
  fuelType?: string;
  status?: string;
  parkingLocation?: string;
}

interface RentCar {
  plateNumber: string;
  companyName?: string;
  model?: string;
  bodyType?: string;
  status?: string;
  km?: string;
  fuelType?: string;
}

interface Assignment {
  id: number;
  requestLetterNo: string;
  requesterName: string;
  position: string;
  department: string;
  rentalType: string;
  phoneNumber?: string;
  travelWorkPercentage?: string;
  shortNoticePercentage?: string;
  mobilityIssue?: string;
  gender?: string;
  requestDate?: string;
  car?: Car;
  rentCar?: RentCar;
  status: 'Active' | 'Completed' | 'Upcoming' | 'Approved' | 'Assigned' | 'Pending' | 'Rejected';
  assignedDate: string;
  allPlateNumbers?: string;
  allCarModels?: string;
  carIds?: string[];
  model?: string;
  totalPercentage?: number;
  numberOfCar?: string;
}
export default function CarAssignment() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const [actorType, setActorType] = useState<ActorType>('manager');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [activeLevelFilter, setActiveLevelFilter] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<'assign' | 'manager'>('assign');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Assignment | null>(null);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAllAssignments();

      if (response.success && Array.isArray(response.data)) {
        setAssignments(response.data);
        applyFilters(response.data, searchTerm, activeStatusFilter, activeLevelFilter);
      } else {
        throw new Error(response.message || 'Invalid data format received');
      }
    } catch (error) {
      console.error('Load Assignments Error:', error);
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to load assignments',
        icon: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (
    dataToFilter: Assignment[],
    searchQuery: string,
    statusFilter: string | null,
    levelFilter: string | null
  ) => {
    const normalizeKey = (value: string) =>
      value.toLowerCase().replace(/\s/g, '');

    let filtered = [...dataToFilter];

    if (statusFilter) {
      filtered = filtered.filter(assignment => 
        assignment.status === statusFilter
      );
    }

    if (levelFilter) {
      filtered = filtered.filter(assignment => 
        normalizeKey(assignment.position) === levelFilter
      );
    }

    if (searchQuery.trim()) {
      const searchTermLower = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment => {
        const vehiclePlate = assignment.car?.plateNumber || assignment.rentCar?.plateNumber || '';
        return (
          assignment.requesterName.toLowerCase().includes(searchTermLower) ||
          assignment.requestLetterNo.toLowerCase().includes(searchTermLower) ||
          assignment.department.toLowerCase().includes(searchTermLower) ||
          vehiclePlate.toLowerCase().includes(searchTermLower)
        );
      });
    }

    setFilteredAssignments(filtered);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
    applyFilters(assignments, query, activeStatusFilter, activeLevelFilter);
  }, [assignments, activeStatusFilter, activeLevelFilter]);

  const handleStatusFilter = (status: string | null) => {
    setActiveStatusFilter(status);
    applyFilters(assignments, searchTerm, status, activeLevelFilter);
  };

  const handleLevelFilter = (level: string | null) => {
    setActiveLevelFilter(level);
    applyFilters(assignments, searchTerm, activeStatusFilter, level);
  };

  const showSuccessAlert = (message: string) => {
    return Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleSubmitAssignment = async (formData: Assignment) => {
    try {
      setIsSubmitting(true);
      const { success, message } = selectedAssignment
        ? await updateAssignment(formData.id, formData)
        : await createAssignment(formData);

      if (success) {
        await showSuccessAlert(message || 'Assignment saved successfully');
        await loadAssignments();
        setIsFormOpen(false);
        setSelectedAssignment(null);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to save assignment',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const { success, message } = await deleteAssignment(id);
        
        if (success) {
          await showSuccessAlert(message || 'Assignment deleted successfully');
          await loadAssignments();
        } else {
          throw new Error(message);
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error instanceof Error ? error.message : 'Failed to delete assignment',
          icon: 'error',
        });
      }
    }
  };

  const handleViewAssignment = (id: number) => {
    router.push(`/tms-modules/admin/car-management/assign-car/view-assignment/${id}`);
  };

  const toggleFormType = () => {
    setActiveForm(activeForm === 'assign' ? 'manager' : 'assign');
  };

  const toggleActorType = () => {
    setActorType(actorType === 'manager' ? 'top-manager' : 'manager');
  };

  const handleRowClick = (assignment: Assignment) => {
    if (actorType === 'top-manager') {
      setSelectedRequest(assignment);
      setShowRequestModal(true);
    }
  };

  const handleStatusChange = async (status: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;

    try {
      setIsSubmitting(true);
      const { success, message } = await updateAssignmentStatus(selectedRequest.id, status);
      
      if (success) {
        await showSuccessAlert(message || `Request ${status.toLowerCase()} successfully`);
        await loadAssignments();
        setShowRequestModal(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : `Failed to ${status.toLowerCase()} request`,
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters(assignments, searchTerm, activeStatusFilter, activeLevelFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, assignments, activeStatusFilter, activeLevelFilter]);

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden max-w-screen-2xl mx-auto w-[940px]">
      {/* Header and Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 w-full"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Vehicle Assignment Management
        </h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Actor type toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleActorType}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              actorType === 'manager' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {actorType === 'manager' ? 'Switch to Top Manager' : 'Switch to Manager'}
          </motion.button>

          {activeTab === 'assigned' && (
            <>
              <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="text-gray-600" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                onClick={loadAssignments}
              >
                <FiRefreshCw className="text-gray-600" />
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex border-b border-gray-200 px-2 w-full"
      >
        <button
          className={`px-3 py-2 text-sm font-medium focus:outline-none ${
            activeTab === 'assigned'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned Vehicles
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium focus:outline-none ${
            activeTab === 'assign'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('assign');
            setActiveForm('assign');
          }}
        >
          Assign Vehicle
        </button>
      </motion.div>

      {/* Tab Content */}
      <div className="space-y-6 px-2 w-full">
        {activeTab === 'assign' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full"
          >
            {actorType === 'top-manager' ? (
              <ManualAssignmentView />
            ) : (
              <>
                <div className="relative w-full mb-12">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`absolute top-0 right-0 px-4 py-2 font-semibold rounded shadow ${
                      activeForm === 'assign'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                    onClick={toggleFormType}
                  >
                    {activeForm === 'assign' ? 'Management' : 'Top Manager'}
                  </motion.button>
                </div>

                {activeForm === 'assign' ? (
                  <AssignCarManagerForm
                    assignment={selectedAssignment}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmitAssignment}
                    onCancel={() => {
                      setIsFormOpen(false);
                      setSelectedAssignment(null);
                    }}
                  />
                ) : (
                  <AssignCarForm
                    assignment={selectedAssignment}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmitAssignment}
                    onCancel={() => {
                      setIsFormOpen(false);
                      setSelectedAssignment(null);
                    }}
                  />
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'assigned' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="px-1 sm:w-[910px]"
            >
              <AssignedCarStats 
                assignments={assignments} 
                onStatusFilter={handleStatusFilter}
                onLevelFilter={handleLevelFilter}
                activeStatusFilter={activeStatusFilter}
                activeLevelFilter={activeLevelFilter}
                actorType={actorType}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg mx-1 w-[100px] sm:w-[910px]"
            >
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Assignment Records</h2>
                {actorType === 'manager' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAssignment(null);
                      setActiveTab('assign');
                      setActiveForm('assign');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm bg-white"
                  >
                    <FiPlusCircle
                      className="w-12 h-12 p-1 rounded-full text-[#3c8dbc] transition-colors duration-200 hover:bg-[#3c8dbc] hover:text-white"
                    />
                  </motion.button>
                )}
              </div>

              {isLoading ? (
                <div className="p-8 flex justify-center items-center w-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <AssignedCarTable 
                    assignments={filteredAssignments}
                    onEdit={(assignment) => {
                      setSelectedAssignment(assignment);
                      setActiveTab('assign');
                      setActiveForm('assign');
                    }}
                    onDelete={handleDeleteAssignment}
                    onView={handleViewAssignment}
                    activeFilter={activeStatusFilter || activeLevelFilter}
                    onFilterClick={(filterType) => {
                      if (filterType === 'status') {
                        setActiveStatusFilter(null);
                      } else {
                        setActiveLevelFilter(null);
                      }
                    }}
                    actorType={actorType}
                    onRowClick={handleRowClick}
                  />
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>

  <AnimatePresence>
  {showRequestModal && selectedRequest && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Request Details: {selectedRequest.requestLetterNo}
            </h2>
            <button
              onClick={() => setShowRequestModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Request Information */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                Request Information
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Request Letter No", value: selectedRequest.requestLetterNo },
                  { label: "Request Date", value: new Date(selectedRequest.requestDate).toLocaleDateString() },
                  { label: "Requester Name", value: selectedRequest.requesterName },
                  { label: "Department", value: selectedRequest.department },
                  { label: "Position", value: selectedRequest.position },
                  { label: "Phone Number", value: selectedRequest.phoneNumber },
                  { label: "Rental Type", value: selectedRequest.rentalType },
                  { label: "Travel Work %", value: selectedRequest.travelWorkPercentage },
                  { label: "Short Notice %", value: selectedRequest.shortNoticePercentage },
                  { label: "Mobility Issue", value: selectedRequest.mobilityIssue },
                  { label: "Gender", value: selectedRequest.gender },
                  { label: "Total Percentage", value: `${selectedRequest.totalPercentage || 0}%` },
                  { label: "Status", value: selectedRequest.status },
                  { label: "Assigned Date", value: selectedRequest.assignedDate ? new Date(selectedRequest.assignedDate).toLocaleDateString() : 'N/A' }
                ].map((item, index) => (
                  <div key={index} className="flex border-b border-gray-100 pb-3">
                    <span className="font-medium text-gray-600 w-48">{item.label}:</span>
                    <span className="text-gray-800">{item.value || '-'}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vehicle Information - Updated to handle multiple cars */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
                Vehicle Information
              </h3>
              
              {selectedRequest.allPlateNumbers ? (
                <div className="space-y-6">
                  <div className="font-medium text-gray-700">
                    Assigned {selectedRequest.allPlateNumbers.split(',').length} vehicles:
                  </div>
                  
                  {/* Display all plate numbers and models */}
                  <div className="space-y-4">
                    <div className="flex border-b border-gray-100 pb-3">
                      <span className="font-medium text-gray-600 w-48">All Plate Numbers:</span>
                      <span className="text-gray-800">{selectedRequest.allPlateNumbers}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-3">
                      <span className="font-medium text-gray-600 w-48">All Models:</span>
                      <span className="text-gray-800">{selectedRequest.allCarModels || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* If we have car details (from API), show them in individual cards */}
                  {selectedRequest.car && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-semibold mb-2">Primary Vehicle Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Plate Number", value: selectedRequest.car.plateNumber },
                          { label: "Model", value: selectedRequest.car.model },
                          { label: "Type", value: selectedRequest.car.carType },
                          { label: "Year", value: selectedRequest.car.manufactureYear },
                          { label: "Status", value: selectedRequest.car.status }
                        ].map((item, index) => (
                          <div key={index} className="flex">
                            <span className="font-medium text-gray-600 w-32">{item.label}:</span>
                            <span className="text-gray-800">{item.value || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* If we have rent car details */}
                  {selectedRequest.rentCar && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-semibold mb-2">Rental Vehicle Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Plate Number", value: selectedRequest.rentCar.plateNumber },
                          { label: "Company", value: selectedRequest.rentCar.companyName },
                          { label: "Model", value: selectedRequest.rentCar.model },
                           { label: "Body Type", value: selectedRequest.rentCar.bodyType },
                          { label: "Status", value: selectedRequest.rentCar.status },
                          { label: "KM", value: selectedRequest.rentCar.km }
                        ].map((item, index) => (
                          <div key={index} className="flex">
                            <span className="font-medium text-gray-600 w-32">{item.label}:</span>
                            <span className="text-gray-800">{item.value || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedRequest.car ? (
                <div className="space-y-4">
                  {[
                    { label: "Plate Number", value: selectedRequest.car.plateNumber },
                    { label: "Model", value: selectedRequest.car.model },
                    { label: "Type", value: selectedRequest.car.carType },
                    { label: "Year", value: selectedRequest.car.manufactureYear },
                    { label: "Motor Capacity", value: selectedRequest.car.motorCapacity },
                    { label: "Fuel Type", value: selectedRequest.car.fuelType },
                    { label: "Status", value: selectedRequest.car.status },
                    { label: "Parking Location", value: selectedRequest.car.parkingLocation }
                  ].map((item, index) => (
                    <div key={index} className="flex border-b border-gray-100 pb-3">
                      <span className="font-medium text-gray-600 w-48">{item.label}:</span>
                      <span className="text-gray-800">{item.value || '-'}</span>
                    </div>
                  ))}
                </div>
              ) : selectedRequest.rentCar ? (
                <div className="space-y-4">
                  {[
                    { label: "Plate Number", value: selectedRequest.rentCar.plateNumber },
                    { label: "Company", value: selectedRequest.rentCar.companyName },
                    { label: "Model", value: selectedRequest.rentCar.model },
                    { label: "Body Type", value: selectedRequest.rentCar.bodyType },
                    { label: "Status", value: selectedRequest.rentCar.status },
                    { label: "KM", value: selectedRequest.rentCar.km },
                    { label: "Fuel Type", value: selectedRequest.rentCar.fuelType }
                  ].map((item, index) => (
                    <div key={index} className="flex border-b border-gray-100 pb-3">
                      <span className="font-medium text-gray-600 w-48">{item.label}:</span>
                      <span className="text-gray-800">{item.value || '-'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No vehicle assigned to this request
                </div>
              )}
            </motion.div>
          </div>

          {/* Summary Section */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2" />
              Assignment Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="font-medium text-gray-600 mb-2">Assignment Status</p>
                <p className={`text-lg font-bold ${
                  selectedRequest.status === 'Assigned' ? 'text-green-600' : 
                  selectedRequest.status === 'Pending' ? 'text-yellow-600' : 
                  'text-gray-600'
                }`}>
                  {selectedRequest.status}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="font-medium text-gray-600 mb-2">Priority Score</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      (selectedRequest.totalPercentage || 0) > 75 ? 'bg-red-500' :
                      (selectedRequest.totalPercentage || 0) > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${selectedRequest.totalPercentage || 0}%` }}
                  />
                </div>
                <p className="text-right mt-1 text-sm font-medium">
                  {selectedRequest.totalPercentage || 0}%
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="font-medium text-gray-600 mb-2">Vehicle Status</p>
                {selectedRequest.allPlateNumbers ? (
                  <p className="text-lg font-bold text-blue-600">
                    {selectedRequest.allPlateNumbers.split(',').length} vehicles assigned
                  </p>
                ) : (
                  <p className={`text-lg font-bold ${
                    selectedRequest.car?.status === 'Available' ? 'text-green-600' : 
                    selectedRequest.car?.status === 'Assigned' ? 'text-blue-600' : 
                    selectedRequest.rentCar?.status === 'Available' ? 'text-green-600' :
                    selectedRequest.rentCar?.status === 'Assigned' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {selectedRequest.car?.status || selectedRequest.rentCar?.status || 'N/A'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Approve/Reject Buttons - Shown for Assigned requests when top-manager */}
          {selectedRequest.status === 'Assigned' && actorType === 'top-manager' && (
            <div className="mt-6 flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange('Rejected')}
                disabled={isSubmitting}
                className="px-6 py-3 bg-red-600 text-white rounded-lg disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Reject Assignment'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange('Approved')}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Confirm Approval'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}