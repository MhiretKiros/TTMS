'use client'

import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DashboardCards from './components/DashboardCards'
import Charts from './components/Charts'
import EmployeeTable from './components/EmployeeTable'

export default function Home() {
  const [sidebarHidden, setSidebarHidden] = useState(false)

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar className={sidebarHidden ? 'sidebar-hidden' : ''} />
        <div className="flex-1 p-6">
          <DashboardCards />
          <Charts />
          <EmployeeTable />
        </div>
      </div>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © {new Date().getFullYear()} INSA ERP. All rights reserved.
      </footer>
    </div>
  )
}