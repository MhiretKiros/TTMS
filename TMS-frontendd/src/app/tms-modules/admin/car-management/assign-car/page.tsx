"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import AssignCarForm from './components/AssignCarForm';
import AssignedCarTable from './components/AssignedCarTable';
import AssignedCarStats from './components/AssignedCarStats';
import { 
  fetchAllAssignments,
  createAssignment,
  updateAssignment, 
  deleteAssignment 
} from './api/assignmentServices';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

type TabType = 'assign' | 'assigned';

interface Assignment {
  id: number;
  requestLetterNo: string;
  requesterName: string;
  position: string;
  department: string;
  rentalType: string;
  car?: { plateNumber: string };
  rentCar?: { plateNumber: string };
  status: 'Active' | 'Completed' | 'Upcoming';
  assignedDate: string;
}

export default function CarAssignment() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('assign');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await fetchAllAssignments();
      
      if (response.success && Array.isArray(response.data)) {
        setAssignments(response.data);
        applyFilters(response.data, searchTerm, activeFilter);
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

  const applyFilters = (dataToFilter: Assignment[], searchQuery: string, filter: string | null) => {
    const normalizeKey = (value: string) => 
      value.toLowerCase().replace(/\s/g, '');
  
    let filtered = [...dataToFilter];
    
    if (filter && filter.startsWith('level')) {
      filtered = filtered.filter(assignment => 
        normalizeKey(assignment.position) === filter
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
    applyFilters(assignments, query, activeFilter);
  }, [assignments, activeFilter]);

  const handleFilterClick = (filter: string | null) => {
    setActiveFilter(filter === activeFilter ? null : filter);
    applyFilters(assignments, searchTerm, filter === activeFilter ? null : filter);
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
    router.push(`/tms-modules/admin/car-management/assign-car/view/${id}`);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters(assignments, searchTerm, activeFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, assignments, activeFilter]);

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden max-w-screen-2xl mx-auto">
      {/* Header and Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Vehicle Assignment Management
        </h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
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
        className="flex border-b border-gray-200 px-2"
      >
        <button
          className={`px-3 py-2 text-sm font-medium focus:outline-none ${
            activeTab === 'assign'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('assign')}
        >
          Assign Vehicle
        </button>
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
      </motion.div>

      {/* Tab Content */}
      <div className="space-y-6 px-2">
        {activeTab === 'assign' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
          >
        <div className=" p-6" style={{ backgroundColor: '#3c8dbc' }}>
          <h1 className="text-3xl font-bold text-white">
            🚀 Vehicle Assignment Portal
          </h1>
        </div>
              <AssignCarForm
              assignment={selectedAssignment}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitAssignment}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedAssignment(null);
              }}
            />
          </motion.div>
        )}

        {activeTab === 'assigned' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="px-1"
            >
              <AssignedCarStats 
                assignments={assignments} 
                onFilterClick={handleFilterClick} 
                activeFilter={activeFilter}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg mx-1"
            >
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Assignment Records</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedAssignment(null);
                    setActiveTab('assign');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  style={{ backgroundColor: '#3c8dbc' }}>
                  <FiPlus className="h-4 w-4" /> New Assignment
                </motion.button>
              </div>

              {isLoading ? (
                <div className="p-8 flex justify-center items-center">
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
                  className="w-full overflow-hidden"
                >
                  <div className="max-h-[600px] overflow-y-auto scroll-smooth">
                    <table className="w-full divide-y divide-gray-200 table-fixed">
                      <AssignedCarTable 
                        assignments={filteredAssignments}
                        onEdit={(assignment) => {
                          setSelectedAssignment(assignment);
                          setActiveTab('assign');
                        }}
                        onDelete={handleDeleteAssignment}
                        onView={handleViewAssignment}
                        activeFilter={activeFilter}
                        onFilterClick={handleFilterClick}
                      />
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}