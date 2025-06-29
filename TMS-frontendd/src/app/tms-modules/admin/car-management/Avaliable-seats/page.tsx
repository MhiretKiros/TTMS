'use client';

import { useEffect, useState } from 'react';
import { FiTruck, FiUsers, FiAlertCircle, FiCheckCircle, FiLoader, FiX } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:8080';

type CarSeatInfo = {
  id: string | number;
  plateNumber: string;
  model: string;
  totalSeats: number;
  availableSeats: number;
  assignedEmployees: {
    employeeId: string;
    name: string;
    department: string;
  }[];
};

export default function CarSeatCounterPage() {
  const [cars, setCars] = useState<CarSeatInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedCarId, setExpandedCarId] = useState<string | number | null>(null);

  // Fetch all cars with their seat information and assigned employees
  const fetchCarSeatData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First fetch all service cars
      const carsResponse = await fetch(`${API_BASE_URL}/auth/organization-car/service-buses`);
      if (!carsResponse.ok) throw new Error('Failed to fetch service cars');
      const carsData = await carsResponse.json();
      
      // Then fetch all assigned employees
      const assignmentsResponse = await fetch(`${API_BASE_URL}/api/employees`);
      if (!assignmentsResponse.ok) throw new Error('Failed to fetch employee assignments');
      const assignmentsData = await assignmentsResponse.json();

      const validAssignments = Array.isArray(assignmentsData) ? assignmentsData : [];

      // Process the data to combine car info with seat counts and assignments
      const processedCars = (carsData.cars || carsData.organizationCarList || [])
        .filter((car: any) => car.organizationCar && car.organizationCar.plateNumber)
        .map((car: any) => {
          const carId = car.organizationCar.id;
          const plateNumber = car.organizationCar.plateNumber;
          const model = car.organizationCar.model || 'Unknown Model';
          const totalSeats = car.organizationCar.loadCapacity || 14;
          
          // Find all employees assigned to this car
          const assignedEmployees = validAssignments
            .filter((assignment: any) => assignment.assignedCarPlateNumber === plateNumber)
            .map((assignment: any) => ({
              employeeId: assignment.employeeId,
              name: assignment.employeeName,
              department: assignment.employeeDepartment
            }));

          return {
            id: carId,
            plateNumber,
            model,
            totalSeats,
            availableSeats: totalSeats - assignedEmployees.length,
            assignedEmployees
          };
        });

      setCars(processedCars);
    } catch (err: any) {
      console.error("Error fetching car seat data:", err);
      setError(err.message || "Failed to load car seat information");
      setCars([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCarSeatData();
  }, []);

  const toggleCarExpansion = (carId: string | number) => {
    setExpandedCarId(expandedCarId === carId ? null : carId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-3xl font-bold text-gray-700">Service Car Seat Management</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCarSeatData}
            disabled={isLoading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? <FiLoader className="animate-spin mr-2" /> : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" /> 
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-500 hover:text-red-700"
          >
            <FiX />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <FiCheckCircle className="mr-2" /> 
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)} 
            className="text-green-500 hover:text-green-700"
          >
            <FiX />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <span className="ml-2 text-lg">Loading car seat data...</span>
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No service cars found or no assignments made yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="border rounded-lg overflow-hidden shadow-sm">
              <div
                className={`p-4 ${car.availableSeats <= 0 ? 'bg-red-50' : 'bg-blue-50'} border-b cursor-pointer`}
                onClick={() => toggleCarExpansion(car.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg flex items-center">
                      <FiTruck className="mr-2" /> {car.plateNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{car.model}</p>
                  </div>
                  <div className="text-right">
                    <div>
                      <span className={`text-xl font-bold ${car.availableSeats <= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {car.availableSeats}
                      </span>
                      <span className="text-sm text-gray-600"> Free</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-gray-700">
                        {car.assignedEmployees.length}
                      </span>
                      <span className="text-sm text-gray-600"> Held</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total: {car.totalSeats} seats
                    </div>
                  </div>
                </div>
              </div>

              {expandedCarId === car.id && (
                <div className="p-4">
                  {car.assignedEmployees.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No employees assigned</p>
                  ) : (
                    <>
                      <h4 className="font-medium text-sm flex items-center mb-2">
                        <FiUsers className="mr-1" /> Assigned Employees ({car.assignedEmployees.length})
                      </h4>
                      <ul className="space-y-2">
                        {car.assignedEmployees.map((employee) => (
                          <li key={employee.employeeId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-xs text-gray-500">{employee.department} • ID: {employee.employeeId}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
