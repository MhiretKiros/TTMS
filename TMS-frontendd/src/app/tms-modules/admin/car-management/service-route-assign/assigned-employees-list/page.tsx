'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiUsers, FiLoader, FiAlertCircle, FiPlusCircle } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:8080'; // Assuming Spring Boot runs on port 8080

type RegisteredEmployee = {
  employeeId: string | number;
  name: string;
  department: string;
  assignedCarPlateNumber?: string; // Changed to match DTO
  village?: string;                // Changed to match DTO
};

export default function AssignedEmployeesListPage() {
  const [employees, setEmployees] = useState<RegisteredEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignedEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/employees`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch employees. Status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch employees. Status: ${response.status}`);
        }
        const data: RegisteredEmployee[] = await response.json();
        setEmployees(data);
      } catch (err: any) {
        console.error("Error fetching assigned employees:", err);
        setError(err.message || "Failed to load employee assignments.");
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedEmployees();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-3xl font-bold text-gray-700 flex items-center">
          <FiUsers className="mr-3" /> Employee Assignments
        </h1>
        <button
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            onClick={() => router.push('/tms-modules/admin/car-management/service-route-assign/employee-car-assignment')}
          >
            <FiPlusCircle className="mr-2" /> Assign New Car
          </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
          <FiAlertCircle className="mr-2" /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center text-gray-500 mt-10">
          <FiLoader className="animate-spin mr-3 h-6 w-6"/>
          <p className="text-lg">Loading employee assignments...</p>
        </div>
      ) : !error && employees.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
            <p className="text-lg">No employee assignments found.</p>
            <p className="text-sm">You can assign cars to employees on the assignment page.</p>
        </div>
      ) : !error && employees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Village/Area
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Car Plate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.employeeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.village || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{employee.assignedCarPlateNumber || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}