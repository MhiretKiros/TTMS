"use client";
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiEye, FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { AssignmentHistory } from '../types';

const AssignedCarTable = ({ 
  assignments, 
  onEdit, 
  onDelete, 
  onView,
  activeFilter,
  onFilterClick 
}: {
  assignments: AssignmentHistory[];
  onEdit: (assignment: AssignmentHistory) => void;
  onDelete: (id: number) => Promise<void>;
  onView: (id: number) => void;
  activeFilter: string | null;
  onFilterClick: (status: string | null) => void;
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

  const statusIcons = {
    Active: <FiActivity className="w-4 h-4 mr-2" />,
    Completed: <FiCheckCircle className="w-4 h-4 mr-2" />,
    Upcoming: <FiClock className="w-4 h-4 mr-2" />
  };

  const positionMap: { [key: string]: string } = {
    level1: 'Directorate',
    level2: 'Director',
    level3: 'Sub Director',
    level4: 'Division',
    level5: 'Experts'
  };

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
    } catch (error) {
      // Error handled in parent component
    }
  };

  // Calculate height for 6 rows (approx 48px per row) + header
  const tableHeight = 8 * 48 + 48; // 6 rows + header

  return (
    <div className="overflow-x-auto overflow-y-auto" style={{ height: `${tableHeight}px` }}>
      <motion.table
        className="min-w-full divide-y divide-gray-200"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request Letter No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requester
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rental Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned Vehicle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button 
                onClick={() => onFilterClick('status')}
                className={`hover:text-gray-700 flex items-center ${
                  activeFilter ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <FiActivity className="w-4 h-4 mr-1" />
                Status
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {assignments.map((assignment) => (
            <motion.tr 
              key={assignment.id}
              variants={rowVariants}
              whileHover={{ scale: 1.01, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {assignment.requestLetterNo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assignment.requesterName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {positionMap[assignment.position] || assignment.position}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assignment.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {assignment.rentalType}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assignment.car?.plateNumber || assignment.rentCar?.plateNumber || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {statusIcons[assignment.status]}
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${assignment.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      assignment.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {assignment.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(assignment.assignedDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onView(assignment.id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                    title="View details"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(assignment)}
                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                    title="Edit"
                  >
                    <FiEdit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment.id)}
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

export default AssignedCarTable;