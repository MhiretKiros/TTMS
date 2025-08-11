"use client";
import Sidebar from '@/app/component/Sidebar';
import Header from '@/app/component/Header';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FiHome, FiTruck, FiSettings, FiClipboard,
  FiBox, FiAlertTriangle, FiBarChart2, FiUser, FiFileText, FiTool, FiUsers
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Footer from '@/app/component/Footer';

const roleAccessMap = {
  ADMIN: [
    '/tms-modules/admin/*',
    'http://172.20.137.176:3000/admin',
    '/tms-modules/admin/Location'
  ],
  DRIVER: [
    '/tms-modules/admin',
    '/tms-modules/admin/car-management',
    '/tms-modules/admin/car-management/view-assigned-employee',
    '/tms-modules/admin/car-management/maintenance',
    '/tms-modules/admin/request-management',
    '/tms-modules/admin/request-management/request-field',
    '/tms-modules/admin/vehicle-map-view',
    '/tms-modules/admin/parking-management/view-parking',
    '/tms-modules/admin/qr-code-generator'
  ],
  DISTRIBUTOR: [
    '/tms-modules/admin/car-management/Rental-maintenace-request',
    '/tms-modules/admin/Location',
    'http://172.20.137.176:3000/admin',
    '/tms-modules/admin',
    '/tms-modules/admin/car-management/service-route-assign/assigned-employees-list',
    '/tms-modules/admin/car-management/assign-car/view-assignment/*',
    '/tms-modules/admin/car-management/manage-cars/view-car/*',
    '/tms-modules/admin/car-management',
    '/tms-modules/admin/car-management/manage-cars',
    '/tms-modules/admin/car-management/assign-car',
    '/tms-modules/admin/car-management/service-route-assign',
    '/tms-modules/admin/car-management/Avaliable-seats',
    '/tms-modules/admin/car-management/car-attendance',
    '/tms-modules/admin/car-management/maintenance',
    '/tms-modules/admin/request-management',
    '/tms-modules/admin/vehicle-map-view',
    '/tms-modules/admin/parking-management/view-parking',
    '/tms-modules/admin/complaint-management',
    '/tms-modules/admin/complaint-management/view-complaints',
    '/tms-modules/admin/reports',
    '/tms-modules/admin/reports/car-reports',
    '/tms-modules/admin/reports/assignment-reports',
    '/tms-modules/admin/reports/field-searvice-reports',
    '/tms-modules/admin/reports/daily-service-reports',
    '/tms-modules/admin/reports/constant-service-reports',
    '/tms-modules/admin/reports/car-acceptance-reports'
  ],
  INSPECTOR: [
    '/tms-modules/admin',
    '/tms-modules/admin/car-management',
    '/tms-modules/admin/car-management/vehicle-inspection/*',
    '/tms-modules/admin/car-management/maintenance',
    '/tms-modules/admin/car-management/approved-maintenance-requests',
    '/tms-modules/admin/car-management/fuel-oil-grease-request',
    '/tms-modules/admin/car-management/foc-form',
    '/tms-modules/admin/reports/inspection-reports'
  ],
  HEAD_OF_MECHANIC: [
    '/tms-modules/admin',
    '/tms-modules/admin/car-management',
    '/tms-modules/admin/car-management/maintenance',
    '/tms-modules/admin/car-management/fuel-oil-grease-request',
    '/tms-modules/admin/car-management/foc-form'
  ],
  NEZEK: [
    '/tms-modules/admin',
    '/tms-modules/admin/car-management',
    '/tms-modules/admin/car-management/fuel-oil-grease-request',
    '/tms-modules/admin/car-management/foc-form',
    '/tms-modules/admin/request-management'
  ],
  CORPORATOR: [
    '/tms-modules/admin',
    '/tms-modules/admin/request-management',
    '/tms-modules/admin/request-management/request-field'
  ],
  USER: [
    '/tms-modules/admin',
    '/tms-modules/admin/request-management',
    '/tms-modules/admin/request-management/request-field'
  ],
  HEAD_OF_DISTRIBUTOR: [
    '/tms-modules/admin/car-management/Rental-maintenace-request',
    '/tms-modules/admin/Location',
    '/tms-modules/admin/car-management/assign-car/view-assignment/*',
    '/tms-modules/admin',
    '/tms-modules/admin/car-management',
    '/tms-modules/admin/car-management/assign-car',
    '/tms-modules/admin/vehicle-map-view',
    '/tms-modules/admin/parking-management/view-parking',
    '/tms-modules/admin/complaint-management',
    '/tms-modules/admin/complaint-management/view-complaints',
    '/tms-modules/admin/reports',
    '/tms-modules/admin/reports/assignment-reports'
  ],
  EMPLOYEE: [
    '/tms-modules/admin',
    '/tms-modules/admin/vehicle-map-view'
  ]
};

