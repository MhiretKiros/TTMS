"use client";
import { motion } from 'framer-motion';
import { Car } from '../types';

interface CarSpecsProps {
  car: Car;
  className?: string;
}

const CarSpecs = ({ car, className = '' }: CarSpecsProps) => {
  const specs = [
    { 
      label: 'Motor Capacity', 
      value: `${car.motorCapacity} cc`,
      icon: '⚙️'
    },
    { 
      label: 'Total KM', 
      value: `${car.totalKm} km`,
      icon: '🛣️'
    },
    { 
      label: 'Fuel Type', 
      value: car.fuelType,
      icon: '⛽'
    },
    { 
      label: 'KM per Liter', 
      value: `${car.kmPerLiter} km/l`,
      icon: '📊'
    },
    { 
      label: 'Manufacture Year', 
      value: car.manufactureYear,
      icon: '📅'
    },
    { 
      label: 'Car Type', 
      value: car.carType,
      icon: '🚗'
    },
    {
      label: 'Parking Location',
      value: car.parkingLocation,
      icon: '📍'
    },
    {
      label: 'Status',
      value: car.status,
      icon: '🟢',
      statusColor: car.status === 'Active' ? 'text-green-500' : 
                  car.status === 'Maintenance' ? 'text-yellow-500' : 
                  'text-red-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    },
    hover: {
      scale: 1.02,
      backgroundColor: 'rgba(249, 250, 251, 1)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className={`space-y-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {specs.map((spec, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover="hover"
          className="flex items-center justify-between py-3 px-2 border-b border-gray-200 last:border-0 rounded-lg"
        >
          <div className="flex items-center">
            <span className="mr-3 text-lg">{spec.icon}</span>
            <span className="text-gray-600 font-medium">{spec.label}</span>
          </div>
          <span className={`font-medium ${spec.statusColor || ''}`}>
            {spec.value}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CarSpecs;