// app/tms-modules/admin/request-management/service/[id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiHome, FiMapPin, FiCalendar, FiBriefcase, FiTruck } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { fetchServiceRequestById } from '../../api';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

interface ServiceRequest {
  id: number;
  employeeId: string;
  fullName: string;
  department: string;
  phoneNumber: string;
  email: string;
  homeLocation: string;
  pickupLocation: string;
  preferredTime: string;
  returnTime?: string;
  purpose: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  assignedCar?: string;
  driverName?: string;
  notes?: string;
  carType: string;
  createdBy?: string;
  approver?: string;
  budgetCode?: string;
  requestType?: 'DAILY' | 'OCCASIONAL';
  passengers?: number;
  additionalRequirements?: string;
  approvalDate?: string;
  rejectionReason?: string;
  completionDate?: string;
}

export default function ServiceRequestView() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const response = await fetchServiceRequestById(Number(id));
        setRequest(response.serviceRequest);
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load service request',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Service request not found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FiArrowLeft className="mr-1" /> Back to Requests
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Service Request Details</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Employee Information */}
          <div className="border-b md:border-b-0 md:border-r border-gray-200 pr-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiUser className="mr-2" /> Employee Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{request.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{request.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{request.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium flex items-center">
                  <FiPhone className="mr-1" /> {request.phoneNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium flex items-center">
                  <FiMail className="mr-1" /> {request.email}
                </p>
              </div>
              {request.createdBy && (
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium">{request.createdBy}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiBriefcase className="mr-2" /> Trip Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Home Location</p>
                <p className="font-medium flex items-center">
                  <FiHome className="mr-1" /> {request.homeLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-medium flex items-center">
                  <FiMapPin className="mr-1" /> {request.pickupLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Time</p>
                <p className="font-medium flex items-center">
                  <FiCalendar className="mr-1" /> {request.preferredTime}
                </p>
              </div>
              {request.returnTime && (
                <div>
                  <p className="text-sm text-gray-500">Return Time</p>
                  <p className="font-medium flex items-center">
                    <FiCalendar className="mr-1" /> {request.returnTime}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="font-medium">{request.purpose}</p>
              </div>
              {request.requestType && (
                <div>
                  <p className="text-sm text-gray-500">Request Type</p>
                  <p className="font-medium">{request.requestType}</p>
                </div>
              )}
              {request.passengers && (
                <div>
                  <p className="text-sm text-gray-500">Passengers</p>
                  <p className="font-medium">{request.passengers}</p>
                </div>
              )}
              {request.carType && (
                <div>
                  <p className="text-sm text-gray-500">Preferred Car Type</p>
                  <p className="font-medium flex items-center">
                    <FiTruck className="mr-1" /> {request.carType}
                  </p>
                </div>
              )}
              {request.additionalRequirements && (
                <div>
                  <p className="text-sm text-gray-500">Additional Requirements</p>
                  <p className="font-medium">{request.additionalRequirements}</p>
                </div>
              )}
              {request.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium">{request.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${
                  request.status === 'Pending' ? 'text-yellow-600' :
                  request.status === 'Approved' ? 'text-green-600' :
                  request.status === 'Rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {request.status}
                </p>
              </div>
              {request.approver && (
                <div>
                  <p className="text-sm text-gray-500">Approver</p>
                  <p className="font-medium">{request.approver}</p>
                </div>
              )}
              {request.assignedCar && (
                <div>
                  <p className="text-sm text-gray-500">Assigned Car</p>
                  <p className="font-medium">{request.assignedCar}</p>
                </div>
              )}
              {request.driverName && (
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium">{request.driverName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}