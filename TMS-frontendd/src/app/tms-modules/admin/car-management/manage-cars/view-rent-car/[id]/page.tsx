"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchRentCarById } from "../../api/rentCarServices";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

interface RentCar {
  id: number;
  plateNumber: string;
  frameNo: string;
  companyName: string;
  model: string;
  vehiclesType: string;
  proYear: string;
  cc: string;
  department: string;
  color: string;
  motorNumber: string;
  fuelType: string;
  transmission: string;
  door: string;
  cylinder: string;
  km: string;
  vehiclesStatus: string;
  vehiclesUsed: string;
  bodyType: string;
  vehiclesUserName: string;
  position: string;
  dateOfIn?: string;
  dateOfOut?: string;
  vehiclesDonorName: string;
  source: string;
  radio: string;
  antena: string;
  krik: string;
  krikManesha: string;
  tyerStatus: string;
  gomaMaficha: string;
  mefcha: string;
  reserveTayer: string;
  gomaGet: string;
  pinsa: string;
  kacavite: string;
  fireProtection: string;
}

export default function ViewRentCarPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<RentCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching rent car with ID: ${id}`);
        
        const response = await fetchRentCarById(Number(id));
        console.log('API Response:', response);
        
        if (response.success && response.data) {
          setCar(response.data);
        } else {
          setError(response.message || "Rented car not found");
        }
      } catch (err) {
        console.error("Error loading rent car:", err);
        setError("Failed to load rented car details");
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
        <p>No organization vehicle data available</p>
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
        Organization Vehicle: {car.plateNumber}
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
              Basic Information
            </h2>
            <div className="space-y-4">
              {[
                { label: "Frame No", value: car.frameNo },
                { label: "Company Name", value: car.companyName },
                { label: "Plate Number", value: car.plateNumber },
                { label: "Model", value: car.model },
                { label: "Vehicle Type", value: car.vehiclesType },
                { label: "Production Year", value: car.proYear },
                { label: "Engine CC", value: `${car.cc} cc` },
                { label: "Department", value: car.department },
                { label: "Color", value: car.color }
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
          
          {/* Technical Details */}
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
              Technical Details
            </h2>
            <div className="space-y-4">
              {[
                { label: "Motor Number", value: car.motorNumber },
                { label: "Fuel Type", value: car.fuelType },
                { label: "Transmission", value: car.transmission },
                { label: "Doors", value: car.door },
                { label: "Cylinders", value: car.cylinder },
                { label: "Mileage", value: `${car.km} km` },
                { label: "Vehicle Status", value: car.vehiclesStatus },
                { label: "Vehicle Used", value: car.vehiclesUsed },
                { label: "Body Type", value: car.bodyType }
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
          
          {/* Rental Information */}
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
              Rental Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "User Name", value: car.vehiclesUserName },
                { label: "Position", value: car.position },
                { label: "Date In", value: car.dateOfIn ? new Date(car.dateOfIn).toLocaleDateString() : '-' },
                { label: "Date Out", value: car.dateOfOut ? new Date(car.dateOfOut).toLocaleDateString() : '-' },
                { label: "Donor Name", value: car.vehiclesDonorName },
                { label: "Source", value: car.source }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                  className="bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                >
                  <p className="font-medium text-gray-600 mb-2">{item.label}</p>
                  <motion.p
                    whileHover={{ x: 3 }}
                    className="text-gray-800"
                  >
                    {item.value}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Equipment Status */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="md:col-span-2 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg hover:shadow-lg transition-all duration-300"
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
                  delay: 1.2
                }}
                className="w-3 h-3 bg-blue-500 rounded-full mr-2"
              />
              Equipment Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Radio", value: car.radio },
                { label: "Antenna", value: car.antena },
                { label: "Jack", value: car.krik },
                { label: "Jack Handle", value: car.krikManesha },
                { label: "Tire Status", value: car.tyerStatus },
                { label: "Spare Tire", value: car.gomaMaficha },
                { label: "Wrench", value: car.mefcha },
                { label: "Reserve Tire", value: car.reserveTayer },
                { label: "Tire Iron", value: car.gomaGet },
                { label: "Pliers", value: car.pinsa },
                { label: "Screwdriver", value: car.kacavite },
                { label: "Fire Extinguisher", value: car.fireProtection }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.03 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                  className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                >
                  <p className="font-medium text-gray-600 text-sm mb-1">{item.label}</p>
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      item.value === 'Yes' ? 'bg-green-100 text-green-800' : 
                      item.value === 'No' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.value || 'Unknown'}
                  </motion.span>
                </motion.div>
              ))}
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