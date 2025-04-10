"use client";
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
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

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
    } catch (error) {
      // Error is handled in parent component
    }
  };

  return (
    <div className="overflow-x-auto">
        <motion.table
      className="overflow-x-auto"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engine</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {cars.map((car) => (
            <motion.tr 
              key={car.id}
              variants={rowVariants}
              whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{car.plateNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.ownerName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.ownerPhone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.carType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.manufactureYear}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.motorCapacity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.kmPerLiter} km/L</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.totalKm} km</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.fuelType}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${car.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    car.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {car.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(car.registeredDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.parkingLocation}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onView(car.id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                    title="View details"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => onEdit(car)}
                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                    title="Edit"
                  >
                    <FiEdit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                    title="Delete"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
        </motion.table>
      </div>
  );
};

export default CarTable;