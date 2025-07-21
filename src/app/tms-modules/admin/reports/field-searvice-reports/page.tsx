'use client';

import React, { useState, useEffect } from 'react';
import ReportFilters from './components/ReportFilters';
import FieldServiceInventory from './components/FieldServiceInventory';
import FieldServiceStatusCharts from './components/FieldServiceStatusCharts';
import WeeklyFieldServiceGraph from './components/WeeklyFieldServiceGraph';
import ExportModal from './components/ExportModal';
import { FieldService, FieldServiceReportFilters } from './types';
import { fetchAllFieldServices } from '@/app/tms-modules/admin/reports/api/carReports';

export default function FieldServiceReportsPage() {
  const [filters, setFilters] = useState<FieldServiceReportFilters>({
    claimantName: '',
    status: '',
    start: '',
    end: '',
    plateNumber: ''

  });
  
  const [allFieldServices, setAllFieldServices] = useState<FieldService[]>([]);
  const [filteredFieldServices, setFilteredFieldServices] = useState<FieldService[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data once when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAllFieldServices();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch field service data');
        }

        const sanitizedData = (response.fieldServices || []).map(service => ({
          ...service,
          claimantName: service.claimantName || 'N/A',
          startingPlace: service.startingPlace || 'N/A',
          destinationPlace: service.destinationPlace || 'N/A',
          startingDate: service.startingDate || new Date().toISOString(),
          returnDate: service.returnDate || new Date().toISOString(),
          status: service.status || 'PENDING',
          teamLeaderName: service.teamLeaderName || 'N/A',
          travelDistance: service.travelDistance ?? null,
          department: service.department || 'N/A',
          jobStatus: service.jobStatus || 'N/A'
        }));

        setAllFieldServices(sanitizedData);
        setFilteredFieldServices(sanitizedData);
      } catch (error) {
        console.error('Error loading field service data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    if (allFieldServices.length === 0) return;

    let result = [...allFieldServices];

    if (filters.claimantName) {
      result = result.filter(service => 
        (service.claimantName || '').toLowerCase().includes(filters.claimantName.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(service => 
        (service.status || '').toLowerCase().includes(filters.status.toLowerCase())
      );
    }

   if (filters.plateNumber) {
 result = result.filter(service =>
 (service.vehicleDetails || '').toLowerCase().includes(filters.plateNumber!.toLowerCase())
 );
}

    if (filters.start && filters.end) {
      const startDate = new Date(filters.start);
      const endDate = new Date(filters.end);
      result = result.filter(service => {
        const serviceDate = new Date(service.startingDate);
        return serviceDate >= startDate && serviceDate <= endDate;
      });
    }

    setFilteredFieldServices(result);
  }, [filters, allFieldServices]);

  const handleFilterChange = (newFilters: FieldServiceReportFilters) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
  };

  if (loading) return <div className="text-center py-4">Loading field services...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Field Service Reports</h1>
      
      <ReportFilters 
        onFilterChange={handleFilterChange} 
        onExport={handleExport} 
      />
      
      {/* First Row - Inventory and Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <FieldServiceInventory 
            fieldServices={filteredFieldServices}
            loading={loading}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <FieldServiceStatusCharts 
            fieldServices={filteredFieldServices}
          />
        </div>
      </div>
      
      {/* Second Row - Weekly Graph */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <WeeklyFieldServiceGraph 
          fieldServices={filteredFieldServices}
        />
      </div>
      
      {showExportModal && (
        <ExportModal 
          services={filteredFieldServices} 
          onClose={closeExportModal} 
          filters={filters} 
        />
      )}
    </div>
  );
}