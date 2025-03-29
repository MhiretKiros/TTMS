"use client"; // Add this directive at the top

import Sidebar from '@/app/component/Sidebar';
import Header from '@/app/component/Header';
import { useState } from 'react';

const sidebarItems = [
  {
    title: 'Dashboard',
    link: '/tms-modules/employee',
    icon: '🏠',
  },
  {
    title: 'Request Service',
    link: '/tms-modules/employee/request-service',
    icon: '🚗',
  },
  {
    title: 'Request Field',
    link: '/tms-modules/employee/request-field',
    icon: '📍',
  },
  {
    title: 'Send Complaint',
    link: '/tms-modules/employee/send-complaint',
    icon: '📝',
  },
];

export default function EmployeeLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        items={sidebarItems} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}