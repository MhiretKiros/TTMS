'use client';

import React, { useState } from 'react';
import CarInventory from './components/CarInventory';
import CarStatusCharts from './components/CarStatusCharts';
import CarTypeBreakdown from './components/CarTypeBreakdown';
import ReportFilters from './components/ReportFilters';
import MonthlyRegistrationGraph from './components/MonthlyRegistrationChart';
import ExportModal from './components/ExportModal';
import { CarReportFilters } from './types';

export default function CarReportsPage() {
  const [filters, setFilters] = useState<CarReportFilters>({
    carType: '',
    status: '',
    model: '',
    start: '',
    end: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [filteredCars, setFilteredCars] = useState<any[]>([]);

  const handleFilterChange = (newFilters: CarReportFilters) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <div className="space-y-6">
      <ReportFilters 
        onFilterChange={handleFilterChange} 
        onExport={handleExport}
      />
      
      {/* First Row - Table and Car Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <CarInventory filters={filters} setFilteredCars={setFilteredCars} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <CarTypeBreakdown filters={filters} />
        </div>
      </div>
      
      {/* Second Row - Monthly Registration Graph (full width) */}
      <div className="bg-white p-4 rounded-lg shadow">
        <MonthlyRegistrationGraph filters={filters} />
      </div>
      
      {/* Third Row - Status Charts */}
      <div className="bg-white p-4 rounded-lg shadow">
        <CarStatusCharts filters={filters} />
      </div>

      {showExportModal && (
        <ExportModal 
          cars={filteredCars} 
          onClose={() => setShowExportModal(false)} 
          filters={filters}
        />
      )}
    </div>
  );
}