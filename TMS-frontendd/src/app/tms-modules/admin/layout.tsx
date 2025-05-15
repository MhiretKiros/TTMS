"use client";
import Sidebar from '@/app/component/Sidebar';
import Header from '@/app/component/Header';
import { useState } from 'react';

const sidebarItems = [
  {
    title: 'Dashboard',
    link: '/tms-modules/admin',
    icon: '🏠',
  },
  {
    title: 'Car Management',
    icon: '🚗',
    link: '/tms-modules/admin/car-management',
    subItems: [
      { title: 'Manage Cars', link: '/tms-modules/admin/car-management/manage-cars', icon: '🛠️' },
      { title: 'Mantaine Cars', link: '/tms-modules/admin/car-management/maintenances', icon: '🛠️' },
      { title: 'Order Cars', link: '/tms-modules/admin/car-management/order-cars', icon: '📦' },
      { title: 'Assign Cars', link: '/tms-modules/admin/car-management/assign-car', icon: '👥' },
      { title: 'Car Attendance', link: '/tms-modules/admin/car-management/car-attendance', icon: '✅' },
      { title: 'Vehicle Inspection', link: '/tms-modules/admin/car-management/vehicle-inspection', icon: '🔧' },

    ],
  },
  {
    title: 'Request Management',
    icon: '📋',
    link: '/tms-modules/admin/request-management',
    subItems: [
      { title: 'Fule Requests', link: '/tms-modules/admin/request-management', icon: '🔧' },
      { title: 'Service Requests', link: '/tms-modules/admin/request-management/request-field', icon: '🔧' },
    ],
  },
  {
    title: 'Parking Management',
    icon: '🅿️',
    link: '/tms-modules/admin/parking-management',
    subItems: [
      { title: 'View Parking', link: '/tms-modules/admin/parking-management/view-parking', icon: '👀' },
    ],
  },
  {
    title: 'Complaint Management',
    icon: '📢',
    link: '/tms-modules/admin/complaint-management',
    subItems: [
      { title: 'View Complaints', link: '/tms-modules/admin/complaint-management/view-complaints', icon: '📝' },
    ],
  },
  {
    title: 'Reports',
    icon: '📊',
    link: '/tms-modules/admin/reports',
    subItems: [
      { title: 'Generate Reports', link: '/tms-modules/admin/reports/generate-reports', icon: '📈' },
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
      <div className={`fixed top-0 left-0 h-full transition-all duration-300 bg-white shadow-lg z-50 ${sidebarOpen ? 'w-64' : 'w-20'} overflow-y-auto`}>
        <Sidebar 
          items={sidebarItems} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header - Only one header in the layout */}
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={defaultUser}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}