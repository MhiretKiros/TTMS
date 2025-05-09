"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

interface Car {
  id: number;
  inspected: boolean;
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  model: string;
  carType: string;
  manufactureYear: number;
  motorCapacity: string;
  kmPerLiter: number;
  totalKm: string;
  fuelType: string;
  status: string;
  registeredDate: string;
  parkingLocation: string;
  createdBy: string;
}

interface RentCar {
  id: number;
  make: string | null;
  frameNo: string;
  companyName: string;
  vehiclesUsed: string;
  bodyType: string;
  model: string;
  motorNumber: string;
  proYear: string;
  cc: string;
  department: string;
  vehiclesType: string;
  plateNumber: string;
  color: string;
  door: string;
  cylinder: string;
  fuelType: string;
  status: string;
  otherDescription: string;
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
  source: string;
  vehiclesDonorName: string;
  dateOfIn: string;
  dateOfOut: string;
  vehiclesPhoto: string;
  vehiclesUserName: string;
  position: string;
  libre: string;
  transmission: string;
  dataAntollerNatue: string;
  km: string;
  createdAt: string;
  createdBy: string;
  inspected: boolean;
}

interface AssignmentHistory {
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
  status: string;
  plateNumber: string | null;
  numberOfCar: string | null;
  model: string | null;
  car: Car | null;
  rentCar: RentCar | null;
  assignedDate: string;
  multipleCars: Car[];
  multipleRentCars: RentCar[];
  allPlateNumbers: string | null;
  allCarModels: string | null;
}

interface ApiResponse {
  codStatus: number;
  message: string;
  error: null;
  token: null;
  refreshedToken: null;
  expirationTime: null;
  car: null;
  carList: null;
  plateNumber: null;
  ownerName: null;
  ownerPhone: null;
  model: null;
  carType: null;
  manufactureYear: null;
  motorCapacity: null;
  kmPerLiter: null;
  totalKm: null;
  fuelType: null;
  status: null;
  parkingLocation: null;
  assignmentHistory: AssignmentHistory | null;
  assignmentHistoryList: AssignmentHistory[] | null;
}

