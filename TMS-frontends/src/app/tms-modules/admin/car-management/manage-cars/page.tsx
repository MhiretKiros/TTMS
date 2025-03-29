"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import CarTable from './components/CarTable';
import CarForm from './components/CarForm';
import Stats from './components/Stats';
import { fetchCars, createCar, updateCar, deleteCar } from './api/carServices';
import { Car } from './types';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

export default function ManageCars() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Load cars on component mount
  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setIsLoading(true);
      const { success, data, message } = await fetchCars();
      if (success) {
        setCars(data);
        applyFilters(data, searchTerm, activeFilter);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      showError('Failed to load cars', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showError = (defaultMessage: string, error: unknown) => {
    Swal.fire({
      title: 'Error!',
      text: error instanceof Error ? error.message : defaultMessage,
      icon: 'error',
      showClass: { 
        popup: 'animate__animated animate__headShake animate__faster' 
      }
    });
  };

  const showSuccess = (message: string) => {
    return Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      showClass: { 
        popup: 'animate__animated animate__bounceIn animate__faster' 
      },
      hideClass: { 
        popup: 'animate__animated animate__fadeOutUp animate__faster' 
      }
    });
  };

  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
    applyFilters(cars, query, activeFilter);
  }, [cars, activeFilter]);

  const applyFilters = (carsToFilter: Car[], searchQuery: string, statusFilter: string | null) => {
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
    
    setFilteredCars(filtered);
  };

  const handleStatusFilterClick = (status: string | null) => {
    setActiveFilter(status === activeFilter ? null : status);
    applyFilters(cars, searchTerm, status === activeFilter ? null : status);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters(cars, searchTerm, activeFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, cars, activeFilter]);

  const handleAddCar = async (newCar: Car) => {
    try {
      setIsSubmitting(true);
      const { success } = await createCar(newCar);
      if (success) {
        await showSuccess('Car registered successfully');
        await loadCars();
        setIsFormOpen(false);
      }
    } catch (error) {
      showError('Failed to register car', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCar = async (updatedCar: Car) => {
    try {
      setIsSubmitting(true);
      const { success } = await updateCar(updatedCar.id, updatedCar);
      if (success) {
        await showSuccess('Car updated successfully');
        await loadCars();
        setSelectedCar(null);
        setIsFormOpen(false);
      }
    } catch (error) {
      showError('Failed to update car', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCar = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      showClass: { 
        popup: 'animate__animated animate__fadeInDown animate__faster' 
      },
      hideClass: { 
        popup: 'animate__animated animate__fadeOutUp animate__faster' 
      }
    });

    if (result.isConfirmed) {
      try {
        const { success } = await deleteCar(id);
        if (success) {
          await showSuccess('Car has been deleted');
          await loadCars();
        }
      } catch (error) {
        showError('Failed to delete car', error);
      }
    }
  };

  const handleViewCar = (id: number) => {
    router.push(`/tms-modules/admin/car-management/manage-cars/view-car/${id}`);
  };

  return (
    <div className="p-6 space-y-6 overflow-x-hidden">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <h1 className="text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Car Fleet Management
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by license plate..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            onClick={loadCars}
          >
            <FiRefreshCw className="text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Stats 
          cars={cars} 
          onFilterClick={handleStatusFilterClick} 
          activeFilter={activeFilter}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg"
      >
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Car Fleet</h2>
          <motion.button
            whileHover={{ 
              scale: 1.05,
              background: "linear-gradient(to right, #4f46e5, #7c3aed)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedCar(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all"
          >
            <FiPlus /> Register New Car
          </motion.button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"
            />
          </div>
        ) : (
          /* Table Container */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full overflow-hidden"
          >
            <div className="max-h-[420px] overflow-y-auto scroll-smooth">
              <table className="w-full divide-y divide-gray-200 table-fixed">
                <CarTable 
                  cars={filteredCars} 
                  onEdit={(car) => {
                    setSelectedCar(car);
                    setIsFormOpen(true);
                  }} 
                  onDelete={handleDeleteCar}
                  onView={handleViewCar}
                />
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Car Form Modal */}
      <AnimatePresence>
        {(isFormOpen || selectedCar) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              type: 'spring',
              damping: 20,
              stiffness: 300
            }}
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
                car={selectedCar}
                isSubmitting={isSubmitting}
                onClose={() => {
                  setIsFormOpen(false);
                  setSelectedCar(null);
                }}
                onSubmit={selectedCar ? handleUpdateCar : handleAddCar}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}