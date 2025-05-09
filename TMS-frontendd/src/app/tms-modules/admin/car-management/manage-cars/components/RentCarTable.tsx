"use client";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";

interface RentCar {
  id: number;
  plateNumber: string;
  companyName: string;
  vehiclesUserName: string;
  vehiclesUserPhone: string;
  model: string;
  vehiclesType: string;
  manufactureYear: string;
  motorCapacity: string;
  totalKm: string;
  fuelType: string;
  status: string;
  registeredDate: string;
  parkingLocation: string;
}

const RentCarTable = ({
  cars,
  onEdit,
  onDelete,
  onView,
}: {
  cars: RentCar[];
  onEdit: (car: RentCar) => void;
  onDelete: (id: number) => Promise<void>;
  onView: (id: number) => void;
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

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="overflow-x-auto"
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Plate Number", "Company", "User", "Phone", "Model", "Type", "Year",
              "Engine", "Mileage", "Fuel", "Status", "Registered", "Location", "Actions"
            ].map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {cars.map((car) => (
            <motion.tr
              key={car.id}
              variants={rowVariants}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {car.plateNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.companyName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.vehiclesUserName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {car.vehiclesUserPhone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.model}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.vehiclesType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.manufactureYear}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.motorCapacity} cc
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.totalKm} km
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.fuelType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      car.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : car.status === "Maintenance"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                >
                  {car.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(car.registeredDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {car.parkingLocation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onView(car.id)}
                    className="text-[#3c8dbc] hover:text-[#2a6a90] p-1 rounded-full hover:bg-blue-50"
                    title="View details"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(car)}
                    className="text-[#3c8dbc] hover:text-[#2a6a90] p-1 rounded-full hover:bg-blue-50"
                    title="Edit"
                  >
                    <FiEdit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="text-[#3c8dbc] hover:text-[#2a6a90] p-1 rounded-full hover:bg-blue-50"
                    title="Delete"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default RentCarTable;
