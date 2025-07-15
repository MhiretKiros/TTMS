"use client";
import Sidebar from '@/app/component/Sidebar';
import Header from '@/app/component/Header';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FiHome, FiTruck, FiSettings, FiClipboard,
  FiBox, FiAlertTriangle, FiBarChart2, FiUser, FiFileText, FiTool, FiUsers
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Footer from '@/app/component/Footer';

// Define all possible sidebar items
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
    title: 'Parking Management',
    icon: <FiBox />,
    link: '/tms-modules/admin/parking-management',
    roles: ['ADMIN'],
    subItems: [
      { 
        title: 'View Parking', 
        link: '/tms-modules/admin/parking-management/view-parking', 
        icon: <FiClipboard />,
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'
      , 'DRIVER']
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
        roles: ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'
      ]
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          throw new Error('No authentication found');
        }

        const parsedUser = JSON.parse(storedUser);
        
        if (!parsedUser || !parsedUser.email || !parsedUser.role) {
          throw new Error('Invalid user data');
        }

        // Set user role
        setUserRole(parsedUser.role.toUpperCase());
        setAuthChecked(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        
        if (!pathname.includes('/tms-modules')) {
          await Swal.fire({
            title: 'Session Expired',
            text: 'Please login again',
            icon: 'error',
            confirmButtonColor: '#3c8dbc'
          });
        }
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshedToken');
        
        router.push('/tms-modules');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Filter sidebar items based on user role
  const getFilteredSidebarItems = () => {
    if (!userRole) return [];
    
    return allSidebarItems
      .filter(item => item.roles.includes(userRole))
      .map(item => {
        if (item.subItems) {
          return {
            ...item,
            subItems: item.subItems.filter(subItem => subItem.roles.includes(userRole))
          };
        }
        return item;
      })
      .filter(item => {
        // Remove parent items that have no subItems after filtering
        if (item.subItems) {
          return item.subItems.length > 0;
        }
        return true;
      });
  };

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

  if (!authChecked) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-1">
        <div className={`fixed top-0 left-0 h-full transition-all duration-300 shadow-md z-50 overflow-y-auto ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <Sidebar 
            items={getFilteredSidebarItems()} 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            activeColor="#3c8dbc"
          />
        </div>
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <Header 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
            {children}
          </main>

          <Footer />
        </div>
      </div>
      
    </div>
  );
}