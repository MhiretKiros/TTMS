"use client";
import { motion } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';

interface RentCarStatsProps {
  cars: any[];
  onFilterClick: (status: string | null) => void;
  activeFilter: string | null;
}

const RentCarStats = ({ cars, onFilterClick, activeFilter }: RentCarStatsProps) => {
  // Calculate statistics
  const totalCars = cars.length;
  const activeCars = cars.filter(car => car.status === 'NOT_INSPECTED').length;
  const maintenanceCars = cars.filter(car => car.status === 'Maintenance').length;
  const commercialCars = cars.filter(car => car.vehiclesType === 'Commercial').length;

  const stats = [
    {
      title: 'Total Rented',
      value: totalCars,
      icon: <FiActivity className="h-6 w-6" />,
      filterKey: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active',
      value: activeCars,
      icon: <FiCheckCircle className="h-6 w-6" />,
      filterKey: 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'In Maintenance',
      value: maintenanceCars,
      icon: <FiClock className="h-6 w-6" />,
      filterKey: 'Maintenance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Commercial',
      value: commercialCars,
      icon: <FiAlertTriangle className="h-6 w-6" />,
      filterKey: 'Commercial',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
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

export default RentCarStats;