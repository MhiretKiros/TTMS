'use client';

import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DailyService } from '../types';

const columns: GridColDef[] = [
  { field: 'claimantName', headerName: 'Claimant', width: 150 },
  { field: 'startingPlace', headerName: 'From', width: 120 },
  { field: 'endingPlace', headerName: 'To', width: 120 },
  { 
    field: 'dateTime', 
    headerName: 'Date & Time', 
    width: 180,
    valueFormatter: (params) => params?.value ? new Date(params.value).toLocaleString() : 'N/A'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        params?.value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        params?.value === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
        params?.value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {params?.value || 'N/A'}
      </span>
    ) 
  },
  { field: 'driverName', headerName: 'Driver', width: 150 },
  { 
    field: 'kmDifference', 
    headerName: 'KM Diff', 
    width: 100,
    valueFormatter: (params) => params?.value !== null ? `${params.value} km` : 'N/A'
  },
  { field: 'carType', headerName: 'Car Type', width: 120 },
  { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
];

interface DailyServiceInventoryProps {
  dailyServices: DailyService[];
  loading: boolean;
}

export default function DailyServiceInventory({ dailyServices, loading }: DailyServiceInventoryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Daily Service Trips</h2>
      {dailyServices.length > 0 ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={dailyServices}
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
            getRowId={(row) => row.id}
          />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          {loading ? 'Loading...' : 'No daily services match the selected filters'}
        </div>
      )}
    </div>
  );
}