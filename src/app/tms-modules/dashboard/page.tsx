'use client';
import { useEffect, useState } from 'react';
import { 
  FiTruck, FiUsers, FiClipboard, FiCheckCircle, 
  FiPlusCircle, FiSettings, FiAlertTriangle, 
  FiTool, FiFileText, FiCalendar, FiMapPin 
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Swal from 'sweetalert2';

// Role-specific data types
type MaintenanceRequest = {
  id: string;
  vehicleId: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedDate: string;
};

type FuelRequest = {
  id: string;
  vehicleId: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Completed';
  requestedDate: string;
};

type Assignment = {
  id: string;
  vehicleId: string;
  driverId?: string;
  startDate: string;
  endDate: string;
  status: string;
};

type Vehicle = {
  id: string;
  plateNumber: string;
  model: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  lastInspectionDate?: string;
};

const roleCards = {
  NEZEK: [
    { 
      title: 'Fuel Requests', 
      count: 0,
      icon: <FiTool />,
      link: '/tms-modules/admin/car-management/fuel-oil-grease-request',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Maintenance Requests', 
      count: 0,
      icon: <FiSettings />,
      link: '/tms-modules/admin/car-management/maintenance',
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      title: 'Vehicle Inspections', 
      count: 0,
      icon: <FiCheckCircle />,
      link: '/tms-modules/admin/car-management/vehicle-inspection',
      color: 'bg-green-100 text-green-600'
    }
  ],
  INSPECTOR: [
    { 
      title: 'Pending Inspections', 
      count: 0,
      icon: <FiCheckCircle />,
      link: '/tms-modules/admin/car-management/vehicle-inspection',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Completed Inspections', 
      count: 0,
      icon: <FiClipboard />,
      link: '/tms-modules/admin/reports/inspection-reports',
      color: 'bg-green-100 text-green-600'
    },
    { 
      title: 'Maintenance Logs', 
      count: 0,
      icon: <FiSettings />,
      link: '/tms-modules/admin/car-management/approved-maintenance-requests',
      color: 'bg-purple-100 text-purple-600'
    }
  ],
  CORPORATOR: [
    { 
      title: 'Service Requests', 
      count: 0,
      icon: <FiFileText />,
      link: '/tms-modules/admin/request-management/request-field',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Approved Requests', 
      count: 0,
      icon: <FiCheckCircle />,
      link: '/tms-modules/admin/request-management',
      color: 'bg-green-100 text-green-600'
    }
  ],
  HEAD_OF_MECHANIC: [
    { 
      title: 'Maintenance Requests', 
      count: 0,
      icon: <FiSettings />,
      link: '/tms-modules/admin/car-management/maintenance',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Parts Inventory', 
      count: 0,
      icon: <FiTool />,
      link: '/tms-modules/admin/car-management/fuel-oil-grease-request',
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      title: 'Completed Maintenance', 
      count: 0,
      icon: <FiCheckCircle />,
      link: '/tms-modules/admin/car-management/approved-maintenance-requests',
      color: 'bg-green-100 text-green-600'
    }
  ],
  USER: [
    { 
      title: 'My Requests', 
      count: 0,
      icon: <FiFileText />,
      link: '/tms-modules/admin/request-management/request-field',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Approved Requests', 
      count: 0,
      icon: <FiCheckCircle />,
      link: '/tms-modules/admin/request-management',
      color: 'bg-green-100 text-green-600'
    }
  ],
  DRIVER: [
    { 
      title: 'Current Assignment', 
      count: 0,
      icon: <FiTruck />,
      link: '/tms-modules/admin/car-management/view-assigned-employee',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Vehicle Status', 
      count: 0,
      icon: <FiCheckCircle />,
      link: '/tms-modules/admin/car-management/maintenance',
      color: 'bg-green-100 text-green-600'
    },
    { 
      title: 'Trip History', 
      count: 0,
      icon: <FiMapPin />,
      link: '/tms-modules/admin/vehicle-map-view',
      color: 'bg-purple-100 text-purple-600'
    }
  ]
};

const roleRecentActivities = {
  NEZEK: [
    { type: 'Fuel Request', status: 'Pending', date: '2023-05-15', id: 'FR-001' },
    { type: 'Maintenance Approval', status: 'Approved', date: '2023-05-14', id: 'MA-023' }
  ],
  INSPECTOR: [
    { type: 'Vehicle Inspection', status: 'Completed', date: '2023-05-15', id: 'VI-456' },
    { type: 'Inspection Report', status: 'Submitted', date: '2023-05-14', id: 'IR-789' }
  ],
  // ... similar for other roles
};

export default function RoleDashboard() {
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [fuelRequests, setFuelRequests] = useState<FuelRequest[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) throw new Error('No user data');
        
        const parsedUser = JSON.parse(user);
        const role = parsedUser.role?.toUpperCase();
        
        if (!role) throw new Error('Invalid role');
        setUserRole(role);

        // Simulate fetching data based on role
        const mockData = await fetchRoleData(role);
        setMaintenanceRequests(mockData.maintenanceRequests);
        setFuelRequests(mockData.fuelRequests);
        setAssignments(mockData.assignments);
        setVehicles(mockData.vehicles);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load dashboard data',
          icon: 'error'
        });
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchRoleData = async (role: string) => {
    // Simulate API calls with mock data
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        const mockData = {
          maintenanceRequests: [
            { id: 'MR-001', vehicleId: 'V-1001', type: 'Brakes', status: 'Pending', requestedDate: '2023-05-15' }
          ],
          fuelRequests: [
            { id: 'FR-001', vehicleId: 'V-1001', amount: 50, status: 'Pending', requestedDate: '2023-05-14' }
          ],
          assignments: [
            { id: 'A-001', vehicleId: 'V-1001', driverId: 'D-001', startDate: '2023-05-10', endDate: '2023-05-17', status: 'Active' }
          ],
          vehicles: [
            { id: 'V-1001', plateNumber: 'ABC123', model: 'Toyota Hilux', status: 'In Use' }
          ]
        };
        resolve(mockData);
      }, 500);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userRole || !roleCards[userRole as keyof typeof roleCards]) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Role Configuration</h1>
        <p className="mt-2">Your role does not have a dashboard configuration.</p>
      </div>
    );
  }

  const currentCards = roleCards[userRole as keyof typeof roleCards];
  const currentActivities = roleRecentActivities[userRole as keyof typeof roleRecentActivities] || [];

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {userRole} Dashboard
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <p className="text-blue-800 font-medium">{userRole}</p>
        </div>
      </div>

      {/* Role-specific Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentCards.map((card, index) => (
          <Link key={index} href={card.link}>
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl shadow-sm border ${card.color.split(' ')[0]} border-opacity-30 cursor-pointer transition-all`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.count}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color.split(' ')[0]} bg-opacity-20`}>
                  {card.icon}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activities</h2>
        <div className="space-y-4">
          {currentActivities.map((activity, index) => (
            <motion.div
              key={index}
              whileHover={{ x: 5 }}
              className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className={`p-2 rounded-full mr-4 ${
                activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                activity.status === 'Approved' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {activity.type.includes('Request') ? <FiFileText /> : 
                 activity.type.includes('Inspection') ? <FiCheckCircle /> : 
                 <FiClipboard />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.type}</p>
                <p className="text-sm text-gray-500">{activity.id} • {activity.status}</p>
              </div>
              <div className="text-sm text-gray-400">
                {new Date(activity.date).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Role-specific Additional Sections */}
      {userRole === 'DRIVER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Assignment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Current Assignment</h2>
            {assignments.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="font-medium">Vehicle</p>
                  <p>{vehicles.find(v => v.id === assignments[0].vehicleId)?.plateNumber || 'N/A'}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-medium">Duration</p>
                  <p>
                    {new Date(assignments[0].startDate).toLocaleDateString()} - 
                    {new Date(assignments[0].endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="font-medium">Status</p>
                  <p className={`px-2 py-1 rounded-full text-xs ${
                    assignments[0].status === 'Active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {assignments[0].status}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No current assignments</p>
            )}
          </div>

          {/* Vehicle Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Vehicle Status</h2>
            {vehicles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="font-medium">Model</p>
                  <p>{vehicles[0].model}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-medium">Plate Number</p>
                  <p>{vehicles[0].plateNumber}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-medium">Status</p>
                  <p className={`px-2 py-1 rounded-full text-xs ${
                    vehicles[0].status === 'Available' ? 'bg-green-100 text-green-800' :
                    vehicles[0].status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vehicles[0].status}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No vehicle assigned</p>
            )}
          </div>
        </div>
      )}

      {userRole === 'NEZEK' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Pending Approvals</h2>
            <div className="space-y-4">
              {fuelRequests.filter(fr => fr.status === 'Pending').map((request, index) => (
                <div key={index} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Fuel Request #{request.id}</p>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Vehicle: {request.vehicleId}</p>
                    <p>{request.amount} L</p>
                  </div>
                </div>
              ))}
              {maintenanceRequests.filter(mr => mr.status === 'Pending').map((request, index) => (
                <div key={index} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Maintenance #{request.id}</p>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>{request.type}</p>
                    <p>Vehicle: {request.vehicleId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Approvals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Approvals</h2>
            <div className="space-y-4">
              {fuelRequests.filter(fr => fr.status !== 'Pending').map((request, index) => (
                <div key={index} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Fuel Request #{request.id}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Vehicle: {request.vehicleId}</p>
                    <p>{request.amount} L</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userRole === 'DRIVER' && (
            <>
              <Link href="/tms-modules/admin/car-management/maintenance">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-gray-200 rounded-lg text-center cursor-pointer"
                >
                  <div className="text-blue-600 text-2xl mb-2">
                    <FiSettings />
                  </div>
                  <p>Report Issue</p>
                </motion.div>
              </Link>
              <Link href="/tms-modules/admin/request-management/request-field">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-gray-200 rounded-lg text-center cursor-pointer"
                >
                  <div className="text-blue-600 text-2xl mb-2">
                    <FiFileText />
                  </div>
                  <p>Request Service</p>
                </motion.div>
              </Link>
            </>
          )}
          {userRole === 'NEZEK' && (
            <>
              <Link href="/tms-modules/admin/car-management/fuel-oil-grease-request">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-4 border border-gray-200 rounded-lg text-center cursor-pointer"
                >
                  <div className="text-blue-600 text-2xl mb-2">
                    <FiTool />
                  </div>
                  <p>Fuel Approvals</p>
                </motion.div>
              </Link>
            </>
          )}
          {/* Add more role-specific quick actions as needed */}
        </div>
      </div>
    </div>
  );
}