// ReportFilters.tsx
'use client';

import React, { useState } from 'react';
import { FiFilter, FiDownload } from 'react-icons/fi';
import { CarReportsFilters } from '../types';

interface ReportFiltersProps {
  onFilterChange: (filters: CarReportsFilters) => void;
  onExport: () => void;
}

export default function ReportFilters({ onFilterChange, onExport }: ReportFiltersProps) {
  const [filters, setFilters] = useState<CarReportsFilters>({
    plateNumber: '',
    start: '',
    end: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      plateNumber: '',
      start: '',
      end: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-500" />
          <h3 className="font-medium text-gray-700">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                name="start"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                value={filters.start}
                onChange={handleFilterChange}
              />
              <input
                type="date"
                name="end"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                value={filters.end}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Plate Number</label>
            <input
              type="text"
              name="plateNumber"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={filters.plateNumber}
              onChange={handleFilterChange}
              placeholder="Search by plate number"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button 
              onClick={clearFilters}
              className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
            >
              Clear
            </button>
            <button 
              onClick={onExport}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
            >
              <FiDownload className="mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}