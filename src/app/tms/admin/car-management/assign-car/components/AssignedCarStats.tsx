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
      title: 'All Assignments',
      value: totalAssignments,
      icon: <FiActivity className="h-5 w-5" />,
      filterKey: null,
      color: 'text-[#3c8dbc]',
      bgColor: 'bg-gradient-to-br from-blue-50 to-white',
      borderColor: 'border-blue-100',
      percentage: `${totalAssignments} total`
    },
    {
      title: 'Approved',
      value: approved,
      icon: <FiCheckCircle className="h-5 w-5" />,
      filterKey: 'Approved',
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-white',
      borderColor: 'border-emerald-100',
      percentage: totalAssignments > 0 ? `${Math.round((approved / totalAssignments) * 100)}%` : '0%'
    },
    {
      title: 'Assigned',
      value: assigned,
      icon: <FiClock className="h-5 w-5" />,
      filterKey: 'Assigned',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-white',
      borderColor: 'border-purple-100',
      percentage: totalAssignments > 0 ? `${Math.round((assigned / totalAssignments) * 100)}%` : '0%'
    },
    {
      title: 'Pending',
      value: pending,
      icon: <FiAlertCircle className="h-5 w-5" />,
      filterKey: 'Pending',
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-white',
      borderColor: 'border-amber-100',
      percentage: totalAssignments > 0 ? `${Math.round((pending / totalAssignments) * 100)}%` : '0%'
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
      bgColor: 'bg-gradient-to-br from-indigo-50 to-white',
      borderColor: 'border-indigo-100',
      percentage: totalAssignments > 0 ? `${Math.round((level1 / totalAssignments) * 100)}%` : '0%'
    },
    {
      title: 'Director',
      value: level2,
      icon: <FiUser className="h-5 w-5" />,
      filterKey: 'level2',
      color: 'text-teal-600',
      bgColor: 'bg-gradient-to-br from-teal-50 to-white',
      borderColor: 'border-teal-100',
      percentage: totalAssignments > 0 ? `${Math.round((level2 / totalAssignments) * 100)}%` : '0%'
    },
    {
      title: 'Sub Director',
      value: level3,
      icon: <FiStar className="h-5 w-5" />,
      filterKey: 'level3',
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-white',
      borderColor: 'border-orange-100',
      percentage: totalAssignments > 0 ? `${Math.round((level3 / totalAssignments) * 100)}%` : '0%'
    },
    {
      title: 'Division',
      value: level4,
      icon: <FiUsers className="h-5 w-5" />,
      filterKey: 'level4',
      color: 'text-rose-600',
      bgColor: 'bg-gradient-to-br from-rose-50 to-white',
      borderColor: 'border-rose-100',
      percentage: totalAssignments > 0 ? `${Math.round((level4 / totalAssignments) * 100)}%` : '0%'
    },
    {
      title: 'Experts',
      value: level5,
      icon: <FiAward className="h-5 w-5" />,
      filterKey: 'level5',
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-white',
      borderColor: 'border-amber-100',
      percentage: totalAssignments > 0 ? `${Math.round((level5 / totalAssignments) * 100)}%` : '0%'
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
    <div className="space-y-6">
      {/* Status Filters Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Status</h3>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
              whileHover={{ 
                y: -2,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                borderColor: stat.color.replace('text-', 'border-')
              }}
              className={`
                relative rounded-xl p-5 cursor-pointer transition-all duration-300
                border ${stat.borderColor} ${stat.bgColor}
                ${activeStatusFilter === stat.filterKey ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                hover:border-opacity-50
              `}
              onClick={() => handleStatusFilterClick(stat.filterKey)}
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
                  {stat.filterKey && totalAssignments > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(Number(stat.value) / totalAssignments) * 100}%` 
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
      </div>

      {/* Position Level Filters Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Position Levels</h3>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {levelStats.map((stat, index) => (
            <motion.div
              key={`level-${index}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ 
                y: -2,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                borderColor: stat.color.replace('text-', 'border-')
              }}
              className={`
                relative rounded-xl p-5 cursor-pointer transition-all duration-300
                border ${stat.borderColor} ${stat.bgColor}
                ${activeLevelFilter === stat.filterKey ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                hover:border-opacity-50
              `}
              onClick={() => handleLevelFilterClick(stat.filterKey)}
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
                  {totalAssignments > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(Number(stat.value) / totalAssignments) * 100}%` 
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
      </div>

      {/* Active Filters Indicator */}
      {(activeStatusFilter || activeLevelFilter) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl flex items-center justify-between"
        >
          <div className="text-sm text-gray-700">
            <span className="font-medium">Active filter: </span>
            <span className="font-semibold text-[#3c8dbc]">
              {activeStatusFilter 
                ? statusStats.find(s => s.filterKey === activeStatusFilter)?.title 
                : levelStats.find(l => l.filterKey === activeLevelFilter)?.title}
            </span>
          </div>
          <button
            onClick={() => {
              onStatusFilter(null);
              onLevelFilter(null);
            }}
            className="text-sm text-[#3c8dbc] font-medium hover:underline px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default AssignedCarStats;