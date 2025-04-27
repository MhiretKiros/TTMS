"use client";
import { motion } from 'framer-motion';
import { FiEye, FiRefreshCw, FiXCircle } from 'react-icons/fi';

type AssignmentHistory = {
  id: number;
  requestLetterNo: string;
  requestDate: string;
  requesterName: string;
  rentalType: string;
  position: string;
  department: string;
  phoneNumber: string;
  travelWorkPercentage: string;
  shortNoticePercentage: string;
  mobilityIssue: string;
  gender: string;
  totalPercentage: number;
  assignedDate: string;
  car?: { plateNumber: string };
  cars?: { plateNumber: string };
};

const AssignmentHistoryTable = ({
  assignments,
  onView,
  onTransfer,
  onRevoke,
}: {
  assignments: AssignmentHistory[];
  onView: (id: number) => void;
  onTransfer: (id: number) => void;
  onRevoke: (id: number) => void;
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

  return (
    <div className="overflow-x-auto">
      <motion.table
        className="min-w-full divide-y divide-gray-200"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Letter No</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Travel %</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notice %</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobility</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total %</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Car (Gov)</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Car (Rent)</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assignments.map((history) => (
            <motion.tr
              key={history.id}
              variants={rowVariants}
              whileHover={{ scale: 1.01 }}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.requestLetterNo}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.requesterName}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.department}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{history.phoneNumber}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.travelWorkPercentage}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.shortNoticePercentage}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.mobilityIssue}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.totalPercentage}%</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{new Date(history.assignedDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.car?.plateNumber || "-"}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{history.cars?.plateNumber || "-"}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm flex gap-2 justify-end items-center">
                <button
                  onClick={() => onView(history.id)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                  title="View details"
                >
                  <FiEye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onTransfer(history.id)}
                  className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                  title="Transfer"
                >
                  <FiRefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onRevoke(history.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                  title="Revoke"
                >
                  <FiXCircle className="h-5 w-5" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
};

export default AssignmentHistoryTable;
