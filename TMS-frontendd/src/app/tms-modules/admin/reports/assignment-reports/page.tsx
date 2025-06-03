// page.tsx
'use client';

import React, { useState } from 'react';
import AssignmentList from './components/AssignmentList';
import AssignmentStatusChart from './components/AssignmentStatusChart';
import AssignmentFilters from './components/AssignmentFilters';
import AssignmentExportModal from './components/AssignmentExportModal';
import MonthlyAssignmentGraph from './components/MonthlyAssignmentGraph';
import AssignmentTypeBreakdown from './components/AssignmentTypeBreakdown';
import PositionDistributionChart from './components/PositionDistributionChart';
import { CarAssignmentFilters } from './types';

export default function AssignmentReportsPage() {
  const [filters, setFilters] = useState<CarAssignmentFilters>({
    plateNumber: '',
    status: '',
    position: '',
    start: '',
    end: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);

  const handleFilterChange = (newFilters: CarAssignmentFilters) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <div className="space-y-6">
      <AssignmentFilters 
        onFilterChange={handleFilterChange} 
        onExport={handleExport}
      />
      
      {/* First Row - Assignment List and Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <AssignmentList filters={filters} setFilteredAssignments={setFilteredAssignments} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <AssignmentTypeBreakdown filters={filters} />
        </div>
      </div>
      
      {/* Second Row - Monthly Assignment Graph */}
      <div className="bg-white p-4 rounded-lg shadow">
        <MonthlyAssignmentGraph filters={filters} />
      </div>
      
      {/* Third Row - Status Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <AssignmentStatusChart filters={filters} />
      </div>

      {/* Fourth Row - Position Distribution Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <PositionDistributionChart filters={filters} />
      </div>

      {showExportModal && (
        <AssignmentExportModal 
          assignments={filteredAssignments} 
          onClose={() => setShowExportModal(false)} 
          filters={filters}
        />
      )}
    </div>
  );
}