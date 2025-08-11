"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertCircle, FiTool, FiCheckCircle, FiX,
  FiCalendar, FiUser, FiPhone, FiTruck, FiLoader, FiPlusCircle, FiEye
} from "react-icons/fi";
import Swal from "sweetalert2";
import axios from "axios";
import { useNotification } from '@/app/contexts/NotificationContext';

// Type definitions
interface User {
  id?: number;
  name: string;
  role: string;
  email: string;
  myUsername?: string;
  token?: string;
  refreshedToken?: string;
}

interface RentalMaintenanceRequest {
  id: number;
  rentalCarId: number | null;
  carId: number | null;
  requesterName: string;
  plateNumber: string;
  driverName: string;
  requesterPhone: string;
  serviceDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "COMPLETED" | "RETURNED";
  returnDate?: string;
  approvedById?: number;
  completedById?: number;
  driverId?: number;
  requestType?: "SERVICE" | "MAINTENANCE";
}

interface VehicleSuggestion {
  plate: string;
  driver: string;
  carType: string;
  status: string;
  type: "car" | "organization" | "rent";
  rentalCarId?: number;
  carId?: number;
  driverId?: number;
  ownerName?: string;
  ownerPhone?: string;
}

export default function DriverRequestPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<RentalMaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RentalMaintenanceRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RentalMaintenanceRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [vehicleSuggestions, setVehicleSuggestions] = useState<VehicleSuggestion[]>([]);
  const [plateSearchQuery, setPlateSearchQuery] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState<Omit<RentalMaintenanceRequest, "id" | "status">>({
    rentalCarId: null,
    carId: null,
    requesterName: "",
    plateNumber: "",
    driverName: "",
    requesterPhone: "",
    serviceDate: "",
    reason: "",
    returnDate: "",
    approvedById: undefined,
    completedById: undefined,
    driverId: undefined,
    requestType: "SERVICE",
  });

  // Fetch current user from localStorage or API
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setIsLoading(false);
        return;
      } catch {}
    }
    // fallback to API
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rental-maintenance/me`);
        const userData: User = {
          id: response.data.ourUser?.id,
          name: response.data.ourUser?.name,
          role: response.data.ourUser?.role,
          email: response.data.ourUser?.email,
          myUsername: response.data.ourUser?.myUsername,
          token: localStorage.getItem("token") || "",
          refreshedToken: response.data.refreshedToken,
        };
        setCurrentUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch all vehicles (with ownerName/ownerPhone for autofill)
  useEffect(() => {
    if (!currentUser || currentUser.role !== "DRIVER") return;
    const fetchAllVehicles = async () => {
      try {
        const [carsRes, orgCarsRes, rentCarsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/all`),
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/all`),
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/all`)
        ]);
        const vehicles = [
          ...(carsRes.data.carList || []).map((v: any) => ({
            plate: v.plateNumber?.trim(),
            driver: v.driverName?.trim() || "No driver assigned",
            carType: v.carType,
            status: v.status,
            type: "car" as const,
            rentalCarId: v.id,
            carId: v.id,
            driverId: v.driverId,
            ownerName: v.ownerName,
            ownerPhone: v.ownerPhone,
          })),
          ...(orgCarsRes.data.organizationCarList || []).map((v: any) => ({
            plate: v.plateNumber?.trim(),
            driver: v.driverName?.trim() || "No driver assigned",
            carType: v.carType,
            status: v.status,
            type: "organization" as const,
            rentalCarId: v.id,
            carId: v.id,
            driverId: undefined,
            ownerName: v.ownerName,
            ownerPhone: v.ownerPhone,
          })),
          ...(rentCarsRes.data.rentCarList || []).map((v: any) => ({
            plate: v.licensePlate?.trim(),
            driver: v.driverName?.trim() || "No driver assigned",
            carType: v.vehicleType,
            status: v.status,
            type: "rent" as const,
            rentalCarId: v.id,
            carId: v.carId,
            driverId: v.driverId,
            ownerName: v.ownerName,
            ownerPhone: v.ownerPhone,
          }))
        ].filter(v => v.plate && v.plate !== "N/A");
        setVehicleSuggestions(vehicles);
      } catch (error) {}
    };
    fetchAllVehicles();
  }, [currentUser]);

  // Filter vehicles based on search query
  const filteredVehicles = useMemo(() => {
    if (!currentUser || currentUser.role !== "DRIVER" || !plateSearchQuery.trim()) return [];
    const query = plateSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, "");
    return vehicleSuggestions
      .filter(vehicle => {
        const plate = vehicle?.plate?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "";
        return plate.includes(query);
      })
      .slice(0, 5);
  }, [plateSearchQuery, vehicleSuggestions, currentUser]);

  // Handle vehicle selection (autofill requesterName/requesterPhone, but allow driverName edit)
  const handlePlateSelect = (vehicle: VehicleSuggestion) => {
    setFormData(prev => ({
      ...prev,
      plateNumber: vehicle.plate,
      driverName: vehicle.driver, // editable
      rentalCarId: vehicle.rentalCarId ?? null,
      carId: vehicle.carId ?? null,
      driverId: vehicle.driverId,
      requesterName: vehicle.ownerName || "",
      requesterPhone: vehicle.ownerPhone || "",
    }));
    setPlateSearchQuery(vehicle.plate);
  };

  // Fetch all maintenance requests
  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rental-maintenance`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.data && Array.isArray(response.data)) {
          setRequests(response.data);
        }
      } catch (error) {}
    };
    fetchServiceRequests();
  }, []);

  // Filter requests for driver: only show requests where driverName matches currentUser.name (from localStorage)
  useEffect(() => {
    if (!currentUser) return;
    let filtered = requests;
    filtered = requests.filter(req =>
      (req.driverName || '').trim().toLowerCase() === (currentUser.name || '').trim().toLowerCase() &&
      (showCompleted
        ? req.status === "COMPLETED"
        : req.status === "PENDING" || req.status === "APPROVED" || req.status === "RETURNED")
    );
    setFilteredRequests(filtered);
  }, [requests, currentUser, showCompleted]);

  // Handle form input changes (support select)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  // Form validation
  const validateForm = () => {
    if (!currentUser || currentUser.role !== "DRIVER") return false;
    const newErrors: Record<string, string> = {};
    if (!formData.requesterName.trim()) newErrors.requesterName = "Requester name is required";
    if (!formData.requesterPhone.trim()) newErrors.requesterPhone = "Phone number is required";
    if (!formData.plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (!formData.driverName.trim()) newErrors.driverName = "Driver name is required";
    if (!formData.serviceDate) newErrors.serviceDate = "Service date is required";
    if (formData.requestType === "MAINTENANCE" && !formData.reason.trim()) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit new maintenance request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "DRIVER" || !validateForm()) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rental-maintenance`,
        {
          ...formData,
          serviceDate: new Date(formData.serviceDate).toISOString(),
          driverId: formData.driverId,
          requestType: formData.requestType,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setRequests(prev => [...prev, response.data]);
      Swal.fire({
        title: "Success!",
        text: "Maintenance request submitted successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
        }
      });
      setFormData({
        rentalCarId: null,
        carId: null,
        requesterName: "",
        plateNumber: "",
        driverName: "",
        requesterPhone: "",
        serviceDate: "",
        reason: "",
        returnDate: "",
        approvedById: undefined,
        completedById: undefined,
        driverId: undefined,
        requestType: "SERVICE",
      });
      setPlateSearchQuery("");
      setShowFormModal(false);

      // add notification
      try {
        await addNotification(
          `New ${formData.requestType} request is registered: ${formData.plateNumber}`,
          `/tms/admin/car-management/Rent-maintenance-request`,
          "DISTRIBUTOR"
        );
      } catch (notificationError) {
        console.error("Failed to add notification:", notificationError);
      }
    } catch (error) {
      setApiError("Failed to submit maintenance request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Driver completion handler
  const handleComplete = async (id: number, returnDate: string) => {
    if (!returnDate || !currentUser || currentUser.role !== "DRIVER") {
      setErrors(prev => ({ ...prev, returnDate: "Return date is required" }));
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rental-maintenance/${id}/complete`,
        new Date(returnDate).toISOString(),
        { headers: { "Content-Type": "application/json" } }
      );
      setRequests(prev => prev.map(req => req.id === id ? response.data : req));
      if (selectedRequest?.id === id) setSelectedRequest(response.data);
      Swal.fire({
        title: "Completed!",
        text: "Maintenance request marked as completed.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
        }
      });
      setShowDetailsModal(false);

      // add notification
      try {
        await addNotification(
          `New ${formData.requestType} request is added for return : ${formData.plateNumber}`,
          `/tms/admin/car-management/Rent-maintenance-request`,
          "DISTRIBUTOR"
        );
      } catch (notificationError) {
        console.error("Failed to add notification:", notificationError);
      }
    } catch (error) {
      setApiError("Failed to complete request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
      status === "APPROVED" ? "bg-blue-100 text-blue-800" :
      "bg-green-100 text-green-800"
    }`}>
      {status}
    </span>
  );

  // Detail item component for modal
  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
        {icon} <span className="ml-2">{label}</span>
      </label>
      <div className="p-2 bg-gray-50 rounded-lg">{value}</div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-red-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
        <p>Please log in to access the maintenance system.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6 md:p-8 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Rental Maintenance Requests (My Requests)
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCompleted((prev) => !prev)}
            className={`p-2 rounded-full shadow-lg transition-all flex items-center ${
              showCompleted
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            title={showCompleted ? "View Active Requests" : "View Completed Requests"}
          >
            <FiEye className="text-xl mr-1" />
            {showCompleted ? "View Active Requests" : "View Completed Requests"}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFormModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm bg-white"
            title="New Request"
          >
            <FiPlusCircle className="w-12 h-12 p-1 rounded-full text-[#3c8dbc] transition-colors duration-200 hover:bg-[#3c8dbc] hover:text-white" />
          </motion.button>
        </div>
      </div>

      {/* Requests Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <FiTool className="mr-2" />
          {showCompleted ? "Completed Requests" : "My Maintenance Requests"}
        </h3>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 max-w-md mx-auto">
              <FiAlertCircle className="mx-auto text-3xl mb-4 text-yellow-500" />
              <h4 className="font-medium text-lg mb-2">No Requests Found</h4>
              <p>
                {showCompleted
                  ? "You have no completed maintenance requests."
                  : "You have no maintenance requests."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      {request.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(request.serviceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <FiTool className="mr-2" />
                    New Maintenance Request
                  </h3>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="text-gray-500" />
                  </button>
                </div>
                {apiError && (
                  <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    <div className="flex items-center">
                      <FiAlertCircle className="mr-2" />
                      <div>
                        <span className="font-medium">Error:</span> {apiError}
                        {Object.keys(errors).length > 0 && (
                          <ul className="mt-1 list-disc list-inside">
                            {Object.entries(errors).map(([field, message]) => (
                              <li key={field}>{message}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Plate Number *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={plateSearchQuery}
                          onChange={(e) => setPlateSearchQuery(e.target.value)}
                          placeholder="Start typing plate number..."
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.plateNumber ? "border-red-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {plateSearchQuery && !formData.plateNumber && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredVehicles.length > 0 ? (
                              filteredVehicles.map((vehicle) => (
                                <div
                                  key={vehicle.plate}
                                  onClick={() => handlePlateSelect(vehicle)}
                                  className="p-3 hover:bg-gray-100 cursor-pointer transition-colors flex justify-between items-center"
                                >
                                  <span className="font-mono">{vehicle.plate}</span>
                                  <span className="text-sm text-gray-600">{vehicle.driver}</span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-gray-500 text-sm">
                                No vehicles found matching "{plateSearchQuery}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.plateNumber && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FiAlertCircle className="mr-1" /> {errors.plateNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requester Name *
                      </label>
                      <input
                        type="text"
                        name="requesterName"
                        value={formData.requesterName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.requesterName ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Owner name"
                      />
                      {errors.requesterName && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FiAlertCircle className="mr-1" /> {errors.requesterName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requester Phone *
                      </label>
                      <input
                        type="tel"
                        name="requesterPhone"
                        value={formData.requesterPhone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.requesterPhone ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Owner phone"
                      />
                      {errors.requesterPhone && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FiAlertCircle className="mr-1" /> {errors.requesterPhone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver Name *
                      </label>
                      <input
                        type="text"
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.driverName ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Driver name"
                      />
                      {errors.driverName && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FiAlertCircle className="mr-1" /> {errors.driverName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Date *
                      </label>
                      <input
                        type="date"
                        name="serviceDate"
                        value={formData.serviceDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.serviceDate ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.serviceDate && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FiAlertCircle className="mr-1" /> {errors.serviceDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Request Type *
                      </label>
                      <select
                        name="requestType"
                        value={formData.requestType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SERVICE">Service</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                    {formData.requestType === "MAINTENANCE" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Maintenance *
                        </label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.reason ? "border-red-500" : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Describe the reason for maintenance"
                          rows={3}
                          maxLength={500}
                        />
                        {errors.reason && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FiAlertCircle className="mr-1" /> {errors.reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#3c8dbc] hover:bg-[#367fa9]"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="mr-2" />
                          Submit Request
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiTool className="mr-2" />
                    Maintenance Request Details
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem
                      icon={<FiTruck />}
                      label="Plate Number"
                      value={selectedRequest.plateNumber}
                    />
                    <DetailItem
                      icon={<FiUser />}
                      label="Driver Name"
                      value={selectedRequest.driverName}
                    />
                    <DetailItem
                      icon={<FiUser />}
                      label="Requester Name"
                      value={selectedRequest.requesterName}
                    />
                    <DetailItem
                      icon={<FiPhone />}
                      label="Requester Phone"
                      value={selectedRequest.requesterPhone}
                    />
                    <DetailItem
                      icon={<FiCalendar />}
                      label="Service Date"
                      value={new Date(selectedRequest.serviceDate).toLocaleDateString()}
                    />
                    <DetailItem
                      icon={<FiCalendar />}
                      label="Status"
                      value={<StatusBadge status={selectedRequest.status} />}
                    />
                    {selectedRequest.status === "COMPLETED" && selectedRequest.returnDate && (
                      <div className="md:col-span-2">
                        <DetailItem
                          icon={<FiCalendar />}
                          label="Return Date"
                          value={new Date(selectedRequest.returnDate).toLocaleDateString()}
                        />
                      </div>
                    )}
                    {selectedRequest.approvedById && (
                      <DetailItem
                        icon={<FiUser />}
                        label="Approved By"
                        value={`User #${selectedRequest.approvedById}`}
                      />
                    )}
                    {selectedRequest.completedById && (
                      <DetailItem
                        icon={<FiUser />}
                        label="Completed By"
                        value={`User #${selectedRequest.completedById}`}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Reason for Maintenance
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedRequest.reason}
                    </div>
                  </div>
                  {selectedRequest.status === "APPROVED" && (
                    <div className="pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Date *
                      </label>
                      <input
                        type="date"
                        value={selectedRequest.returnDate || ""}
                        onChange={(e) => setSelectedRequest(prev =>
                          prev ? { ...prev, returnDate: e.target.value } : null
                        )}
                        min={selectedRequest.serviceDate}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.returnDate ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.returnDate && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FiAlertCircle className="mr-1" /> {errors.returnDate}
                        </p>
                      )}
                      <div className="mt-4">
                        <motion.button
                          type="button"
                          onClick={() => {
                            if (selectedRequest.returnDate) {
                              handleComplete(selectedRequest.id, selectedRequest.returnDate);
                            } else {
                              setErrors(prev => ({ ...prev, returnDate: "Return date is required" }));
                            }
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSubmitting}
                          className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
                            isSubmitting
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          <FiCheckCircle className="mr-2" />
                          Mark as Completed
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}