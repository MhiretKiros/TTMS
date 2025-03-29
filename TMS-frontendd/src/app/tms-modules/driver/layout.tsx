'use client';
import { useState } from 'react';
import Sidebar from '@/app/component/Sidebar';
import Header from '@/app/component/Header';

const sidebarItems = [
  {
    title: 'Dashboard',
    link: '/tms-modules/driver',
    icon: '🏠',
  },
  {
    title: 'View Members',
    link: '/tms-modules/driver/view-members',
    icon: '👥',
  },
  {
    title: 'View Parking',
    link: '/tms-modules/driver/view-parking',
    icon: '🅿️',
  },
  {
    title: 'Send Complaint',
    link: '/tms-modules/driver/send-complaint',
    icon: '📢',
  },
  {
    title: 'Car Attendance',
    link: '/tms-modules/driver/car-attendance',
    icon: '✅',
  },
  {
    title: 'Status',
    link: '/tms-modules/driver/status',
    icon: '📊',
  },
];

export default function DriverLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        items={sidebarItems} 
        isOpen={sidebarOpen}
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