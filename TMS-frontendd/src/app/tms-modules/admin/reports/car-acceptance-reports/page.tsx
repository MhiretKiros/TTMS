// page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportFilters from './components/ReportFilters';
import VehicleAcceptanceInventory from './components/VehicleAcceptanceInventory';
import VehicleTransferInventory from './components/VehicleTransferInventory';
import WeeklyAcceptanceGraph from './components/WeeklyAcceptanceGraph';
import WeeklyTransferGraph from './components/WeeklyTransferGraph';
import ExportModal from './components/ExportModal';
import { VehicleTransfer, VehicleAcceptance, CarReportsFilters } from './types';

export default function CarReportsPage() {
  const [filters, setFilters] = useState<CarReportsFilters>({
    plateNumber: '',
    start: '',
    end: ''
  });
  
  const [allTransfers, setAllTransfers] = useState<VehicleTransfer[]>([]);
  const [allAcceptances, setAllAcceptances] = useState<VehicleAcceptance[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<VehicleTransfer[]>([]);
  const [filteredAcceptances, setFilteredAcceptances] = useState<VehicleAcceptance[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transfersRes, acceptancesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/transfers/all'),
          axios.get('http://localhost:8080/api/vehicle-acceptance/all')
        ]);

        setAllTransfers(transfersRes.data);
        setAllAcceptances(acceptancesRes.data);
        setFilteredTransfers(transfersRes.data);
        setFilteredAcceptances(acceptancesRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (allTransfers.length === 0 && allAcceptances.length === 0) return;

    let filteredTransfers = [...allTransfers];
    let filteredAcceptances = [...allAcceptances];

    // Filter by plate number (search in acceptances and match transfers by assignmentHistoryId)
    if (filters.plateNumber) {
      const plateLower = filters.plateNumber.toLowerCase();
      
      // Filter acceptances by plate number
      filteredAcceptances = filteredAcceptances.filter(acc => 
        acc.plateNumber.toLowerCase().includes(plateLower)
      );

      // Get assignmentHistoryIds from filtered acceptances
      const assignmentIds = filteredAcceptances
        .map(acc => acc.assignmentHistoryId)
        .filter(id => id !== null) as number[];

      // Filter transfers by assignmentHistoryId
      if (assignmentIds.length > 0) {
        filteredTransfers = filteredTransfers.filter(transfer => 
          assignmentIds.includes(transfer.assignmentHistoryId)
        );
      } else {
        filteredTransfers = [];
      }
    }

    // Filter by date range
    if (filters.start && filters.end) {
      const startDate = new Date(filters.start);
      const endDate = new Date(filters.end);

      filteredAcceptances = filteredAcceptances.filter(acc => {
        const accDate = new Date(acc.createdAt);
        return accDate >= startDate && accDate <= endDate;
      });

      filteredTransfers = filteredTransfers.filter(transfer => {
        const transferDate = new Date(transfer.transferDate);
        return transferDate >= startDate && transferDate <= endDate;
      });
    }

    setFilteredTransfers(filteredTransfers);
    setFilteredAcceptances(filteredAcceptances);
  }, [filters, allTransfers, allAcceptances]);

  const handleFilterChange = (newFilters: CarReportsFilters) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
  };

  if (loading) return <div className="text-center py-4">Loading reports...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Vehicle Transfer & Acceptance Reports</h1>
      
      <ReportFilters 
        onFilterChange={handleFilterChange} 
        onExport={handleExport} 
      />
      
      {/* First Row - Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <VehicleAcceptanceInventory 
            acceptances={filteredAcceptances}
            loading={loading}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <VehicleTransferInventory 
            transfers={filteredTransfers}
            loading={loading}
          />
        </div>
      </div>
      
      {/* Second Row - Weekly Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <WeeklyAcceptanceGraph 
            acceptances={filteredAcceptances}
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <WeeklyTransferGraph 
            transfers={filteredTransfers}
          />
        </div>
      </div>
      
      {showExportModal && (
        <ExportModal 
          acceptances={filteredAcceptances}
          transfers={filteredTransfers}
          onClose={closeExportModal} 
          filters={filters} 
        />
      )}
    </div>
  );
}