// page.tsx
'use client';

import React, { useState } from 'react';
import InspectionInventory from './components/InspectionInventory';
import InspectionStatusCharts from './components/InspectionStatusCharts';
import WeeklyInspectionGraph from './components/WeeklyInspectionGraph';
import ReportFilters from './components/ReportFilters';
import ExportModal from './components/ExportModal';
import { InspectionReportFilters } from './types';

export default function InspectionReportsPage() {
  const [filters, setFilters] = useState<InspectionReportFilters>({
    plateNumber: '',
    status: '',
    start: '',
    end: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [filteredInspections, setFilteredInspections] = useState<any[]>([]);

  const handleFilterChange = (newFilters: InspectionReportFilters) => {
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
      
      {/* First Row - Inventory and Car Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <InspectionInventory 
            filters={filters} 
            setFilteredInspections={setFilteredInspections} 
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <InspectionStatusCharts 
            filters={filters}
            statusOptions={['Approved', 'Rejected', 'ReadyWithWarning']}
          />
        </div>
      </div>
      
      {/* Second Row - Weekly Inspection Graph */}
      <div className="bg-white p-4 rounded-lg shadow">
        <WeeklyInspectionGraph filters={filters} />
      </div>

      {showExportModal && (
        <ExportModal 
          inspections={filteredInspections} 
          onClose={() => setShowExportModal(false)} 
          filters={filters}
        />
      )}
    </div>
  );
}