'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchInspections } from '@/app/tms-modules/admin/reports/api/carReports';

const columns: GridColDef[] = [
  { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
  { field: 'carType', headerName: 'Car Type', width: 120 },
  { field: 'inspectionDate', headerName: 'Inspection Date', width: 150 },
  { field: 'inspectorName', headerName: 'Inspector', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'nextInspectionDate', headerName: 'Next Inspection', width: 150 },
  { field: 'notes', headerName: 'Notes', width: 200 },
];

export default function InspectionHistory() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchInspections();
        // Combine regular and org inspections
        const allInspections = [
          ...data.regularInspections.data || [],
          ...data.organizationInspections.data || []
        ];
        setInspections(allInspections);
      } catch (error) {
        console.error('Error loading inspection data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Inspection History</h2>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={inspections}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#3c8dbc',
              color: 'white',
            },
          }}
        />
      </div>
    </div>
  );
}