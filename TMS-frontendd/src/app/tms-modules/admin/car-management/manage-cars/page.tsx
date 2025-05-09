"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import CarTable from './components/CarTable';
import OrganizationCarTable from './components/OrganizationCarTable';
import RentCarTable from './components/RentCarTable';
import CarForm from './components/CarForm';
import OrganizationCarForm from './components/OrganizationCarForm';
import RentCarForm from './components/RentCarForm';
import Stats from './components/Stats';
import OrganizationCarStats from './components/OrganizationCarStats';
import RentCarStats from './components/RentCarStats';
import { fetchCars, createCar, updateCar, deleteCar } from './api/carServices';
import { fetchOrganizationCars, createOrganizationCar, updateOrganizationCar, deleteOrganizationCar } from './api/organizationCarServices';
import { fetchRentCars, createRentCar, updateRentCar, deleteRentCar } from './api/rentCarServices';
import { Car } from './types';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

type TabType = 'personal' | 'organization' | 'rented';

export default function ManageCars() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  
  // Personal Cars State
  const [personalCars, setPersonalCars] = useState<Car[]>([]);
  const [filteredPersonalCars, setFilteredPersonalCars] = useState<Car[]>([]);
  const [personalSearchTerm, setPersonalSearchTerm] = useState('');
  const [isPersonalFormOpen, setIsPersonalFormOpen] = useState(false);
  const [selectedPersonalCar, setSelectedPersonalCar] = useState<Car | null>(null);
  const [isPersonalLoading, setIsPersonalLoading] = useState(true);
  const [isPersonalSubmitting, setIsPersonalSubmitting] = useState(false);
  const [personalActiveFilter, setPersonalActiveFilter] = useState<string | null>(null);

  // Organization Cars State
  const [organizationCars, setOrganizationCars] = useState<any[]>([]);
  const [filteredOrganizationCars, setFilteredOrganizationCars] = useState<any[]>([]);
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState('');
  const [isOrganizationFormOpen, setIsOrganizationFormOpen] = useState(false);
  const [selectedOrganizationCar, setSelectedOrganizationCar] = useState<any | null>(null);
  const [isOrganizationLoading, setIsOrganizationLoading] = useState(true);
  const [isOrganizationSubmitting, setIsOrganizationSubmitting] = useState(false);
  const [organizationActiveFilter, setOrganizationActiveFilter] = useState<string | null>(null);

  // Rent Cars State
  const [rentCars, setRentCars] = useState<any[]>([]);
  const [filteredRentCars, setFilteredRentCars] = useState<any[]>([]);
  const [rentSearchTerm, setRentSearchTerm] = useState('');
  const [isRentFormOpen, setIsRentFormOpen] = useState(false);
  const [selectedRentCar, setSelectedRentCar] = useState<any | null>(null);
  const [isRentLoading, setIsRentLoading] = useState(true);
  const [isRentSubmitting, setIsRentSubmitting] = useState(false);
  const [rentActiveFilter, setRentActiveFilter] = useState<string | null>(null);

  // Load data functions
  const loadPersonalCars = async () => {
    try {
      setIsPersonalLoading(true);
      const { success, data, message } = await fetchCars();
      
      if (success) {
        setPersonalCars(data);
        applyPersonalFilters(data, personalSearchTerm, personalActiveFilter);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to load personal cars',
        icon: 'error',
      });
    } finally {
      setIsPersonalLoading(false);
    }
  };

  const loadOrganizationCars = async () => {
    try {
      setIsOrganizationLoading(true);
      const { success, data, message } = await fetchOrganizationCars();
      // <<< Add this log to see what the service function returns >>>
      console.log('Data received from fetchOrganizationCars service:', { success, data, message });
      
      if (success) {
        setOrganizationCars(data);
        applyOrganizationFilters(data, organizationSearchTerm, organizationActiveFilter);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to load organization cars',
        icon: 'error',
      });
    } finally {
      setIsOrganizationLoading(false);
    }
  };

  const loadRentCars = async () => {
    try {
      setIsRentLoading(true);
      const { success, data, message } = await fetchRentCars();
      
      if (success) {
        setRentCars(data);
        applyRentFilters(data, rentSearchTerm, rentActiveFilter);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to load rented cars',
        icon: 'error',
      });
    } finally {
      setIsRentLoading(false);
    }
  };

  // Filter functions
  const applyPersonalFilters = (carsToFilter: Car[], searchQuery: string, statusFilter: string | null) => {
    let filtered = [...carsToFilter];
    
    if (statusFilter) {
      filtered = filtered.filter(car => {
        if (statusFilter === 'Warning') {
          return parseFloat(car.kmPerLiter) < 10;
        }
        return car.status === statusFilter;
      });
    }
    
    if (searchQuery.trim()) {
      const searchTermLower = searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        String(car.plateNumber || '').toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredPersonalCars(filtered);
  };

  const applyOrganizationFilters = (carsToFilter: any[], searchQuery: string, typeFilter: string | null) => {
    let filtered = [...carsToFilter];
    
    if (typeFilter) {
      if (typeFilter === 'HighCapacity') {
        filtered = filtered.filter(car => parseFloat(car.loadCapacity) > 1000);
      } else {
        filtered = filtered.filter(car => car.carType === typeFilter);
      }
    }
    
    if (searchQuery.trim()) {
      const searchTermLower = searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        String(car.plateNumber || '').toLowerCase().includes(searchTermLower) ||
        String(car.driverName || '').toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredOrganizationCars(filtered);
  };

  const applyRentFilters = (carsToFilter: any[], searchQuery: string, statusFilter: string | null) => {
    let filtered = [...carsToFilter];
    
    if (statusFilter) {
      filtered = filtered.filter(car => car.vehiclesStatus === statusFilter || car.vehiclesType === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const searchTermLower = searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        String(car.plateNumber || '').toLowerCase().includes(searchTermLower) ||
        String(car.companyName || '').toLowerCase().includes(searchTermLower) ||
        String(car.vehiclesUserName || '').toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredRentCars(filtered);
  };

  // Search handlers
  const handlePersonalSearch = useCallback((query: string) => {
    setPersonalSearchTerm(query);
    applyPersonalFilters(personalCars, query, personalActiveFilter);
  }, [personalCars, personalActiveFilter]);

  const handleOrganizationSearch = useCallback((query: string) => {
    setOrganizationSearchTerm(query);
    applyOrganizationFilters(organizationCars, query, organizationActiveFilter);
  }, [organizationCars, organizationActiveFilter]);

  const handleRentSearch = useCallback((query: string) => {
    setRentSearchTerm(query);
    applyRentFilters(rentCars, query, rentActiveFilter);
  }, [rentCars, rentActiveFilter]);

  // Filter click handlers
  const handlePersonalStatusFilterClick = (status: string | null) => {
    setPersonalActiveFilter(status === personalActiveFilter ? null : status);
    applyPersonalFilters(personalCars, personalSearchTerm, status === personalActiveFilter ? null : status);
  };

  const handleOrganizationTypeFilterClick = (type: string | null) => {
    setOrganizationActiveFilter(type === organizationActiveFilter ? null : type);
    applyOrganizationFilters(organizationCars, organizationSearchTerm, type === organizationActiveFilter ? null : type);
  };

  const handleRentStatusFilterClick = (status: string | null) => {
    setRentActiveFilter(status === rentActiveFilter ? null : status);
    applyRentFilters(rentCars, rentSearchTerm, status === rentActiveFilter ? null : status);
  };

  // Form submission handlers
  const showSuccessAlert = (message: string) => {
    return Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Personal Cars CRUD
  const handleAddPersonalCar = async (newCar: Car) => {
    try {
      setIsPersonalSubmitting(true);
      const { success, message } = await createCar(newCar);
      
      if (success) {
        await showSuccessAlert(message || 'Car registered successfully');
        await loadPersonalCars();
        setIsPersonalFormOpen(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to register car',
        icon: 'error',
      });
    } finally {
      setIsPersonalSubmitting(false);
    }
  };

  const handleUpdatePersonalCar = async (updatedCar: Car) => {
    try {
      setIsPersonalSubmitting(true);
      const { success, message } = await updateCar(updatedCar.id, updatedCar);
      
      if (success) {
        await showSuccessAlert(message || 'Car updated successfully');
        await loadPersonalCars();
        setSelectedPersonalCar(null);
        setIsPersonalFormOpen(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to update car',
        icon: 'error',
      });
    } finally {
      setIsPersonalSubmitting(false);
    }
  };

  const handleDeletePersonalCar = async (id: number) => {
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
        const { success, message } = await deleteCar(id);
        
        if (success) {
          await showSuccessAlert(message || 'Vehicle deleted successfully');
          await loadPersonalCars();
        } else {
          throw new Error(message);
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error instanceof Error ? error.message : 'Failed to delete car',
          icon: 'error',
        });
      }
    }
  };

  // Organization Cars CRUD
  const handleAddOrganizationCar = async (newCar: any) => {
    try {
      setIsOrganizationSubmitting(true);
      const { success, message } = await createOrganizationCar(newCar);
      
      if (success) {
        await showSuccessAlert(message || 'Rented Vehicle registered successfully');
        await loadOrganizationCars();
        setIsOrganizationFormOpen(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to register rented vehicle',
        icon: 'error',
      });
    } finally {
      setIsOrganizationSubmitting(false);
    }
  };

  const handleUpdateOrganizationCar = async (updatedCar: any) => {
    try {
      setIsOrganizationSubmitting(true);
      const { success, message } = await updateOrganizationCar(updatedCar.id, updatedCar);
      
      if (success) {
        await showSuccessAlert(message || 'Rented Vehicle updated successfully');
        await loadOrganizationCars();
        setSelectedOrganizationCar(null);
        setIsOrganizationFormOpen(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to update rented car',
        icon: 'error',
      });
    } finally {
      setIsOrganizationSubmitting(false);
    }
  };

  const handleDeleteOrganizationCar = async (id: number) => {
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
        const { success, message } = await deleteOrganizationCar(id);
        
        if (success) {
          await showSuccessAlert(message || 'Rented vehicle deleted successfully');
          await loadOrganizationCars();
        } else {
          throw new Error(message);
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error instanceof Error ? error.message : 'Failed to delete rented vehicle',
          icon: 'error',
        });
      }
    }
  };

  // Rent Cars CRUD
  const handleAddRentCar = async (newCar: any) => {
    try {
      setIsRentSubmitting(true);
      const { success, message } = await createRentCar(newCar);
      
      if (success) {
        await showSuccessAlert(message || 'Organization Vehicle registered successfully');
        await loadRentCars();
        setIsRentFormOpen(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to register organization Vehicle',
        icon: 'error',
      });
    } finally {
      setIsRentSubmitting(false);
    }
  };

  const handleUpdateRentCar = async (updatedCar: any) => {
    try {
      setIsRentSubmitting(true);
      const { success, message } = await updateRentCar(updatedCar.id, updatedCar);
      
      if (success) {
        await showSuccessAlert(message || 'Organization Vehicle updated successfully');
        await loadRentCars();
        setSelectedRentCar(null);
        setIsRentFormOpen(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : 'Failed to update organization Vehicle',
        icon: 'error',
      });
    } finally {
      setIsRentSubmitting(false);
    }
  };

  const handleDeleteRentCar = async (id: number) => {
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
        const { success, message } = await deleteRentCar(id);
        
        if (success) {
          await showSuccessAlert(message || 'Organization Vehicle deleted successfully');
          await loadRentCars();
        } else {
          throw new Error(message);
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error instanceof Error ? error.message : 'Failed to delete organization Vehicle',
          icon: 'error',
        });
      }
    }
  };

  // View handlers
  const handleViewPersonalCar = (id: number) => {
    router.push(`/tms-modules/admin/car-management/manage-cars/view-car/${id}`);
  };

  const handleViewOrganizationCar = (id: number) => {
    router.push(`/tms-modules/admin/car-management/manage-cars/view-organization-car/${id}`);
  };

  const handleViewRentCar = (id: number) => {
    router.push(`/tms-modules/admin/car-management/manage-cars/view-rent-car/${id}`);
  };

  // Load data on mount
  useEffect(() => {
    loadPersonalCars();
    loadOrganizationCars();
    loadRentCars();
  }, []);

  // Apply filters when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      applyPersonalFilters(personalCars, personalSearchTerm, personalActiveFilter);
      applyOrganizationFilters(organizationCars, organizationSearchTerm, organizationActiveFilter);
      applyRentFilters(rentCars, rentSearchTerm, rentActiveFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [personalSearchTerm, personalCars, personalActiveFilter, 
      organizationSearchTerm, organizationCars, organizationActiveFilter,
      rentSearchTerm, rentCars, rentActiveFilter]);

  return (
    <div className="p-6 space-y-6 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <h1 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Vehicle Fleet Management
        </h1>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'personal' ? 'Search by license plate...' : 
                activeTab === 'organization' ? 'Search by plate or driver...' : 
                'Search by plate or company...'
              }
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={
                activeTab === 'personal' ? personalSearchTerm : 
                activeTab === 'organization' ? organizationSearchTerm : 
                rentSearchTerm
              }
              onChange={(e) => {
                if (activeTab === 'personal') handlePersonalSearch(e.target.value);
                else if (activeTab === 'organization') handleOrganizationSearch(e.target.value);
                else handleRentSearch(e.target.value);
              }}
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
            onClick={() => {
              if (activeTab === 'personal') loadPersonalCars();
              else if (activeTab === 'organization') loadOrganizationCars();
              else loadRentCars();
            }}
          >
            <FiRefreshCw className="text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex border-b border-gray-200"
      >
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'personal'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('personal')}
        >
        Personal Vehicles {/* Corrected Label */}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'organization'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('organization')}
        >
        Organization Vehicles {/* Corrected Label */}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm focus:outline-none ${
            activeTab === 'rented'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('rented')}
        >
        Rented Vehicles {/* Corrected Label */}
        </button>
      </motion.div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Personal Cars Tab */}
        {activeTab === 'personal' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Stats 
                cars={personalCars} 
                onFilterClick={handlePersonalStatusFilterClick} 
                activeFilter={personalActiveFilter}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Personal Vehicle Fleet</h2> {/* Corrected Title */}
              <motion.button
                  whileHover={{ scale: 1.05, background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedPersonalCar(null);
                    setIsPersonalFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all"
                >
              <FiPlus /> Add New Vehicle
              </motion.button>
              </div>

              {isPersonalLoading ? (
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
                  <div className="max-h-[420px] overflow-y-auto scroll-smooth">
                    <table className="w-full divide-y divide-gray-200 table-fixed">
                      <CarTable 
                        cars={filteredPersonalCars} 
                        onEdit={(car) => {
                          setSelectedPersonalCar(car);
                          setIsPersonalFormOpen(true);
                        }} 
                        onDelete={handleDeletePersonalCar}
                        onView={handleViewPersonalCar}
                      />
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

        {/* Organization Cars Tab */}
        {activeTab === 'organization' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <OrganizationCarStats 
                cars={organizationCars} 
                onFilterClick={handleOrganizationTypeFilterClick} 
                activeFilter={organizationActiveFilter}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Organization Vehicle Fleet</h2> {/* Corrected Title */}
              <motion.button
                  whileHover={{ scale: 1.05, background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedOrganizationCar(null);
                    setIsOrganizationFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all"
                >
                  <FiPlus /> Add New Vehicle
                </motion.button>
              </div>

              {isOrganizationLoading ? (
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
                  <div className="max-h-[420px] overflow-y-auto scroll-smooth">
                    <table className="w-full divide-y divide-gray-200 table-fixed">
                      <OrganizationCarTable 
                        cars={filteredOrganizationCars} 
                        onEdit={(car) => {
                          setSelectedOrganizationCar(car);
                          setIsOrganizationFormOpen(true);
                        }} 
                        onDelete={handleDeleteOrganizationCar}
                        onView={handleViewOrganizationCar}
                      />
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}

        {/* Rented Cars Tab */}
        {activeTab === 'rented' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <RentCarStats 
                cars={rentCars} 
                onFilterClick={handleRentStatusFilterClick} 
                activeFilter={rentActiveFilter}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Rented Vehicle Fleet</h2> {/* Corrected Title */}
              <motion.button
                  whileHover={{ scale: 1.05, background: "linear-gradient(to right, #4f46e5, #7c3aed)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedRentCar(null);
                    setIsRentFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all"
                >
                  <FiPlus /> Add New Vehicle
                </motion.button>
              </div>

              {isRentLoading ? (
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
                  <div className="max-h-[420px] overflow-y-auto scroll-smooth">
                    <table className="w-full divide-y divide-gray-200 table-fixed">
                      <RentCarTable 
                        cars={filteredRentCars} 
                        onEdit={(car) => {
                          setSelectedRentCar(car);
                          setIsRentFormOpen(true);
                        }} 
                        onDelete={handleDeleteRentCar}
                        onView={handleViewRentCar}
                      />
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Forms */}
      <AnimatePresence>
        {/* Personal Car Form */}
        {(isPersonalFormOpen || selectedPersonalCar) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: 'spring' }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <CarForm
                car={selectedPersonalCar}
                isSubmitting={isPersonalSubmitting}
                onClose={() => {
                  setIsPersonalFormOpen(false);
                  setSelectedPersonalCar(null);
                }}
                onSubmit={selectedPersonalCar ? handleUpdatePersonalCar : handleAddPersonalCar}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Organization Car Form */}
        {(isOrganizationFormOpen || selectedOrganizationCar) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: 'spring' }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4"
            >
              <OrganizationCarForm
                car={selectedOrganizationCar}
                isSubmitting={isOrganizationSubmitting}
                onClose={() => {
                  setIsOrganizationFormOpen(false);
                  setSelectedOrganizationCar(null);
                }}
                onSubmit={selectedOrganizationCar ? handleUpdateOrganizationCar : handleAddOrganizationCar}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Rent Car Form */}
        {(isRentFormOpen || selectedRentCar) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: 'spring' }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <RentCarForm
                car={selectedRentCar}
                isSubmitting={isRentSubmitting}
                onClose={() => {
                  setIsRentFormOpen(false);
                  setSelectedRentCar(null);
                }}
                onSubmit={selectedRentCar ? handleUpdateRentCar : handleAddRentCar}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}