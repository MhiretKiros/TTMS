"use client";
import Sidebar from '@/app/component/Sidebar';
import Header from '@/app/component/Header';
import { useState } from 'react';
import {
  FiHome, FiTruck, FiSettings, FiClipboard,
  FiBox, FiAlertTriangle, FiBarChart2, FiUser, FiFileText,
} from 'react-icons/fi';

const sidebarItems = [
  {
    title: 'Dashboard',
    link: '/tms-modules/admin',
    icon: <FiHome />,
  },
  {
    title: 'Car Management',
    icon: <FiTruck />,
    link: '/tms-modules/admin/car-management',
    subItems: [
      { title: 'Manage Cars', link: '/tms-modules/admin/car-management/manage-cars', icon: <FiTruck /> },
      { title: 'Mantaine Cars', link: '/tms-modules/admin/car-management/maintenances', icon: <FiSettings /> },
      { title: 'Assign Routes', link: '/tms-modules/admin/car-management/service-route-assign', icon: <FiBox /> },
      { title: 'Assign Cars', link: '/tms-modules/admin/car-management/assign-car', icon: <FiUser /> },
      { title: 'Car Attendance', link: '/tms-modules/admin/car-management/car-attendance', icon: <FiClipboard /> },
      { title: 'Vehicle Inspection', link: '/tms-modules/admin/car-management/vehicle-inspection', icon: <FiSettings /> },
    ],
  },
  {
    title: 'Request Management',
    icon: <FiFileText />,
    link: '/tms-modules/admin/request-management',
    subItems: [
      { title: 'Fuel Requests', link: '/tms-modules/admin/request-management', icon: <FiSettings /> },
      { title: 'Service Requests', link: '/tms-modules/admin/request-management/request-field', icon: <FiSettings /> },
    ],
  },
  {
    title: 'Parking Management',
    icon: <FiBox />,
    link: '/tms-modules/admin/parking-management',
    subItems: [
      { title: 'View Parking', link: '/tms-modules/admin/parking-management/view-parking', icon: <FiClipboard /> },
    ],
  },
  {
    title: 'Complaint Management',
    icon: <FiAlertTriangle />,
    link: '/tms-modules/admin/complaint-management',
    subItems: [
      { title: 'View Complaints', link: '/tms-modules/admin/complaint-management/view-complaints', icon: <FiClipboard /> },
    ],
  },
  {
    title: 'Reports',
    icon: <FiBarChart2 />,
    link: '/tms-modules/admin/reports',
    subItems: [
      { title: 'Car Inventory', link: '/tms-modules/admin/reports/car-reports', icon: <FiTruck /> },
      { title: 'Inspections', link: '/tms-modules/admin/reports/inspection-reports', icon: <FiClipboard /> },
      { title: 'Assignments', link: '/tms-modules/admin/reports/assignment-reports', icon: <FiUser /> },
      { title: 'Field Service', link: '/tms-modules/admin/reports/field-searvice-reports', icon: <FiSettings /> },
      { title: 'Day Service', link: '/tms-modules/admin/reports/daily-service-reports', icon: <FiSettings /> },
      { title: 'Daily Service', link: '/tms-modules/admin/reports/constant-service-reports', icon: <FiSettings /> },
      { title: 'Car Attendance and Transfer', link: '/tms-modules/admin/reports/car-acceptance-reports', icon: <FiBarChart2 /> },
    ],
  },
];

const defaultUser = {
  name: "Admin User",
  avatar: "https://ui-avatars.com/api/?name=Admin+User&background=random",
  role: "Administrator"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full transition-all duration-300 shadow-md z-50 overflow-y-auto ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <Sidebar 
          items={sidebarItems} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeColor="#3c8dbc" // Pass the active color to Sidebar component
        />
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={defaultUser}
        />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}