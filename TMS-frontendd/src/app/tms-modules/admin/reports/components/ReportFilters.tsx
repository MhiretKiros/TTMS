'use client';

import React, { useState } from 'react';
import { FiCalendar, FiFilter, FiDownload } from 'react-icons/fi';

export default function ReportFilters() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [filters, setFilters] = useState({
    carType: '',
    status: '',
    assignmentType: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <h3 className="font-medium text-gray-700">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <input
                type="date"
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
            <select
              name="carType"
              value={filters.carType}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="organization">Organization</option>
              <option value="rental">Rental</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="bg-[#3c8dbc] text-white px-4 py-2 rounded text-sm flex items-center">
              <FiDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}