// 2. Original sidebar items (for display only)
const allSidebarItems = [
  {
    title: 'Dashboard',
    link: '/tms-modules/admin',
    icon: <FiHome />,
    roles: ['ADMIN', 'DISTRIBUTOR', 'NEZEK', 'INSPECTOR', 'CORPORATOR', 'HEAD_OF_MECHANIC', 'USER', 'DRIVER', 'HEAD_OF_DISTRIBUTOR']
  },
  {
    title: 'Car Management',
    icon: <FiTruck />,
    link: '/tms-modules/admin/car-management',
    roles: ['ADMIN', 'DISTRIBUTOR', 'NEZEK', 'INSPECTOR', 'HEAD_OF_MECHANIC', 'DRIVER', 'HEAD_OF_DISTRIBUTOR'],
    subItems: [
      { 
        title: 'Manage Cars', 
        link: '/tms-modules/admin/car-management/manage-cars', 
        icon: <FiTruck />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Assignment Details',
        link: '/tms-modules/admin/car-management/view-assigned-employee', 
        icon: <FiTruck />,
        roles: ['DRIVER']
      },
      { 
        title: 'Vehicle Inspection', 
        link: '/tms-modules/admin/car-management/vehicle-inspection', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'INSPECTOR']
      },
      { 
        title: 'Assign Cars', 
        link: '/tms-modules/admin/car-management/assign-car', 
        icon: <FiUser />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR']
      },
      { 
        title: 'Assign Routes', 
        link: '/tms-modules/admin/car-management/service-route-assign', 
        icon: <FiBox />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Avaliable seats', 
        link: '/tms-modules/admin/car-management/Avaliable-seats', 
        icon: <FiAlertTriangle />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Car Attendance', 
        link: '/tms-modules/admin/car-management/car-attendance', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Mantaine Cars', 
        link: '/tms-modules/admin/car-management/maintenance', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'HEAD_OF_MECHANIC', 'DRIVER','INSPECTOR', 'DISTRIBUTOR']
      },
      { 
        title: 'Maintain Cars Log', 
        link: '/tms-modules/admin/car-management/approved-maintenance-requests', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'INSPECTOR']
      },
      { 
        title: 'ነ.ዘ.ቅ', 
        link: '/tms-modules/admin/car-management/fuel-oil-grease-request', 
        icon: <FiTool />,
        roles: ['ADMIN', 'NEZEK', 'HEAD_OF_MECHANIC', 'INSPECTOR']
      },
      { 
        title: 'NEZEKE Notification', 
        link: '/tms-modules/admin/car-management/foc-form', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'NEZEK', 'HEAD_OF_MECHANIC', 'INSPECTOR']
      },
      { 
        title: 'Rental Maintenance', 
        link: '/tms-modules/admin/car-management/Rental-maintenace-request', 
        icon: <FiTool />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'DRIVER']
      }, 
    ],
  },
  {
    title: 'Request Management',
    icon: <FiFileText />,
    link: '/tms-modules/admin/request-management',
    roles: ['ADMIN', 'DISTRIBUTOR', 'NEZEK', 'CORPORATOR', 'USER', 'DRIVER'],
    subItems: [
      { 
        title: 'Fuel Requests', 
        link: '/tms-modules/admin/request-management', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'NEZEK', 'DISTRIBUTOR']
      },
      { 
        title: 'Service Requests', 
        link: '/tms-modules/admin/request-management/request-field', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'CORPORATOR', 'USER', 'DRIVER', 'DISTRIBUTOR']
      },
    ],
  },
  {
    title: 'Vehicle Map View',
    icon: <FiBox />,
    link: '/tms-modules/admin/vehicle-map-view',
    roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR', 'DRIVER', 'EMPLOYEE'],
    subItems: [
      { 
        title: 'View Vehicles',
        link: '/tms-modules/admin/Location', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR', 'DRIVER', 'EMPLOYEE']
      },
      { 
        title: 'View Parking', 
        link: '/tms-modules/admin/parking-management/view-parking', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR', 'DRIVER']
      },
       { 
        title: 'Generate QR Code', 
        link: '/tms-modules/admin/qr-code-generator', 
        icon: <FiUser />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'DRIVER']
      },
    ],
  },
  {
    title: 'Complaint Management',
    icon: <FiAlertTriangle />,
    link: '/tms-modules/admin/complaint-management',
    roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'],
    subItems: [
      { 
        title: 'View Complaints', 
        link: '/tms-modules/admin/complaint-management/view-complaints', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR']
      },
    ],
  },
  {
    title: 'User Management',
    icon: <FiUsers />,
    link: '/tms-modules/admin/user-management',
    roles: ['ADMIN'],
    subItems: [
      { 
        title: 'Manage Users', 
        link: '/tms-modules/admin/user-management', 
        icon: <FiUser />,
        roles: ['ADMIN']
      },
      { 
        title: 'Add User', 
        link: '/tms-modules/admin/user-management/add', 
        icon: <FiUser />,
        roles: ['ADMIN']
      },
    ],
  },
  {
    title: 'Reports',
    icon: <FiBarChart2 />,
    link: '/tms-modules/admin/reports',
    roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'],
    subItems: [
      { 
        title: 'Car Inventory', 
        link: '/tms-modules/admin/reports/car-reports', 
        icon: <FiTruck />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Inspections', 
        link: '/tms-modules/admin/reports/inspection-reports', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'INSPECTOR']
      },
      { 
        title: 'Assignments', 
        link: '/tms-modules/admin/reports/assignment-reports', 
        icon: <FiUser />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR']
      },
      { 
        title: 'Field Service', 
        link: '/tms-modules/admin/reports/field-searvice-reports', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Day Service', 
        link: '/tms-modules/admin/reports/daily-service-reports', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Daily Service', 
        link: '/tms-modules/admin/reports/constant-service-reports', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Car Attendance and Transfer', 
        link: '/tms-modules/admin/reports/car-acceptance-reports', 
        icon: <FiBarChart2 />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
    ],
  },
];


