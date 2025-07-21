'use client';

import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FieldService } from '../types';

const columns: GridColDef[] = [
  { field: 'claimantName', headerName: 'Claimant', width: 150 },
  { field: 'startingPlace', headerName: 'From', width: 120 },
  { field: 'destinationPlace', headerName: 'To', width: 120 },
  { 
    field: 'startingDate', 
    headerName: 'Start Date', 
    width: 150,
    valueFormatter: (params: { value?: Date | string }) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
  },
  { 
    field: 'returnDate', 
    headerName: 'Return Date', 
    width: 150,
    valueFormatter: (params: { value?: Date | string }) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150,
    renderCell: (params: { value?: string }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        params.value === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
        params.value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        params.value === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
        params.value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
        params.value === 'FINISHED' ? 'bg-gray-100 text-gray-800' :
        params.value === 'REJECTED' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {params.value || 'N/A'}
      </span>
    ) 
  },
  { field: 'teamLeaderName', headerName: 'Team Leader', width: 150 },
  { 
    field: 'travelDistance', 
    headerName: 'Distance', 
    width: 100,
    valueFormatter: (params: { value?: number | null }) => params.value !== null ? `${params.value} km` : 'N/A'
  },
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'jobStatus', headerName: 'Job Status', width: 150 },
];

interface FieldServiceInventoryProps {
  fieldServices: FieldService[];
  loading: boolean;
}

export default function FieldServiceInventory({ fieldServices, loading }: FieldServiceInventoryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Field Service Trips</h2>
      {fieldServices.length > 0 ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={fieldServices}
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
            getRowId={(row) => row.id}
          />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          {loading ? 'Loading...' : 'No field services match the selected filters'}
        </div>
      )}
    </div>
  );
}