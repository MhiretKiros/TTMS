// app/tms-modules/admin/request-management/travel/[id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiUser, FiMapPin, FiCalendar, FiBriefcase } from 'react-icons/fi';

export default function TravelRequestView() {
  const router = useRouter();
  const { id } = useParams();

  // Mock data - replace with API call
  const request = {
    id: 1,
    travelerName: 'Mike Johnson',
    employeeId: 'EMP002',
    department: 'Sales',
    startDate: '2023-05-20',
    endDate: '2023-05-21',
    reason: 'Annual client review',
    travelDistance: '120 km',
    carType: 'SUV',
    passengers: 3,
    approver: 'Sarah Williams',
    budgetCode: 'SALES-2023-05',
    claimantName: 'Mike Johnson',
    teamLeaderName: 'David Brown',
    status: 'Approved',
    createdAt: '2023-05-10',
    assignedCar: 'XYZ-789'
  };

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FiArrowLeft className="mr-1" /> Back to Requests
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Travel Request Details</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Travel Information */}
          <div className="border-b md:border-b-0 md:border-r border-gray-200 pr-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiUser className="mr-2" /> Travel Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Traveler Name</p>
                <p className="font-medium">{request.travelerName}</p>
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
                <p className="text-sm text-gray-500">Travel Reason</p>
                <p className="font-medium">{request.reason}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Travel Distance</p>
                <p className="font-medium">{request.travelDistance}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Car Type</p>
                <p className="font-medium">{request.carType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passengers</p>
                <p className="font-medium">{request.passengers}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiBriefcase className="mr-2" /> Trip Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">
                  {new Date(request.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">
                  {new Date(request.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Approver</p>
                <p className="font-medium">{request.approver}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Claimant</p>
                <p className="font-medium">{request.claimantName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Team Leader</p>
                <p className="font-medium">{request.teamLeaderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget Code</p>
                <p className="font-medium">{request.budgetCode}</p>
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
              <div>
                <p className="text-sm text-gray-500">Assigned Car</p>
                <p className="font-medium">
                  {request.assignedCar || 'Not assigned'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}