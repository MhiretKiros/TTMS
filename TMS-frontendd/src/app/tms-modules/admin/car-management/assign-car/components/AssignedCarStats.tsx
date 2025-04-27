"use client";
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiUser, FiStar, FiAward, FiActivity } from 'react-icons/fi';

interface AssignedCarStatsProps {
  assignments: any[];
  onFilterClick: (level: string | null) => void;
  activeFilter: string | null;
}

const AssignedCarStats = ({ assignments, onFilterClick, activeFilter }: AssignedCarStatsProps) => {
  // Normalize position values for comparison
  const normalizePosition = (position: string) => 
    position.toLowerCase().replace(/\s/g, '');

  const totalAssignments = assignments.length;
  const level1 = assignments.filter(a => 
    normalizePosition(a.position) === 'level1').length;
  const level2 = assignments.filter(a => 
    normalizePosition(a.position) === 'level2').length;
  const level3 = assignments.filter(a => 
    normalizePosition(a.position) === 'level3').length;
  const level4 = assignments.filter(a => 
    normalizePosition(a.position) === 'level4').length;
  const level5 = assignments.filter(a => 
    normalizePosition(a.position) === 'level5').length;

  // Map filter keys to normalized values
  const stats = [
    {
      title: 'Total Assignments',
      value: totalAssignments,
      icon: <FiActivity className="h-6 w-6" />,
      filterKey: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Directorate',
      value: level1,
      icon: <FiBriefcase className="h-6 w-6" />,
      filterKey: 'level1',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Director',
      value: level2,
      icon: <FiUser className="h-6 w-6" />,
      filterKey: 'level2',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Sub Director',
      value: level3,
      icon: <FiStar className="h-6 w-6" />,
      filterKey: 'level3',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Division',
      value: level4,
      icon: <FiUsers className="h-6 w-6" />,
      filterKey: 'level4',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Experts',
      value: level5,
      icon: <FiAward className="h-6 w-6" />,
      filterKey: 'level5',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6"
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

export default AssignedCarStats;