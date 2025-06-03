// AssignmentFilters.tsx
'use client';

import React, { useState } from 'react';
import { FiFilter, FiDownload } from 'react-icons/fi';
import { CarAssignmentFilters } from '../types';

interface AssignmentFiltersProps {
  onFilterChange: (filters: CarAssignmentFilters) => void;
  onExport: () => void;
}

export default function AssignmentFilters({ onFilterChange, onExport }: AssignmentFiltersProps) {
  const [filters, setFilters] = useState<CarAssignmentFilters>({
    plateNumber: '',
    status: '',
    position: '',
    start: '',
    end: ''
  });

  const positionOptions = [
    'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'
  ];

  const statusOptions = [
    'Assigned', 'Pending', 'Approved', 'Waiting', 'In_transfer', 'Completed'
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      plateNumber: '',
      status: '',
      position: '',
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              value={filters.plateNumber}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Search by plate"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <select
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Positions</option>
              {positionOptions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end space-x-2">
            <button 
              onClick={clearFilters}
              className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
            >
              Clear Filters
            </button>
            <button 
              onClick={onExport}
              className="w-full bg-[#3c8dbc] text-white px-3 py-2 rounded text-sm flex items-center justify-center"
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