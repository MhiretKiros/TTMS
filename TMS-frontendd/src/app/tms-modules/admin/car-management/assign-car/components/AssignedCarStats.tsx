"use client";
import { motion } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiClock, FiAlertCircle, FiBriefcase, FiUser, FiStar, FiUsers, FiAward } from 'react-icons/fi';

interface AssignedCarStatsProps {
  assignments: any[];
  onStatusFilter: (status: string | null) => void;
  onLevelFilter: (level: string | null) => void;
  activeStatusFilter: string | null;
  activeLevelFilter: string | null;
}

const AssignedCarStats = ({ 
  assignments, 
  onStatusFilter, 
  onLevelFilter,
  activeStatusFilter,
  activeLevelFilter 
}: AssignedCarStatsProps) => {
  // Helper function to normalize position values
  const normalizePosition = (position: string) => 
    position ? position.toLowerCase().replace(/\s/g, '') : '';

  // Status statistics
  const totalAssignments = assignments.length;
  const approved = assignments.filter(a => a.status === 'Approved').length;
  const assigned = assignments.filter(a => a.status === 'Assigned').length;
  const pending = assignments.filter(a => a.status === 'Pending').length;

  // Position level statistics
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

  // Status filter options
  const statusStats = [
    {
      title: 'All',
      value: totalAssignments,
      icon: <FiActivity className="h-5 w-5" />,
      filterKey: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Approved',
      value: approved,
      icon: <FiCheckCircle className="h-5 w-5" />,
      filterKey: 'Approved',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Assigned',
      value: assigned,
      icon: <FiClock className="h-5 w-5" />,
      filterKey: 'Assigned',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending',
      value: pending,
      icon: <FiAlertCircle className="h-5 w-5" />,
      filterKey: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
  ];

  // Position level filter options
  const levelStats = [
    {
      title: 'Directorate',
      value: level1,
      icon: <FiBriefcase className="h-5 w-5" />,
      filterKey: 'level1',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Director',
      value: level2,
      icon: <FiUser className="h-5 w-5" />,
      filterKey: 'level2',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Sub Director',
      value: level3,
      icon: <FiStar className="h-5 w-5" />,
      filterKey: 'level3',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Division',
      value: level4,
      icon: <FiUsers className="h-5 w-5" />,
      filterKey: 'level4',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Experts',
      value: level5,
      icon: <FiAward className="h-5 w-5" />,
      filterKey: 'level5',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
  ];

  const handleStatusFilterClick = (filterKey: string | null) => {
    if (typeof onStatusFilter === 'function') {
      // Reset level filter when changing status filter
      onLevelFilter(null);
      // Toggle status filter
      onStatusFilter(filterKey === activeStatusFilter ? null : filterKey);
    }
  };

  const handleLevelFilterClick = (filterKey: string | null) => {
    if (typeof onLevelFilter === 'function') {
      // Reset status filter when changing level filter
      onStatusFilter(null);
      // Toggle level filter
      onLevelFilter(filterKey === activeLevelFilter ? null : filterKey);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filters */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {statusStats.map((stat, index) => (
          <motion.div
            key={`status-${index}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
              activeStatusFilter === stat.filterKey 
                ? 'ring-2 ring-blue-500 bg-white shadow-md' 
                : 'bg-white shadow-sm'
            }`}
            onClick={() => handleStatusFilterClick(stat.filterKey)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-1 sm:p-2 rounded-full ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Position Level Filters */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">Filter by Position Level</h3>
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {levelStats.map((stat, index) => (
            <motion.div
              key={`level-${index}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-lg p-2 sm:p-3 cursor-pointer transition-all ${
                activeLevelFilter === stat.filterKey 
                  ? 'ring-2 ring-blue-500 bg-white shadow-md' 
                  : 'bg-white shadow-sm'
              }`}
              onClick={() => handleLevelFilterClick(stat.filterKey)}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className={`p-1 sm:p-2 rounded-full ${stat.bgColor} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.value} assignments</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AssignedCarStats;