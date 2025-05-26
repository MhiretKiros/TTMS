"use client";
import { motion } from 'framer-motion';
import { FiActivity, FiTruck, FiUsers, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

interface OrganizationCarStatsProps {
  cars: any[];
  onFilterClick: (type: string | null) => void;
  activeFilter: string | null;
}

const OrganizationCarStats = ({ cars, onFilterClick, activeFilter }: OrganizationCarStatsProps) => {
  const totalCars = cars.length;
  const readyVehiclesCount = cars.filter(car => car.status === 'InspectedAndReady').length;
  const rejectedVehiclesCount = cars.filter(car => car.status === 'Rejected').length;
  const maintenanceVehiclesCount = cars.filter(car => car.status === 'Maintenance').length;
  const minibusesCount = cars.filter(car => car.carType === 'Minibus').length;
  const trucksCount = cars.filter(car => car.carType === 'Truck').length;

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
      title: 'Ready Vehicles',
      value: readyVehiclesCount,
      icon: <FiCheckCircle className="h-6 w-6" />,
      filterKey: 'InspectedAndReady',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rejected Vehicles',
      value: rejectedVehiclesCount,
      icon: <FiXCircle className="h-6 w-6" />,
      filterKey: 'Rejected',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'In Maintenance',
      value: maintenanceVehiclesCount,
      icon: <FiClock className="h-6 w-6" />,
      filterKey: 'Maintenance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Minibuses',
      value: minibusesCount,
      icon: <FiUsers className="h-6 w-6" />, // Changed icon for Minibuses
      filterKey: 'Minibus',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Trucks',
      value: trucksCount,
      icon: <FiTruck className="h-6 w-6" />,
      filterKey: 'Truck',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6" // Adjusted grid for 6 items
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