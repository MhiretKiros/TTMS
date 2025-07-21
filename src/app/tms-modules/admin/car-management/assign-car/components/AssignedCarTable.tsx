'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
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
  const tableBodyHeight = '24rem';
  const [selectedApprovedAssignment, setSelectedApprovedAssignment] = useState<any>(null);
  const [selectedTransferAssignment, setSelectedTransferAssignment] = useState<any>(null);
  const [showAcceptanceForm, setShowAcceptanceForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlateSelector, setShowPlateSelector] = useState(false);
  const [availablePlates, setAvailablePlates] = useState<string[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<string>('');

  // Extract plate numbers from allPlateNumbers string
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
        // Handle completed status with selected plate
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
        // Handle approved/waiting status with selected plate
        setSelectedApprovedAssignment({
          ...selectedApprovedAssignment,
          selectedPlate: plate
        });
        setShowAcceptanceForm(true);
      }
    } else if (selectedTransferAssignment) {
      // Handle transfer with selected plate
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

  const renderStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    
    switch (status) {
      case 'Active':
      case 'Approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
      case 'Completed':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{status}</span>;
      case 'Waiting':
        return <span className={`${baseClasses} bg-yellow-100 text-blue-800`}>{status}</span>;
      case 'In_transfer':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>{status}</span>;
      case 'Rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{status}</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="relative">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Request No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                All Plate Numbers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Actions
              </th>
            </tr>
          </thead>
        </table>
        <div 
          className="overflow-y-auto"
          style={{ height: tableBodyHeight }}
        >
          <table className="w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <motion.tr
                  key={assignment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`hover:bg-gray-50 ${
                    (actorType === 'top-manager' || 
                    (actorType === 'manager' && 
                     (assignment.status === 'Approved' || 
                      assignment.status === 'Waiting' ||
                      assignment.status === 'Completed' ||
                      assignment.status === 'In_transfer'))) 
                    ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleRowClick(assignment)}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    actorType === 'manager' && 
                    (assignment.status === 'Approved' || 
                     assignment.status === 'Waiting' ||
                     assignment.status === 'Completed' ||
                     assignment.status === 'In_transfer') ? 
                    'text-blue-600 hover:underline' : 'text-gray-900'
                  }`}>
                    {assignment.requesterName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.requestLetterNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.car?.plateNumber || assignment.rentCar?.plateNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(assignment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.allPlateNumbers || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {actorType === 'manager' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(assignment);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(assignment.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(assignment.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                  <span className="font-medium">{plate}</span>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
              <span>Loading vehicle acceptance data...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedCarTable;