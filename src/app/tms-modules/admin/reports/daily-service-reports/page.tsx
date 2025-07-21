'use client';

import React, { useState, useEffect } from 'react';
import ReportFilters from './components/ReportFilters';
import DailyServiceInventory from './components/DailyServiceInventory';
import DailyServiceStatusCharts from './components/DailyServiceStatusCharts';
import WeeklyDailyServiceGraph from './components/WeeklyDailyServiceGraph';
import ExportModal from './components/ExportModal';
import { DailyService, DailyServiceReportFilters } from './types';
import { fetchAllDailyServices } from '@/app/tms-modules/admin/reports/api/carReports';

export default function DailyServiceReportsPage() {
  const [filters, setFilters] = useState<DailyServiceReportFilters>({
    claimantName: '',
    status: '',
    start: '',
    end: '',
    plateNumber: ''
  });
  
  const [allDailyServices, setAllDailyServices] = useState<DailyService[]>([]);
  const [filteredDailyServices, setFilteredDailyServices] = useState<DailyService[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data once when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAllDailyServices();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch daily service data');
        }

        const sanitizedData = (response.dailyServices || []).map(service => ({
          ...service,
          claimantName: service.claimantName || 'N/A',
          startingPlace: service.startingPlace || 'N/A',
          endingPlace: service.endingPlace || 'N/A',
          driverName: service.driverName || 'N/A',
          carType: service.carType || 'N/A',
          plateNumber: service.plateNumber || 'N/A',
          status: service.status || 'PENDING'
        }));

        setAllDailyServices(sanitizedData);
        setFilteredDailyServices(sanitizedData);
      } catch (error) {
        console.error('Error loading daily service data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    if (allDailyServices.length === 0) return;

    let result = [...allDailyServices];

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
        (service.plateNumber || '').toLowerCase().includes(filters.plateNumber?.toLowerCase() ?? '')
      );
    }

    if (filters.start && filters.end) {
      const startDate = new Date(filters.start);
      const endDate = new Date(filters.end);
      result = result.filter(service => {
        const serviceDate = new Date(service.dateTime);
        return serviceDate >= startDate && serviceDate <= endDate;
      });
    }

    setFilteredDailyServices(result);
  }, [filters, allDailyServices]);

  const handleFilterChange = (newFilters: DailyServiceReportFilters) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
  };

  if (loading) return <div className="text-center py-4">Loading daily services...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Daily Service Reports</h1>
      
      <ReportFilters 
        onFilterChange={handleFilterChange} 
        onExport={handleExport} 
      />
      
      {/* First Row - Inventory and Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <DailyServiceInventory 
            dailyServices={filteredDailyServices}
            loading={loading}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <DailyServiceStatusCharts 
            dailyServices={filteredDailyServices}
          />
        </div>
      </div>
      
      {/* Second Row - Weekly Graph */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <WeeklyDailyServiceGraph 
          dailyServices={filteredDailyServices}
        />
      </div>
      
      {showExportModal && (
        <ExportModal 
          services={filteredDailyServices} 
          onClose={closeExportModal} 
          filters={filters} 
        />
      )}
    </div>
  );
}