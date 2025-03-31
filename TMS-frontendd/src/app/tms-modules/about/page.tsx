"use client";
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
       {/* Fixed Navigation Bar */}
       <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">TMS</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/tms-modules" className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/tms-modules/about" className="text-gray-800 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                About
              </Link>
              <Link href="/tms-modules/services" className="text-blue-600 px-3 py-2 text-sm font-medium">
                Services
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Our TMS</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing transportation management since 2015 with cutting-edge technology.
          </p>
        </div>

        {/* Three Cards (same as Home) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Admin Card (same as Home) */}
          {/* Driver Card (same as Home) */}
          {/* Employee Card (same as Home) */}
        </div>

        {/* Additional About Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2015, our Transportation Management System was born out of a need for more efficient fleet operations in the logistics industry.
              </p>
              <p className="text-gray-600">
                Today, we serve over 500 companies worldwide, managing more than 50,000 vehicles across 30 countries.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Values</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Innovation in transportation technology</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Commitment to customer success</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Sustainable fleet management solutions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
     
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Three Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Admin Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-purple-100 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Admin Portal</h3>
              <p className="text-gray-600 mb-6">
                Complete control over fleet management, user permissions, and system configuration.
              </p>
              <Link href="/tms-modules/admin" className="inline-block px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700">
                Access Portal
              </Link>
            </div>
          </div>

          {/* Driver Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Driver Portal</h3>
              <p className="text-gray-600 mb-6">
                Real-time navigation, vehicle status, and task management for drivers.
              </p>
              <Link href="/tms-modules/driver" className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                Access Portal
              </Link>
            </div>
          </div>

          {/* Employee Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Employee Portal</h3>
              <p className="text-gray-600 mb-6">
                Transportation requests, scheduling, and complaint submission for employees.
              </p>
              <Link href="/tms-modules/employee" className="inline-block px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                Access Portal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}