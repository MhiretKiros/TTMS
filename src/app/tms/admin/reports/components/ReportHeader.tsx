'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const reportTabs = [
  { name: 'Car Inventory', href: '/tms/admin/reports/car-reports' },
  { name: 'Car Inspection', href: '/tms/admin/reports/inspection-reports' },
  { name: 'Assignments', href: '/tms/admin/reports/assignment-reports' },
  { name: 'Field Service', href: '/tms/admin/reports/field-searvice-reports' },
  { name: 'Day Service', href: '/tms/admin/reports/daily-service-reports' },
  { name: 'Daily Service', href: '/tms/admin/reports/constant-service-reports' },
  { name: 'Car Acceptance and Transfer', href: '/tms/admin/reports/car-acceptance-reports' },
];

export default function ReportHeader() {
  const pathname = usePathname();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Car Management Reports</h1>
        <p className="text-gray-500 mt-2 text-base">Comprehensive analytics and insights for vehicle operations</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-0.5">
          {reportTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`relative py-2.5 px-4 text-sm font-medium rounded-t-md transition-colors duration-200
                  ${isActive
                    ? 'text-[#3c8dbc] bg-white border-t border-x border-gray-200 -mb-px'
                    : 'text-gray-600 hover:text-[#3c8dbc] hover:bg-gray-50'
                  }`}
              >
                {tab.name}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#3c8dbc]"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
