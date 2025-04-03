"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrganizationCarById } from "../../api/organizationCarServices";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ViewOrganizationCarPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchOrganizationCarById(Number(id));
        
        if (response.codStatus === 200 && response.car) {
          setCar(response.car);
        } else {
          setError(response.message || "Organization car not found");
        }
      } catch (err) {
        setError("Failed to load organization car details");
        console.error("Error loading organization car:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCar();
  }, [id]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 flex justify-center items-center h-64"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          {error}
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/tms-modules/admin/car-management/manage-cars")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Car List
        </motion.button>
      </motion.div>
    );
  }

  if (!car) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <p>No organization car data available</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/tms-modules/admin/car-management/manage-cars")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Car List
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <motion.h1 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
      >
        Organization Car: {car.plateNumber}
      </motion.h1>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 group"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <motion.span 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
                className="w-3 h-3 bg-blue-500 rounded-full mr-2"
              />
              Vehicle Information
            </h2>
            <div className="space-y-4">
              {[
                { label: "Plate Number", value: car.plateNumber },
                { label: "Owner Name", value: car.ownerName },
                { label: "Model", value: car.model },
                { label: "Car Type", value: car.carType },
                { label: "Manufacture Year", value: car.manufactureYear },
                { label: "Motor Capacity", value: car.motorCapacity },
                { label: "Fuel Efficiency", value: `${car.kmPerLiter} km/L` },
                { label: "Total KM", value: `${car.totalKm} km` },
                { label: "Fuel Type", value: car.fuelType }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ 
                    x: 5,
                    backgroundColor: "rgba(239, 246, 255, 0.5)"
                  }}
                  className="flex border-b border-gray-100 pb-3 px-2 rounded-md transition-all duration-200"
                >
                  <span className="font-medium text-gray-600 w-40 group-hover:text-blue-600 transition-colors">
                    {item.label}:
                  </span>
                  <motion.span 
                    whileHover={{ scale: 1.03 }}
                    className="text-gray-800 font-medium"
                  >
                    {item.value || '-'}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Driver Information */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300 group"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <motion.span 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5
                }}
                className="w-3 h-3 bg-purple-500 rounded-full mr-2"
              />
              Driver & Capacity
            </h2>
            <div className="space-y-4">
              {[
                { label: "Driver Name", value: car.driverName },
                { label: "Driver Attributes", value: car.driverAttributes },
                { label: "Driver Address", value: car.driverAddress },
                { label: "Load Capacity", value: `${car.loadCapacity} kg` },
                { label: "Parking Location", value: car.parkingLocation },
                { label: "Registered Date", value: new Date(car.registeredDate).toLocaleDateString() }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ 
                    x: 5,
                    backgroundColor: "rgba(245, 243, 255, 0.5)"
                  }}
                  className="flex border-b border-gray-100 pb-3 px-2 rounded-md transition-all duration-200"
                >
                  <span className="font-medium text-gray-600 w-40 group-hover:text-purple-600 transition-colors">
                    {item.label}:
                  </span>
                  <motion.span 
                    whileHover={{ scale: 1.03 }}
                    className="text-gray-800 font-medium"
                  >
                    {item.value || '-'}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Status Information */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="md:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <motion.span 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: 1
                }}
                className="w-3 h-3 bg-indigo-500 rounded-full mr-2"
              />
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                className="bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
              >
                <p className="font-medium text-gray-600 mb-2">Created By</p>
                <motion.p
                  whileHover={{ x: 3 }}
                  className="text-gray-800"
                >
                  {car.createdBy || 'System'}
                </motion.p>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.85 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                className="bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
              >
                <p className="font-medium text-gray-600 mb-2">Last Updated</p>
                <motion.p
                  whileHover={{ x: 3 }}
                  className="text-gray-800"
                >
                  {car.updatedAt ? new Date(car.updatedAt).toLocaleString() : 'Never'}
                </motion.p>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                className="bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
              >
                <p className="font-medium text-gray-600 mb-2">Vehicle Condition</p>
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                    ${parseFloat(car.kmPerLiter) > 10 ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'} transition-colors`}
                >
                  {parseFloat(car.kmPerLiter) > 10 ? 'Good Condition' : 'Needs Attention'}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ 
          scale: 1.05,
          background: "linear-gradient(to right, #4f46e5, #7c3aed)"
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/tms-modules/admin/car-management/manage-cars")}
        className="mt-6 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <motion.span
          whileHover={{ x: -3 }}
          className="flex items-center"
        >
          <FiArrowLeft className="mr-2" /> 
          <span>Back to Fleet Dashboard</span>
        </motion.span>
      </motion.button>
    </motion.div>
  );
}