// ... (keep all your existing roleAccessMap and allSidebarItems definitions)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  // Track if this is the initial load
  const [initialLoad, setInitialLoad] = useState(true);

  const isRouteAllowed = (path: string, role: string) => {
    const normalizedPath = path.replace(/\/$/, '');
    const allowedPaths = roleAccessMap[role as keyof typeof roleAccessMap] || [];
    
    return allowedPaths.some(allowedPath => {
      const normalizedAllowedPath = allowedPath.replace(/\/$/, '');
      
      if (normalizedPath === normalizedAllowedPath) return true;
      
      if (normalizedAllowedPath.endsWith('/*')) {
        const basePath = normalizedAllowedPath.slice(0, -2);
        return normalizedPath.startsWith(basePath);
      }
      
      return false;
    });
  };

  const filteredSidebarItems = useMemo(() => {
    if (!userRole) return [];
    
    return allSidebarItems.filter(item => {
      const hasMainAccess = isRouteAllowed(item.link, userRole);
      const hasSubAccess = item.subItems?.some(sub => isRouteAllowed(sub.link, userRole));
      return hasMainAccess || hasSubAccess;
    }).map(item => ({
      ...item,
      subItems: item.subItems?.filter(sub => isRouteAllowed(sub.link, userRole))
    }));
  }, [userRole]);

  useEffect(() => {
    // Handle page refresh
    const handleBeforeUnload = () => {
      localStorage.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) throw new Error('No authentication');

        const parsedUser = JSON.parse(user);
        const role = parsedUser.role?.toUpperCase();
        
        if (!role) throw new Error('Invalid role');
        
        setUserRole(role);
        
        if (!isRouteAllowed(pathname, role)) {
          await Swal.fire({
            title: 'Access Denied',
            text: `Your role (${role}) cannot access ${pathname}`,
            icon: 'error'
          });
          router.push(roleAccessMap[role as keyof typeof roleAccessMap]?.[0] || '/tms-modules');
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.clear();
        router.push('/tms-modules');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    // Only check auth if it's not the initial load (page refresh)
    if (initialLoad) {
      localStorage.clear();
      router.push('/tms-modules');
    } else {
      checkAuth();
    }
  }, [pathname, router, initialLoad]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#3c8dbc] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-1">
        <div className={`fixed top-0 left-0 h-full transition-all duration-300 shadow-md z-50 overflow-y-auto ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <Sidebar 
            items={filteredSidebarItems} 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            activeColor="#3c8dbc"
          />
        </div>
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
            {isRouteAllowed(pathname, userRole) ? children : (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-500">You don't have permission to view this page</p>
              </div>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}