"use client";
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiEye, FiActivity } from 'react-icons/fi';
import { Car } from '../types';

const CarTable = ({ cars, onEdit, onDelete, onView }: {
  cars: Car[];
  onEdit: (car: Car) => void;
  onDelete: (id: number) => Promise<void>;
  onView: (id: number) => void;
}) => {
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
      case 'InspectedAndReady':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'NOT_INSPECTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'Petrol':
        return '⛽';
      case 'Diesel':
        return '⛽';
      case 'Electric':
        return '🔋';
      case 'Hybrid':
        return '⚡';
      default:
        return '⛽';
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
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
              {['Plate', 'Owner', 'Phone', 'Model', 'Type', 'Year', 'Engine', 'Efficiency', 'Mileage', 'Fuel', 'Status', 'Registered', 'Location', 'Actions'].map((header, index) => (
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
            {cars.map((car, index) => (
              <motion.tr 
                key={car.id}
                variants={rowVariants}
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: 'rgba(60, 141, 188, 0.03)',
                  boxShadow: '0 4px 12px rgba(60, 141, 188, 0.1)'
                }}
                className="transition-all duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#3c8dbc] to-blue-400 rounded-lg flex items-center justify-center">
                      <FiActivity className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{car.plateNumber}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{car.ownerName}</div>
                  <div className="text-xs text-gray-500">{car.ownerEmail || 'No email'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {car.ownerPhone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                    {car.model}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className="text-gray-900">{car.carType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {car.manufactureYear}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="mr-2">⚙️</span>
                    {car.motorCapacity}cc
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(car.kmPerLiter * 5, 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="absolute h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                      />
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {car.kmPerLiter} km/L
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="mr-2">🛣️</span>
                    {car.totalKm.toLocaleString()} km
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <span className="mr-1">{getFuelIcon(car.fuelType)}</span>
                    {car.fuelType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(car.status)}`}
                  >
                    {car.status.replace(/([A-Z])/g, ' $1').trim()}
                  </motion.span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(car.registeredDate).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="mr-1">📍</span>
                    {car.parkingLocation || 'Not specified'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onView(car.id)}
                      className="p-2 rounded-lg text-[#3c8dbc] hover:bg-blue-50 transition-colors"
                      title="View details"
                    >
                      <FiEye className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(car)}
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                      title="Edit"
                    >
                      <FiEdit className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(car.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {cars.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#3c8dbc] to-blue-400 mb-4">
            <FiActivity className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CarTable;