"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertCircle, FiTool, FiCheckCircle, FiX,
  FiCalendar, FiUser, FiPhone, FiTruck, FiInfo, FiLoader, FiSearch,
  FiActivity, FiClock, FiRepeat, FiAward, FiFilter
} from "react-icons/fi";
import Swal from "sweetalert2";
import axios from "axios";
import { useNotification } from '@/app/contexts/NotificationContext';

// Type definitions
interface User {
  name: string;
  email: string;
  myUsername?: string;
  role: string;
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
  carType?: "car" | "organization" | "rent";
}

const requestTypeOptions = [
  { key: "ALL", label: "All" },
  { key: "SERVICE", label: "Service" },
  { key: "MAINTENANCE", label: "Maintenance" },
];

// Helper to get date difference in days
function getDateDiffDays(start?: string, end?: string) {
  if (!start || !end) return "-";
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "-";
  const diff = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DistributorViewRequestPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<RentalMaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RentalMaintenanceRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RentalMaintenanceRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "RETURNED" | "COMPLETED">("ALL");
  const [requestTypeFilter, setRequestTypeFilter] = useState<"ALL" | "SERVICE" | "MAINTENANCE">("ALL");
  const { addNotification } = useNotification();

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
          name: response.data.ourUser.name,
          email: response.data.ourUser.email,
          myUsername: response.data.ourUser.myUsername,
          role: response.data.ourUser.role,
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

  // Filter requests based on search, status, and requestType
  useEffect(() => {
    let filtered = requests;
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }
    if (requestTypeFilter !== "ALL") {
      filtered = filtered.filter((req) => req.requestType === requestTypeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.plateNumber?.toLowerCase().includes(q) ||
          req.driverName?.toLowerCase().includes(q) ||
          req.requesterName?.toLowerCase().includes(q) ||
          req.requesterPhone?.toLowerCase().includes(q)
      );
    }
    setFilteredRequests(filtered);
  }, [requests, statusFilter, requestTypeFilter, search]);

  // Status counts for cards
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: requests.length,
      PENDING: 0,
      APPROVED: 0,
      RETURNED: 0,
      COMPLETED: 0,
    };
    for (const req of requests) {
      if (counts[req.status] !== undefined) counts[req.status]++;
    }
    return counts;
  }, [requests]);

  // Only allow certain roles
  const allowedRoles = ["DISTRIBUTOR", "HEAD_OF_DISTRIBUTOR", "ADMIN"];
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-red-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Access Denied</h3>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // Approve handler
  const handleApprove = async (request: RentalMaintenanceRequest) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      // 1. Approve the request
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rental-maintenance/${request.id}/approve`,
        { approvedById: currentUser.myUsername || currentUser.name },
        { headers: { "Content-Type": "application/json" } }
      );
      // 2. Update car status based on requestType
      if (request.requestType === "MAINTENANCE") {
        await updateCarStatus(request, "Maintenance");
      } else if (request.requestType === "SERVICE") {
        await updateCarStatus(request, "Service");
      }
      // 3. Update UI
      setRequests((prev) => prev.map((req) => (req.id === request.id ? response.data : req)));
      if (selectedRequest?.id === request.id) setSelectedRequest(response.data);
      Swal.fire({
        title: "Approved!",
        text: "Maintenance request has been approved.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg",
        },
      });

           //add notification
     try {
      await addNotification(
        `New request has been approved }`,
        `/tms/admin/car-management/Rent-maintenance-request/driver-request`,
        'DRIVER'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }

    } catch (error) {
      setApiError("Failed to approve request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accept returned handler (mark as completed)
  const handleAcceptReturned = async (request: RentalMaintenanceRequest) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      // 1. Mark as completed
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rental-maintenance/${request.id}/return`,
        new Date().toISOString(),
        { headers: { "Content-Type": "application/json" } }
      );
      // 2. Update car status to InspectedAndReady
      await updateCarStatus(request, "InspectedAndReady");
      // 3. Update UI
      setRequests((prev) => prev.map((req) => (req.id === request.id ? response.data : req)));
      if (selectedRequest?.id === request.id) setSelectedRequest(response.data);
      Swal.fire({
        title: "Completed!",
        text: "Request marked as completed and car status updated.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg",
        },
      });

            //add notification
     try {
      await addNotification(
        `Return request has been accepted }`,
        `/tms/admin/car-management/Rent-maintenance-request/driver-request`,
        'DRIVER'
      );
    } catch (notificationError) {
      console.error('Failed to add notification:', notificationError);
      // Optionally show error to user
    }

    } catch (error) {
      setApiError("Failed to complete request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update car status based on carType
  const updateCarStatus = async (request: RentalMaintenanceRequest, newStatus: string) => {
    const plate = request.plateNumber;
    if (!plate) return;
    const reqBody = { status: newStatus };
    try {
      if (request.carType === "rent") {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/status/${plate}`,
          reqBody,
          { headers: { "Content-Type": "application/json" } }
        );
      } else if (request.carType === "organization") {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/status/${plate}`,
          reqBody,
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        // default to car
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/status/${plate}`,
          reqBody,
          { headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      // Optionally handle error
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        status === "PENDING"
          ? "bg-yellow-100 text-yellow-800"
          : status === "APPROVED"
          ? "bg-blue-100 text-blue-800"
          : status === "RETURNED"
          ? "bg-purple-100 text-purple-800"
          : "bg-green-100 text-green-800"
      }`}
    >
      {status}
    </span>
  );

  // Detail item component for modal
  const DetailItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
        {icon} <span className="ml-2">{label}</span>
      </label>
      <div className="p-2 bg-gray-50 rounded-lg">{value}</div>
    </div>
  );

  // Status cards config with counts
  const statusStats = [
    {
      key: "ALL",
      label: "All",
      icon: <FiActivity className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      count: statusCounts.ALL,
    },
    {
      key: "PENDING",
      label: "Pending",
      icon: <FiClock className="h-5 w-5" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      count: statusCounts.PENDING,
    },
    {
      key: "APPROVED",
      label: "Approved",
      icon: <FiCheckCircle className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      count: statusCounts.APPROVED,
    },
    {
      key: "RETURNED",
      label: "Returned",
      icon: <FiRepeat className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      count: statusCounts.RETURNED,
    },
    {
      key: "COMPLETED",
      label: "Completed",
      icon: <FiAward className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      count: statusCounts.COMPLETED,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-4 sm:p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Rental Maintenance Requests
      </h2>
      {/* Info Banner */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <FiInfo className="text-blue-500 mr-2" />
          <p className="text-blue-700">
            As a distributor, you can view and approve/accept maintenance requests.
          </p>
        </div>
      </div>
      {/* Responsive Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end mb-4">
        <div className="w-full sm:w-auto sm:min-w-[250px] md:min-w-[320px] lg:min-w-[400px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by plate, driver, requester..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
      {/* Animated Status Cards + Request Type Dropdown */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {statusStats.map((stat, idx) => (
          <motion.div
            key={stat.key}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.07 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`rounded-lg p-3 cursor-pointer flex flex-col items-start justify-between transition-all border ${
              statusFilter === stat.key
                ? "ring-2 ring-blue-500 bg-white shadow-md"
                : "bg-white shadow-sm"
            }`}
            onClick={() => setStatusFilter(stat.key as any)}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <div className={`p-2 rounded-full ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <span className="mt-2 text-lg font-bold text-gray-800">{stat.count}</span>
          </motion.div>
        ))}
        {/* 6th card: Request Type Dropdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: statusStats.length * 0.07 }}
          className={`rounded-lg p-3 flex items-center justify-between bg-white shadow-sm border`}
        >
          <div>
            <p className="text-xs font-medium text-gray-500">Request Type</p>
          </div>
          <div className="flex items-center gap-1">
            <FiFilter className="text-blue-400 mr-1" />
            <select
              value={requestTypeFilter}
              onChange={(e) => setRequestTypeFilter(e.target.value as any)}
              className="bg-transparent outline-none text-sm font-semibold"
            >
              {requestTypeOptions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </motion.div>
      {/* Requests Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <FiTool className="mr-2" />
          Requests
        </h3>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 max-w-md mx-auto">
              <FiAlertCircle className="mx-auto text-3xl mb-4 text-yellow-500" />
              <h4 className="font-medium text-lg mb-2">No Requests Found</h4>
              <p>No maintenance requests match your filters.</p>
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
                    Request Type
                  </th>
                  {/* Show Return Date and Date Diff if status is RETURNED */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {statusFilter === "RETURNED" || filteredRequests.some(r => r.status === "RETURNED") ? "Return Date" : ""}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {statusFilter === "RETURNED" || filteredRequests.some(r => r.status === "RETURNED") ? "Date Diff (days)" : ""}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.requestType || "-"}
                    </td>
                    {/* Show Return Date and Date Diff only if status is RETURNED */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === "RETURNED" && request.returnDate
                        ? new Date(request.returnDate).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === "RETURNED"
                        ? getDateDiffDays(request.serviceDate, request.returnDate)
                        : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {request.status === "PENDING" && (
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={isSubmitting}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      )}
                      {request.status === "RETURNED" && (
                        <button
                          onClick={() => handleAcceptReturned(request)}
                          disabled={isSubmitting}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Accept Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
                    {/* Show Return Date and Date Diff if status is RETURNED */}
                    {selectedRequest.status === "RETURNED" && selectedRequest.returnDate && (
                      <>
                        <DetailItem
                          icon={<FiCalendar />}
                          label="Return Date"
                          value={new Date(selectedRequest.returnDate).toLocaleDateString()}
                        />
                        <DetailItem
                          icon={<FiAward />}
                          label="Date Difference (days)"
                          value={getDateDiffDays(selectedRequest.serviceDate, selectedRequest.returnDate)}
                        />
                      </>
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
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {selectedRequest.status === "PENDING" && (
                      <button
                        onClick={() => {
                          handleApprove(selectedRequest);
                          setShowDetailsModal(false);
                        }}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-white font-medium ${
                          isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isSubmitting ? "Approving..." : "Approve Request"}
                      </button>
                    )}
                    {selectedRequest.status === "RETURNED" && (
                      <button
                        onClick={() => {
                          handleAcceptReturned(selectedRequest);
                          setShowDetailsModal(false);
                        }}
                        disabled={isSubmitting}
                        className={`px-4 py-2 rounded-lg text-white font-medium ${
                          isSubmitting ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {isSubmitting ? "Accepting..." : "Accept Returned"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}