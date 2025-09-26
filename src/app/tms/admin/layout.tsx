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

// 1. Explicit URL permissions for each role
const roleAccessMap = {
  ADMIN: [
    '/tms/admin/*',
    'http://172.20.137.176:3000/admin',
    '/tms/admin/Location'
  ],
  DRIVER: [
    '/tms/admin',
    '/tms/admin/car-management',
    '/tms/admin/car-management/view-assigned-employee',
    '/tms/admin/car-management/maintenance',
    '/tms/admin/request-management',
    '/tms/admin/request-management/request-field',
    '/tms/admin/car-management/Rental-maintenace-request/driver-request', 
    '/tms/admin/vehicle-map-view',
    '/tms/admin/parking-management/view-parking',
    '/tms/admin/qr-code-generator'
  ],
  DISTRIBUTOR: [
    '/tms/admin/car-management/Rental-maintenace-request',
    '/tms/admin/Location',
    'http://172.20.137.176:3000/admin',
    '/tms/admin',
    '/tms/admin/car-management/service-route-assign/assigned-employees-list',
    '/tms/admin/car-management/assign-car/view-assignment/*',
    '/tms/admin/car-management/manage-cars/view-car/*',
    '/tms/admin/car-management',
    '/tms/admin/request-management/request-field',
    '/tms/admin/car-management/manage-cars',
    '/tms/admin/car-management/assign-car',
    '/tms/admin/car-management/service-route-assign',
    '/tms/admin/car-management/Avaliable-seats',
    '/tms/admin/car-management/car-attendance',
    '/tms/admin/car-management/maintenance',
    '/tms/admin/request-management',
    '/tms/admin/vehicle-map-view',
    '/tms/admin/parking-management/view-parking',
    '/tms/admin/complaint-management',
    '/tms/admin/complaint-management/view-complaints',
    '/tms/admin/reports',
    '/tms/admin/reports/car-reports',
    '/tms/admin/reports/assignment-reports',
    '/tms/admin/reports/field-searvice-reports',
    '/tms/admin/reports/daily-service-reports',
    '/tms/admin/reports/constant-service-reports',
    '/tms/admin/reports/car-acceptance-reports'
  ],
  INSPECTOR: [
    '/tms/admin',
    '/tms/admin/car-management',
    '/tms/admin/car-management/vehicle-inspection/*',
    '/tms/admin/car-management/maintenance',
    '/tms/admin/car-management/update-maintenance-record/*',
    '/tms/admin/car-management/approved-maintenance-requests',
    '/tms/admin/car-management/fuel-oil-grease-request',
    '/tms/admin/car-management/foc-form',
    '/tms/admin/reports/inspection-reports'
  ],
  HEAD_OF_MECHANIC: [
    '/tms/admin',
    '/tms/admin/car-management',
    '/tms/admin/car-management/maintenance',
    '/tms/admin/car-management/fuel-oil-grease-request',
    '/tms/admin/car-management/foc-form'
  ],
  NEZEK: [
    '/tms/admin',
    '/tms/admin/car-management',
    '/tms/admin/car-management/fuel-oil-grease-request',
    '/tms/admin/car-management/foc-form',
    '/tms/admin/request-management'
  ],
  CORPORATOR: [
    '/tms/admin',
    '/tms/admin/request-management',
    '/tms/admin/request-management/request-field'
  ],
  USER: [
    '/tms/admin',
    '/tms/admin/request-management',
    '/tms/admin/request-management/request-field'
  ],
  HEAD_OF_DISTRIBUTOR: [
    '/tms/admin/car-management/Rental-maintenace-request',
    '/tms/admin/Location',
    'http://172.20.137.176:3000/admin',
    '/tms/admin',
    '/tms/admin/car-management/service-route-assign/assigned-employees-list',
    '/tms/admin/car-management/assign-car/view-assignment/*',
    '/tms/admin/car-management/manage-cars/view-car/*',
    '/tms/admin/car-management',
    '/tms/admin/car-management/manage-cars',
    '/tms/admin/car-management/assign-car',
    '/tms/admin/car-management/service-route-assign',
    '/tms/admin/car-management/Avaliable-seats',
    '/tms/admin/car-management/car-attendance',
    '/tms/admin/car-management/maintenance',
    '/tms/admin/request-management',
    '/tms/admin/vehicle-map-view',
    '/tms/admin/parking-management/view-parking',
    '/tms/admin/complaint-management',
    '/tms/admin/complaint-management/view-complaints',
    '/tms/admin/reports',
    '/tms/admin/reports/car-reports',
    '/tms/admin/reports/assignment-reports',
    '/tms/admin/reports/field-searvice-reports',
    '/tms/admin/reports/daily-service-reports',
    '/tms/admin/reports/constant-service-reports',
    '/tms/admin/reports/car-acceptance-reports'
  ],
  EMPLOYEE: [
    '/tms/admin',
    '/tms/admin/vehicle-map-view'
  ]
};

