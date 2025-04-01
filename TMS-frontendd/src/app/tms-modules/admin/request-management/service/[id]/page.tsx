// app/tms-modules/admin/request-management/service/[id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiUser, FiPhone, FiMapPin, FiCalendar, FiInfo } from 'react-icons/fi';

export default function ServiceRequestView() {
  const router = useRouter();
  const { id } = useParams();

  // Mock data - replace with API call
  const request = {
    id: 1,
    employeeId: 'EMP001',
    fullName: 'John Doe',
    department: 'Software Development',
    phoneNumber: '1234567890',
    email: 'john.doe@example.com',
    pickupLocation: 'Main Office',
    destination: 'Client Site A',
    preferredTime: '08:00 AM',
    returnTime: '05:00 PM',
    purpose: 'Client meeting',
    carType: 'Sedan',
    status: 'Pending',
    createdAt: '2023-05-15',
    assignedCar: null,
    notes: 'Need car with GPS'
  };

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
                <p className="font-medium">{request.email}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiInfo className="mr-2" /> Request Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-medium">{request.pickupLocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium">{request.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Time</p>
                <p className="font-medium">{request.preferredTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Return Time</p>
                <p className="font-medium">{request.returnTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="font-medium">{request.purpose}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Car Type</p>
                <p className="font-medium">{request.carType}</p>
              </div>
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
              {request.notes && (
                <div>
                  <p className="text-sm text-gray-500">Additional Notes</p>
                  <p className="font-medium">{request.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}