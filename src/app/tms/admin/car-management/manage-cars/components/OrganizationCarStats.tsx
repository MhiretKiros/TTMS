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
      title: 'Total Fleet',
      value: totalCars,
      icon: <FiActivity className="h-5 w-5" />,
      filterKey: null,
      color: 'text-[#3c8dbc]',
      bgColor: 'bg-gradient-to-br from-blue-50 to-white',
      borderColor: 'border-blue-100',
      percentage: `${totalCars} vehicles`
    },
    {
      title: 'Ready Vehicles',
      value: readyVehiclesCount,
      icon: <FiCheckCircle className="h-5 w-5" />,
      filterKey: 'InspectedAndReady',
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-white',
      borderColor: 'border-emerald-100',
      percentage: totalCars > 0 ? `${Math.round((readyVehiclesCount / totalCars) * 100)}% ready` : '0%'
    },
    {
      title: 'Rejected',
      value: rejectedVehiclesCount,
      icon: <FiXCircle className="h-5 w-5" />,
      filterKey: 'Rejected',
      color: 'text-rose-600',
      bgColor: 'bg-gradient-to-br from-rose-50 to-white',
      borderColor: 'border-rose-100',
      percentage: totalCars > 0 ? `${Math.round((rejectedVehiclesCount / totalCars) * 100)}% rejected` : '0%'
    },
    {
      title: 'Maintenance',
      value: maintenanceVehiclesCount,
      icon: <FiClock className="h-5 w-5" />,
      filterKey: 'Maintenance',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-white',
      borderColor: 'border-blue-100',
      percentage: totalCars > 0 ? `${Math.round((maintenanceVehiclesCount / totalCars) * 100)}% in maintenance` : '0%'
    },
    {
      title: 'Minibuses',
      value: minibusesCount,
      icon: <FiUsers className="h-5 w-5" />,
      filterKey: 'Minibus',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-white',
      borderColor: 'border-purple-100',
      percentage: totalCars > 0 ? `${Math.round((minibusesCount / totalCars) * 100)}% minibuses` : '0%'
    },
    {
      title: 'Trucks',
      value: trucksCount,
      icon: <FiTruck className="h-5 w-5" />,
      filterKey: 'Truck',
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-white',
      borderColor: 'border-amber-100',
      percentage: totalCars > 0 ? `${Math.round((trucksCount / totalCars) * 100)}% trucks` : '0%'
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
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
          whileHover={{ 
            y: -2,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            borderColor: stat.color.replace('text-', 'border-')
          }}
          className={`
            relative rounded-xl p-5 cursor-pointer transition-all duration-300
            border ${stat.borderColor} ${stat.bgColor}
            ${activeFilter === stat.filterKey ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
            hover:border-opacity-50
          `}
          onClick={() => onFilterClick(stat.filterKey)}
        >
          {/* Subtle corner accent */}
          <div className={`absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-xl`}>
            <div className={`absolute top-0 right-0 w-6 h-6 ${stat.color.replace('text-', 'bg-')} opacity-10`} />
          </div>
          
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-')} bg-opacity-10`}>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500">{stat.percentage}</p>
              </div>
              
              {/* Progress indicator */}
              {stat.filterKey && totalCars > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(Number(stat.value) / totalCars) * 100}%` 
                      }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-1.5 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default OrganizationCarStats;