export default function ViewAssignmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8080/auth/assignment/${id}`);
        const data: ApiResponse = await response.json();
        
        if (data.codStatus === 200) {
          if (data.assignmentHistory) {
            setAssignment(data.assignmentHistory);
          } else if (data.assignmentHistoryList && data.assignmentHistoryList.length > 0) {
            // Find the assignment with matching ID
            const foundAssignment = data.assignmentHistoryList.find(
              (item) => item.id.toString() === id
            );
            if (foundAssignment) {
              setAssignment(foundAssignment);
            } else {
              setError("Assignment not found");
            }
          } else {
            setError("Assignment not found");
          }
        } else {
          setError(data.message || "Failed to load assignment");
        }
      } catch (err) {
        console.error("Error loading assignment:", err);
        setError("Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };
    
    loadAssignment();
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
          onClick={() => router.push("/assignments")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Assignments
        </motion.button>
      </motion.div>
    );
  }

  if (!assignment) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <p>No assignment data available</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/tms-modules/admin/car-management/assign-car")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Assignments
        </motion.button>
      </motion.div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderVehicleInfo = () => {
    if (assignment.car) {
      return (
        <div className="space-y-4">
          {[
            { label: "Plate Number", value: assignment.car.plateNumber },
            { label: "Owner Name", value: assignment.car.ownerName },
            { label: "Owner Phone", value: assignment.car.ownerPhone },
            { label: "Model", value: assignment.car.model },
            { label: "Vehicle Type", value: assignment.car.carType },
            { label: "Manufacture Year", value: assignment.car.manufactureYear },
            { label: "Motor Capacity", value: `${assignment.car.motorCapacity} cc` },
            { label: "Fuel Type", value: assignment.car.fuelType },
            { label: "KM per Liter", value: assignment.car.kmPerLiter },
            { label: "Total KM", value: assignment.car.totalKm },
            { label: "Status", value: assignment.car.status },
            { label: "Parking Location", value: assignment.car.parkingLocation },
            { label: "Registered Date", value: formatDate(assignment.car.registeredDate) },
            { label: "Inspected", value: assignment.car.inspected ? "Yes" : "No" }
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
              <span className="font-medium text-gray-600 w-48 group-hover:text-purple-600 transition-colors">
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
      );
    } else if (assignment.rentCar) {
      return (
        <div className="space-y-4">
          {[
            { label: "Plate Number", value: assignment.rentCar.plateNumber },
            { label: "Company Name", value: assignment.rentCar.companyName },
            { label: "Model", value: assignment.rentCar.model },
            { label: "Body Type", value: assignment.rentCar.bodyType },
            { label: "Color", value: assignment.rentCar.color },
            { label: "Fuel Type", value: assignment.rentCar.fuelType },
            { label: "Transmission", value: assignment.rentCar.transmission },
            { label: "Status", value: assignment.rentCar.status },
            { label: "KM", value: assignment.rentCar.km },
            { label: "Radio", value: assignment.rentCar.radio },
            { label: "Tire Status", value: assignment.rentCar.tyerStatus },
            { label: "Fire Protection", value: assignment.rentCar.fireProtection },
            { label: "Date In", value: assignment.rentCar.dateOfIn },
            { label: "Date Out", value: assignment.rentCar.dateOfOut }
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
              <span className="font-medium text-gray-600 w-48 group-hover:text-purple-600 transition-colors">
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
      );
    } else if (assignment.multipleCars && assignment.multipleCars.length > 0) {
      return (
        <div className="space-y-6">
          <div className="font-medium text-gray-700">
            Assigned {assignment.multipleCars.length} vehicles:
          </div>
          {assignment.multipleCars.map((car, carIndex) => (
            <motion.div
              key={carIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * carIndex }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-lg mb-3">Vehicle {carIndex + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Plate Number", value: car.plateNumber },
                  { label: "Owner Name", value: car.ownerName },
                  { label: "Model", value: car.model },
                  { label: "Type", value: car.carType },
                  { label: "Year", value: car.manufactureYear },
                  { label: "Status", value: car.status }
                ].map((item, index) => (
                  <div key={index} className="flex">
                    <span className="font-medium text-gray-600 w-32">{item.label}:</span>
                    <span className="text-gray-800">{item.value || '-'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      );
    } else if (assignment.multipleRentCars && assignment.multipleRentCars.length > 0) {
      return (
        <div className="space-y-6">
          <div className="font-medium text-gray-700">
            Assigned {assignment.multipleRentCars.length} rental vehicles:
          </div>
          {assignment.multipleRentCars.map((rentCar, carIndex) => (
            <motion.div
              key={carIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * carIndex }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-lg mb-3">Rental Vehicle {carIndex + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Plate Number", value: rentCar.plateNumber },
                  { label: "Company", value: rentCar.companyName },
                  { label: "Model", value: rentCar.model },
                  { label: "Body Type", value: rentCar.bodyType },
                  { label: "Status", value: rentCar.status },
                  { label: "KM", value: rentCar.km }
                ].map((item, index) => (
                  <div key={index} className="flex">
                    <span className="font-medium text-gray-600 w-32">{item.label}:</span>
                    <span className="text-gray-800">{item.value || '-'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          No vehicle assigned to this request
        </motion.div>
      );
    }
  };

  const renderVehicleStatus = () => {
    if (assignment.car) {
      return (
        <motion.p
          whileHover={{ x: 3 }}
          className={`text-lg font-bold ${
            assignment.car.status === 'Available' ? 'text-green-600' : 
            assignment.car.status === 'Assigned' ? 'text-blue-600' : 
            'text-gray-600'
          }`}
        >
          {assignment.car.status}
        </motion.p>
      );
    } else if (assignment.rentCar) {
      return (
        <motion.p
          whileHover={{ x: 3 }}
          className={`text-lg font-bold ${
            assignment.rentCar.status === 'Available' ? 'text-green-600' : 
            assignment.rentCar.status === 'Assigned' ? 'text-blue-600' : 
            'text-gray-600'
          }`}
        >
          {assignment.rentCar.status}
        </motion.p>
      );
    } else if (assignment.multipleCars && assignment.multipleCars.length > 0) {
      return (
        <motion.p
          whileHover={{ x: 3 }}
          className="text-lg font-bold text-blue-600"
        >
          {assignment.multipleCars.length} vehicles assigned
        </motion.p>
      );
    } else if (assignment.multipleRentCars && assignment.multipleRentCars.length > 0) {
      return (
        <motion.p
          whileHover={{ x: 3 }}
          className="text-lg font-bold text-blue-600"
        >
          {assignment.multipleRentCars.length} rental vehicles assigned
        </motion.p>
      );
    } else {
      return (
        <motion.p
          whileHover={{ x: 3 }}
          className="text-lg font-bold text-gray-600"
        >
          N/A
        </motion.p>
      );
    }
  };

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
        Assignment Details: {assignment.requestLetterNo}
      </motion.h1>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Assignment Information */}
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
              Request Information
            </h2>
            <div className="space-y-4">
              {[
                { label: "Request Letter No", value: assignment.requestLetterNo },
                { label: "Request Date", value: formatDate(assignment.requestDate) },
                { label: "Requester Name", value: assignment.requesterName },
                { label: "Department", value: assignment.department },
                { label: "Position", value: assignment.position },
                { label: "Phone Number", value: assignment.phoneNumber },
                { label: "Rental Type", value: assignment.rentalType },
                { label: "Travel Work Percentage", value: assignment.travelWorkPercentage },
                { label: "Short Notice Percentage", value: assignment.shortNoticePercentage },
                { label: "Mobility Issue", value: assignment.mobilityIssue },
                { label: "Gender", value: assignment.gender },
                { label: "Total Percentage", value: `${assignment.totalPercentage}%` },
                { label: "Status", value: assignment.status },
                { label: "Assigned Date", value: formatDate(assignment.assignedDate) }
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
                  <span className="font-medium text-gray-600 w-48 group-hover:text-blue-600 transition-colors">
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
          
          {/* Assigned Vehicle Information */}
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
              Assigned Vehicle
            </h2>
            {renderVehicleInfo()}
          </motion.div>
          
          {/* Status Summary */}
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
              Assignment Summary
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
                <p className="font-medium text-gray-600 mb-2">Assignment Status</p>
                <motion.p
                  whileHover={{ x: 3 }}
                  className={`text-lg font-bold ${
                    assignment.status === 'Assigned' ? 'text-green-600' : 
                    assignment.status === 'Pending' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}
                >
                  {assignment.status}
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
                <p className="font-medium text-gray-600 mb-2">Priority Score</p>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-full bg-gray-200 rounded-full h-4"
                >
                  <motion.div 
                    className={`h-4 rounded-full ${
                      assignment.totalPercentage > 75 ? 'bg-red-500' :
                      assignment.totalPercentage > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${assignment.totalPercentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </motion.div>
                <p className="text-right mt-1 text-sm font-medium">
                  {assignment.totalPercentage}%
                </p>
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
                <p className="font-medium text-gray-600 mb-2">Vehicle Status</p>
                {renderVehicleStatus()}
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
        onClick={() => router.push("/tms-modules/admin/car-management/assign-car")}
        className="mt-6 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <motion.span
          whileHover={{ x: -3 }}
          className="flex items-center"
        >
          <FiArrowLeft className="mr-2" /> 
          <span>Back to Assignments</span>
        </motion.span>
      </motion.button>
    </motion.div>
  );
}