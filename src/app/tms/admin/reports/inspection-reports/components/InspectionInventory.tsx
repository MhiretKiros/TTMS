'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchInspections } from '@/app/tms/admin/reports/api/carReports';
import { Inspection, InspectionReportFilters } from '../types';

const columns: GridColDef[] = [
  { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
  { 
    field: 'inspectionDate', 
    headerName: 'Inspection Date', 
    width: 180,
    valueFormatter: (params: { value: string | Date }) => new Date(params.value).toLocaleString() 
  },
  { field: 'inspectorName', headerName: 'Inspector', width: 150 },
  { 
    field: 'inspectionStatus', 
    headerName: 'Status', 
    width: 150,
    renderCell: (params: { value?: string }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        params.value === 'Approved' ? 'bg-green-100 text-green-800' :
        params.value === 'Rejected' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {params.value}
      </span>
    ) 
  },
  { field: 'serviceStatus', headerName: 'Service Status', width: 150 },
  { 
    field: 'bodyScore', 
    headerName: 'Body Score', 
    width: 120,
    renderCell: (params: { value?: number }) => `${params.value}%` 
  },
  { 
    field: 'interiorScore', 
    headerName: 'Interior Score', 
    width: 120,
    renderCell: (params: { value?: number }) => `${params.value}%` 
  },
];

interface InspectionInventoryProps {
  filters: InspectionReportFilters;
  setFilteredInspections: (inspections: Inspection[]) => void;
}

export default function InspectionInventory({ filters, setFilteredInspections }: InspectionInventoryProps) {
  const [allInspections, setAllInspections] = useState<Inspection[]>([]);
  const [localFilteredInspections, setLocalFilteredInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchInspections();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch inspection data');
        }

        setAllInspections(response.inspections);
        setLocalFilteredInspections(response.inspections);
        setFilteredInspections(response.inspections);
      } catch (error) {
        console.error('Error loading inspection data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setFilteredInspections]);

  useEffect(() => {
    if (allInspections.length === 0) return;

    let result = [...allInspections];

    if (filters.plateNumber) {
      result = result.filter(inspection => 
        inspection.plateNumber.toLowerCase().includes(filters.plateNumber.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(inspection => 
        inspection.inspectionStatus.toLowerCase().includes(filters.status.toLowerCase())
      );
    }

    if (filters.start && filters.end) {
      const startDate = new Date(filters.start);
      const endDate = new Date(filters.end);
      result = result.filter(inspection => {
        const inspectionDate = new Date(inspection.inspectionDate);
        return inspectionDate >= startDate && inspectionDate <= endDate;
      });
    }

    setLocalFilteredInspections(result);
    setFilteredInspections(result);
  }, [filters, allInspections, setFilteredInspections]);

  if (loading) return <div className="text-center py-4">Loading inspections...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Inspection Reports</h2>
      {localFilteredInspections.length > 0 ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={localFilteredInspections}
            columns={columns}
            loading={loading}
            paginationModel={{ pageSize: 10, page: 0 }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#3c8dbc',
                color: 'white',
              },
            }}
            getRowId={(row) => row.id || row.plateNumber}
          />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No inspections match the selected filters</div>
      )}
    </div>
  );
}