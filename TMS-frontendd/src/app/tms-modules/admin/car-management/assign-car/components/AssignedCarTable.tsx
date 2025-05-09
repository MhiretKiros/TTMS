// src/app/tms-modules/admin/car-management/assign-cars/components/AssignedCarTable.tsx
"use client";
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Link from 'next/link';

interface AssignedCarTableProps {
  assignments: any[];
  onEdit: (assignment: any) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  activeFilter: string | null;
  onFilterClick: (filterType: string) => void;
  actorType: 'manager' | 'top-manager';
  onRowClick: (assignment: any) => void;
}

const AssignedCarTable = ({
  assignments,
  onEdit,
  onDelete,
  onView,
  activeFilter,
  onFilterClick,
  actorType,
  onRowClick
}: AssignedCarTableProps) => {
  const tableBodyHeight = '24rem';

  return (
    <div className="overflow-x-auto">
      <div className="relative">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Request No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                All Plate Numbers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                Actions
              </th>
            </tr>
          </thead>
        </table>
        <div 
          className="overflow-y-auto"
          style={{ height: tableBodyHeight }}
        >
          <table className="w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <motion.tr
                  key={assignment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`hover:bg-gray-50 ${
                    actorType === 'top-manager' ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => actorType === 'top-manager' && onRowClick(assignment)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assignment.requesterName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.requestLetterNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.car?.plateNumber || assignment.rentCar?.plateNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      assignment.status === 'Active' || assignment.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      assignment.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.allPlateNumbers || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {actorType === 'manager' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(assignment);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(assignment.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(assignment.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignedCarTable;
