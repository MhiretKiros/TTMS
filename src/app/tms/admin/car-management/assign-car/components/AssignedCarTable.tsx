'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiEye, FiUser, FiFileText, FiBriefcase, FiTruck, FiCheckCircle, FiClock, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import VehicleAcceptanceForm from './VehicleAcceptanceForm';
import CarTransferForm from './CarTransferForm';
import { getLatestVehicleAcceptanceByPlate } from '../api/vehicleAcceptanceApi';
import Swal from 'sweetalert2';

interface AssignedCarTableProps {
  assignments: any[];
  onEdit: (assignment: any) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  activeFilter: string | null;
  onFilterClick: (filterType: string) => void;
  actorType: 'manager' | 'top-manager';
  onRowClick: (assignment: any) => void;
  refreshData: () => void;
}

const AssignedCarTable = ({
  assignments,
  onEdit,
  onDelete,
  onView,
  activeFilter,
  onFilterClick,
  actorType,
  onRowClick,
  refreshData
}: AssignedCarTableProps) => {
  const [selectedApprovedAssignment, setSelectedApprovedAssignment] = useState<any>(null);
  const [selectedTransferAssignment, setSelectedTransferAssignment] = useState<any>(null);
  const [showAcceptanceForm, setShowAcceptanceForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlateSelector, setShowPlateSelector] = useState(false);
  const [availablePlates, setAvailablePlates] = useState<string[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<string>('');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In_transfer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return <FiCheckCircle className="h-4 w-4 text-green-600" />;
      case 'Completed':
        return <FiCheckCircle className="h-4 w-4 text-blue-600" />;
      case 'Waiting':
        return <FiClock className="h-4 w-4 text-yellow-600" />;
      case 'In_transfer':
        return <FiRefreshCw className="h-4 w-4 text-purple-600" />;
      default:
        return <FiClock className="h-4 w-4 text-gray-600" />;
    }
  };

  const extractPlates = (allPlateNumbers: string) => {
    if (!allPlateNumbers) return [];
    return allPlateNumbers.split(',').map(plate => plate.trim()).filter(plate => plate);
  };

  const handleApprovedRowClick = async (assignment: any) => {
    const plates = extractPlates(assignment.allPlateNumbers);
    
    if (plates.length > 1) {
      setAvailablePlates(plates);
      setSelectedApprovedAssignment({
        ...assignment,
        isApprovedStatus: true
      });
      setShowPlateSelector(true);
    } else {
      setSelectedApprovedAssignment({
        ...assignment,
        isApprovedStatus: true,
        selectedPlate: plates[0] || ''
      });
      setShowAcceptanceForm(true);
    }
  };

  const handleWaitingRowClick = async (assignment: any) => {
    const plates = extractPlates(assignment.allPlateNumbers);
    
    if (plates.length > 1) {
      setAvailablePlates(plates);
      setSelectedApprovedAssignment({
        ...assignment,
        isWaitingStatus: true
      });
      setShowPlateSelector(true);
    } else {
      setSelectedApprovedAssignment({
        ...assignment,
        isWaitingStatus: true,
        selectedPlate: plates[0] || ''
      });
      setShowAcceptanceForm(true);
    }
  };

  const handleCompletedRowClick = async (assignment: any) => {
    try {
      setIsLoading(true);
      const plates = extractPlates(assignment.allPlateNumbers);
      let plateToSearch = plates[0] || '';
      
      if (plates.length > 1) {
        setAvailablePlates(plates);
        setSelectedApprovedAssignment({
          ...assignment,
          isCompletedStatus: true
        });
        setShowPlateSelector(true);
        return;
      }

      const { data } = await getLatestVehicleAcceptanceByPlate(plateToSearch);
      
      setSelectedApprovedAssignment({
        ...assignment,
        existingAcceptance: data,
        id: assignment.id,
        carId: assignment.car?.id,
        rentCarId: assignment.rentCar?.id,
        assignmentHistoryId: assignment.id,
        selectedPlate: plateToSearch
      });
      setShowAcceptanceForm(true);
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to load existing acceptance data',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferRowClick = (assignment: any) => {
    const plates = extractPlates(assignment.allPlateNumbers);
    
    if (plates.length > 1) {
      setAvailablePlates(plates);
      setSelectedTransferAssignment(assignment);
      setShowPlateSelector(true);
    } else {
      setSelectedTransferAssignment({
        ...assignment,
        selectedPlate: plates[0] || ''
      });
      setShowTransferForm(true);
    }
  };

  const handlePlateSelection = (plate: string) => {
    setSelectedPlate(plate);
    setShowPlateSelector(false);
    
    if (selectedApprovedAssignment) {
      if (selectedApprovedAssignment.isCompletedStatus) {
        getLatestVehicleAcceptanceByPlate(plate)
          .then(({ data }) => {
            setSelectedApprovedAssignment({
              ...selectedApprovedAssignment,
              existingAcceptance: data,
              selectedPlate: plate
            });
            setShowAcceptanceForm(true);
          })
          .catch(error => {
            Swal.fire({
              title: 'Error',
              text: error.message || 'Failed to load acceptance data',
              icon: 'error'
            });
          });
      } else {
        setSelectedApprovedAssignment({
          ...selectedApprovedAssignment,
          selectedPlate: plate
        });
        setShowAcceptanceForm(true);
      }
    } else if (selectedTransferAssignment) {
      setSelectedTransferAssignment({
        ...selectedTransferAssignment,
        selectedPlate: plate
      });
      setShowTransferForm(true);
    }
  };

  const handleRowClick = (assignment: any) => {
    if (actorType === 'top-manager') {
      onRowClick(assignment);
    } else {
      if (assignment.status === 'Approved') {
        handleApprovedRowClick(assignment);
      } else if (assignment.status === 'Completed') {
        handleCompletedRowClick(assignment);
      } else if (assignment.status === 'Waiting') {
        handleWaitingRowClick(assignment);
      } else if (assignment.status === 'In_transfer') {
        handleTransferRowClick(assignment);
      }
    }
  };

  const handleCloseAcceptanceForm = () => {
    setShowAcceptanceForm(false);
    setSelectedApprovedAssignment(null);
    setSelectedPlate('');
  };

  const handleCloseTransferForm = () => {
    setShowTransferForm(false);
    setSelectedTransferAssignment(null);
    setSelectedPlate('');
  };

  const handleClosePlateSelector = () => {
    setShowPlateSelector(false);
    setSelectedApprovedAssignment(null);
    setSelectedTransferAssignment(null);
    setSelectedPlate('');
  };

  const handleAcceptanceSuccess = async () => {
    if (typeof refreshData === 'function') {
      refreshData();
    }
    handleCloseAcceptanceForm();
    
    await Swal.fire({
      title: 'Success',
      text: 'Vehicle acceptance processed successfully',
      icon: 'success'
    });
  };

  const handleTransferSuccess = async () => {
    if (typeof refreshData === 'function') {
      refreshData();
    }
    handleCloseTransferForm();
    
    await Swal.fire({
      title: 'Success',
      text: 'Vehicle transfer processed successfully',
      icon: 'success'
    });
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden border border-gray-200 shadow-lg"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#3c8dbc]">
            <tr>
              {['Requester', 'Request No', 'Department', 'Vehicle', 'Status', 'All Plates', 'Actions'].map((header, index) => (
                <motion.th
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
                >
                  {header}
                </motion.th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-100">
            {assignments.map((assignment) => (
              <motion.tr 
                key={assignment.id}
                variants={rowVariants}
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: 'rgba(60, 141, 188, 0.03)',
                  boxShadow: '0 4px 12px rgba(60, 141, 188, 0.1)'
                }}
                className={`transition-all duration-200 ${
                  (actorType === 'top-manager' || 
                  (actorType === 'manager' && 
                   (assignment.status === 'Approved' || 
                    assignment.status === 'Waiting' ||
                    assignment.status === 'Completed' ||
                    assignment.status === 'In_transfer'))) 
                  ? 'cursor-pointer hover:bg-blue-50' : ''
                }`}
                onClick={() => handleRowClick(assignment)}
              >
                {/* Requester */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#3c8dbc] to-blue-400 rounded-lg flex items-center justify-center">
                      <FiUser className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-bold ${
                        actorType === 'manager' && 
                        (assignment.status === 'Approved' || 
                         assignment.status === 'Waiting' ||
                         assignment.status === 'Completed' ||
                         assignment.status === 'In_transfer') ? 
                        'text-blue-600' : 'text-gray-900'
                      }`}>
                        {assignment.requesterName}
                      </div>
                      <div className="text-xs text-gray-500">{assignment.position}</div>
                    </div>
                  </div>
                </td>

                {/* Request Number */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiFileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {assignment.requestLetterNo}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(assignment.requestDate).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </div>
                </td>

                {/* Department */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiBriefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                      {assignment.department}
                    </span>
                  </div>
                </td>

                {/* Vehicle */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiTruck className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {assignment.car?.plateNumber || assignment.rentCar?.plateNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {assignment.car?.carType || assignment.rentCar?.model || ''}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${getStatusColor(assignment.status)}`}
                  >
                    {getStatusIcon(assignment.status)}
                    <span className="ml-1.5">{assignment.status.replace(/_/g, ' ')}</span>
                  </motion.span>
                </td>

                {/* All Plate Numbers */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-xs">
                    <span className="text-sm text-gray-700">
                      {assignment.allPlateNumbers || 'N/A'}
                    </span>
                    {assignment.allPlateNumbers && extractPlates(assignment.allPlateNumbers).length > 1 && (
                      <div className="text-xs text-blue-600 mt-1 font-medium">
                        {extractPlates(assignment.allPlateNumbers).length} vehicles
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {actorType === 'manager' && (
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(assignment);
                        }}
                        className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <FiEdit className="h-5 w-5" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(assignment.id);
                      }}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(assignment.id);
                      }}
                      className="p-2 rounded-lg text-[#3c8dbc] hover:bg-blue-50 transition-colors"
                      title="View details"
                    >
                      <FiEye className="h-5 w-5" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {assignments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#3c8dbc] to-blue-400 mb-4">
            <FiTruck className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned vehicles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Vehicle Acceptance Form Modal */}
      <AnimatePresence>
        {showAcceptanceForm && selectedApprovedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Vehicle Acceptance Form - {selectedApprovedAssignment.requestLetterNo}
                  </h2>
                  <button
                    onClick={handleCloseAcceptanceForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <VehicleAcceptanceForm 
                  initialData={{
                    plateNumber: selectedApprovedAssignment.selectedPlate || 
                                selectedApprovedAssignment.car?.plateNumber || 
                                selectedApprovedAssignment.rentCar?.plateNumber || '',
                    carType: selectedApprovedAssignment.car?.carType || 
                            selectedApprovedAssignment.rentCar?.model || '',
                    km: selectedApprovedAssignment.rentCar?.km || '0',
                    assignmentHistoryId: selectedApprovedAssignment.id,
                    carId: selectedApprovedAssignment.carId,
                    rentCarId: selectedApprovedAssignment.rentCarId,
                    ...(selectedApprovedAssignment.status === 'Completed' && 
                        selectedApprovedAssignment.existingAcceptance)
                  }}
                  isCompletedStatus={selectedApprovedAssignment.status === 'Completed'}
                  isApprovedStatus={selectedApprovedAssignment.isApprovedStatus}
                  isWaitingStatus={selectedApprovedAssignment.isWaitingStatus}
                  onClose={handleCloseAcceptanceForm}
                  onSuccess={handleAcceptanceSuccess}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Transfer Form Modal */}
      <AnimatePresence>
        {showTransferForm && selectedTransferAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Vehicle Transfer - {selectedTransferAssignment.requestLetterNo}
                  </h2>
                  <button
                    onClick={handleCloseTransferForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <CarTransferForm 
                  initialData={{
                    assignmentHistoryId: selectedTransferAssignment.id,
                    oldPlateNumber: selectedTransferAssignment.selectedPlate || 
                                  selectedTransferAssignment.car?.plateNumber || 
                                  selectedTransferAssignment.rentCar?.plateNumber || '',
                    oldKmReading: selectedTransferAssignment.rentCar?.km || '0',
                    designatedOfficial: selectedTransferAssignment.requesterName,
                    driverName: selectedTransferAssignment.driverName || '',
                  }}
                  onClose={handleCloseTransferForm}
                  onSuccess={handleTransferSuccess}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plate Selection Modal */}
      <AnimatePresence>
        {showPlateSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gray-800"
                  >
                    Select Vehicle
                  </motion.h2>
                  <button
                    onClick={handleClosePlateSelector}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-gray-600 mb-4">This assignment contains multiple vehicles. Please select one:</p>
                  
                  <div className="space-y-3">
                    {availablePlates.map((plate, index) => (
                      <motion.button
                        key={plate}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: 0.1 + index * 0.05 }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePlateSelection(plate)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          selectedPlate === plate 
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#3c8dbc] to-blue-400 rounded-lg flex items-center justify-center mr-3">
                            <FiTruck className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-medium">{plate}</span>
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 transition-opacity ${
                            selectedPlate === plate ? 'opacity-100 text-blue-500' : 'opacity-0'
                          }`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4 flex justify-end"
                  >
                    <button
                      onClick={handleClosePlateSelector}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c8dbc] mr-4"></div>
              <span className="font-medium text-gray-700">Loading vehicle acceptance data...</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AssignedCarTable;