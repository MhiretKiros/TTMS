"use client";
import { motion } from 'framer-motion';
import { FiActivity, FiTruck, FiUser, FiPackage } from 'react-icons/fi';

interface OrganizationCarStatsProps {
  cars: any[];
  onFilterClick: (type: string | null) => void;
  activeFilter: string | null;
}

const OrganizationCarStats = ({ cars, onFilterClick, activeFilter }: OrganizationCarStatsProps) => {
  const totalCars = cars.length;
  const minibuses = cars.filter(car => car.carType === 'Minibus').length;
  const trucks = cars.filter(car => car.carType === 'Truck').length;
  const highCapacity = cars.filter(car => parseFloat(car.loadCapacity) > 1000).length;
  const activeCars = cars.filter(car => car.status === 'Active').length;

  const stats = [
    {
      title: 'Total Vehicles',
      value: totalCars,
      icon: <FiActivity className="h-6 w-6" />,
      filterKey: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active',
      value: activeCars,
      icon: <FiActivity className="h-6 w-6" />,
      filterKey: 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Minibuses',
      value: minibuses,
      icon: <FiUser className="h-6 w-6" />,
      filterKey: 'Minibus',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Trucks',
      value: trucks,
      icon: <FiTruck className="h-6 w-6" />,
      filterKey: 'Truck',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'High Capacity',
      value: highCapacity,
      icon: <FiPackage className="h-6 w-6" />,
      filterKey: 'HighCapacity',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`rounded-lg p-4 cursor-pointer transition-all ${
            activeFilter === stat.filterKey ? 'ring-2 ring-blue-500' : 'bg-white'
          } shadow-sm`}
          onClick={() => onFilterClick(stat.filterKey)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
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

export default OrganizationCarStats;