// 2. Original sidebar items (for display only)
const allSidebarItems = [
  {
    title: 'Dashboard',
    link: '/tms/admin',
    icon: <FiHome />,
    roles: ['ADMIN', 'DISTRIBUTOR', 'NEZEK', 'INSPECTOR', 'CORPORATOR', 'HEAD_OF_MECHANIC', 'USER', 'DRIVER', 'HEAD_OF_DISTRIBUTOR']
  },
  {
    title: 'Car Management',
    icon: <FiTruck />,
    link: '/tms/admin/car-management',
    roles: ['ADMIN', 'DISTRIBUTOR', 'NEZEK', 'INSPECTOR', 'HEAD_OF_MECHANIC', 'DRIVER', 'HEAD_OF_DISTRIBUTOR'],
    subItems: [
      { 
        title: 'Manage Cars', 
        link: '/tms/admin/car-management/manage-cars', 
        icon: <FiTruck />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Assignment Details',
        link: '/tms/admin/car-management/view-assigned-employee', 
        icon: <FiTruck />,
        roles: ['DRIVER','ADMIN']
      },
      { 
        title: 'Vehicle Inspection', 
        link: '/tms/admin/car-management/vehicle-inspection', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'INSPECTOR','ADMIN']
      },
      { 
        title: 'Assign Cars', 
        link: '/tms/admin/car-management/assign-car', 
        icon: <FiUser />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR']
      },
      { 
        title: 'Assign Routes', 
        link: '/tms/admin/car-management/service-route-assign', 
        icon: <FiBox />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Avaliable seats', 
        link: '/tms/admin/car-management/Avaliable-seats', 
        icon: <FiAlertTriangle />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Car Attendance', 
        link: '/tms/admin/car-management/car-attendance', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Mantaine Cars', 
        link: '/tms/admin/car-management/maintenance', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'HEAD_OF_MECHANIC', 'DRIVER','INSPECTOR', 'DISTRIBUTOR']
      },
      { 
        title: 'Maintain Cars Log', 
        link: '/tms/admin/car-management/approved-maintenance-requests', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'INSPECTOR']
      },
      { 
        title: 'ነ.ዘ.ቅ', 
        link: '/tms/admin/car-management/fuel-oil-grease-request', 
        icon: <FiTool />,
        roles: ['ADMIN', 'NEZEK', 'HEAD_OF_MECHANIC', 'INSPECTOR']
      },
      { 
        title: 'NEZEKE Notification', 
        link: '/tms/admin/car-management/foc-form', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'NEZEK', 'HEAD_OF_MECHANIC', 'INSPECTOR']
      },
      { 
        title: 'Rental Maintenance', 
        link: '/tms/admin/car-management/Rental-maintenace-request', 
        icon: <FiTool />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      }, 
      { 
        title: 'Rental Maintenance', 
        link: '/tms/admin/car-management/Rental-maintenace-request/driver-request', 
        icon: <FiTool />,
        roles: [ 'DRIVER', 'ADMIN']
      }, 
           

    ],
  },
  {
    title: 'Request Management',
    icon: <FiFileText />,
    link: '/tms/admin/request-management',
    roles: ['ADMIN', 'DISTRIBUTOR', 'NEZEK', 'CORPORATOR', 'USER', 'DRIVER'],
    subItems: [
      { 
        title: 'Fuel Requests', 
        link: '/tms/admin/request-management', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'NEZEK',  'DISTRIBUTOR']
      },
      { 
        title: 'Service Requests', 
        link: '/tms/admin/request-management/request-field', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'CORPORATOR', 'USER', 'DRIVER', 'DISTRIBUTOR']
      },
    ],
  },
  {
    title: 'Vehicle Map View',
    icon: <FiBox />,
    link: '/tms/admin/vehicle-map-view',
    roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR', 'DRIVER', 'EMPLOYEE'],
    subItems: [
      { 
        title: 'View Vehicles',
        link: '/tms/admin/Location', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR', 'DRIVER', 'EMPLOYEE']
      },
      { 
        title: 'View Parking', 
        link: '/tms/admin/parking-management/view-parking', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR', 'DRIVER']
      },
       { 
        title: 'Generate QR Code', 
        link: '/tms/admin/qr-code-generator', 
        icon: <FiUser />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'DRIVER']
      },
    ],
  },
  {
    title: 'Complaint Management',
    icon: <FiAlertTriangle />,
    link: '/tms/admin/complaint-management',
    roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'],
    subItems: [
      { 
        title: 'View Complaints', 
        link: '/tms/admin/complaint-management/view-complaints', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR']
      },
    ],
  },
  {
    title: 'User Management',
    icon: <FiUsers />,
    link: '/tms/admin/user-management',
    roles: ['ADMIN'],
    subItems: [
      { 
        title: 'Manage Users', 
        link: '/tms/admin/user-management', 
        icon: <FiUser />,
        roles: ['ADMIN']
      },
      { 
        title: 'Add User', 
        link: '/tms/admin/user-management/add', 
        icon: <FiUser />,
        roles: ['ADMIN']
      },
    ],
  },
  {
    title: 'Reports',
    icon: <FiBarChart2 />,
    link: '/tms/admin/reports',
    roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'],
    subItems: [
      { 
        title: 'Car Inventory', 
        link: '/tms/admin/reports/car-reports', 
        icon: <FiTruck />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Inspections', 
        link: '/tms/admin/reports/inspection-reports', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'INSPECTOR']
      },
      { 
        title: 'Assignments', 
        link: '/tms/admin/reports/assignment-reports', 
        icon: <FiUser />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR']
      },
      { 
        title: 'Field Service', 
        link: '/tms/admin/reports/field-searvice-reports', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Day Service', 
        link: '/tms/admin/reports/daily-service-reports', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Daily Service', 
        link: '/tms/admin/reports/constant-service-reports', 
        icon: <FiSettings />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
      { 
        title: 'Car Attendance and Transfer', 
        link: '/tms/admin/reports/car-acceptance-reports', 
        icon: <FiBarChart2 />,
        roles: ['ADMIN', 'DISTRIBUTOR']
      },
    ],
  },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  // Track active tab state
  const [isActiveTab, setIsActiveTab] = useState(false);

    // Clear token on tab close and refresh
  //   useEffect(() => {
  //   // Set a flag when the page is first loaded
  //   sessionStorage.setItem('isPageActive', 'true');

  //   const handleTabClose = () => {
  //     // Only run when the tab is actually closing
  //     sessionStorage.removeItem('isPageActive');
  //     localStorage.removeItem('token');
  //     localStorage.removeItem('user');
  //   };

  //   // This will only fire when the tab is closed, not refreshed
  //   window.addEventListener('pagehide', handleTabClose);

  //   return () => {
  //     window.removeEventListener('pagehide', handleTabClose);
  //     // If we're here because of a refresh, restore the flag
  //     if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
  //       sessionStorage.setItem('isPageActive', 'true');
  //     }
  //   };
  // }, []);

  // // Clear token on tab close and refresh
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     // Clear the token when the tab is closing
  //     localStorage.removeItem('token');
  //     localStorage.removeItem('user');
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, []);

  // Single tab enforcement
  useEffect(() => {
    const channel = new BroadcastChannel('auth_channel');
    const tabId = Math.random().toString(36).substring(2, 15);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        channel.postMessage({ type: 'TAB_ACTIVE', tabId });
      }
    };

    channel.onmessage = (e) => {
      if (e.data.type === 'TAB_ACTIVE' && e.data.tabId !== tabId) {
        // Another tab is active
        localStorage.clear();
        channel.postMessage({ type: 'LOGOUT' });
        router.push('/');
      }
      if (e.data.type === 'LOGOUT') {
        localStorage.clear();
        router.push('/');
      }
    };

    // Claim this tab as active
    channel.postMessage({ type: 'TAB_ACTIVE', tabId });
    setIsActiveTab(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      channel.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  const isRouteAllowed = (path: string, role: string) => {
    const normalizedPath = path.replace(/\/$/, '');
    const allowedPaths = roleAccessMap[role as keyof typeof roleAccessMap] || [];
    
    return allowedPaths.some(allowedPath => {
      const normalizedAllowedPath = allowedPath.replace(/\/$/, '');
      if (normalizedPath === normalizedAllowedPath) return true;
      if (normalizedAllowedPath.endsWith('/*')) {
        return normalizedPath.startsWith(normalizedAllowedPath.slice(0, -2));
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
    const checkAuth = async () => {
      try {
        if (!isActiveTab) return;

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
            text: `Your can only access ${role} pages. `,
            icon: 'warning',
          });
          router.push(roleAccessMap[role as keyof typeof roleAccessMap]?.[0] || '/');
        }
      } catch (error) {
        localStorage.clear();
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, isActiveTab]);

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
                {/* <p className="text-red-500">You don't have permission to view this page</p> */}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}