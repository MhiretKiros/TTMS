// components/Stats.tsx
"use client";
import { motion } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { Car } from '../types';

interface StatsProps {
  cars: Car[];
  onFilterClick: (status: string | null) => void;
  activeFilter: string | null;
}

const Stats = ({ cars, onFilterClick, activeFilter }: StatsProps) => {
  // Calculate statistics
  const totalCars = cars.length;
  // Correctly count cars that are ready for service
  const readyCarsCount = cars.filter(car => car.status === 'InspectedAndReady').length;
  // Count cars in maintenance
  const maintenanceCarsCount = cars.filter(car => car.status === 'Maintenance').length;
  // Count cars that are inactive
  const inactiveCarsCount = cars.filter(car => car.status === 'Pending').length;
  // Count cars with low efficiency (kmPerLiter < 10)
  // Ensure kmPerLiter is treated as a number for comparison
  const lowEfficiencyCarsCount = cars.filter(car => car.kmPerLiter < 10).length;

  const stats = [
    {
      title: 'All Cars',
      value: totalCars,
      icon: <FiActivity className="h-6 w-6" />,
      filterKey: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Ready Cars', // Changed title
      value: readyCarsCount, // Updated value calculation
      icon: <FiCheckCircle className="h-6 w-6" />,
      filterKey: 'InspectedAndReady',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rejected Cars', // Changed title
      value: inactiveCarsCount, // Value calculation for low efficiency
      icon: <FiAlertTriangle className="h-6 w-6" />,
      filterKey: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'In Maintenance',
      value: maintenanceCarsCount, // Value calculation for maintenance
      icon: <FiClock className="h-6 w-6" />,
      filterKey: 'Maintenance',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
            activeFilter === stat.filterKey ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onFilterClick(stat.filterKey)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Stats;