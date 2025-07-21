// VehicleAcceptanceInventory.tsx
'use client';

import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { VehicleAcceptance } from '../types';

const columns: GridColDef[] = [
  { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
  { field: 'carType', headerName: 'Car Type', width: 150 },
  { 
    field: 'createdAt', 
    headerName: 'Acceptance Date', 
    width: 180,
    valueFormatter: (params: any) => new Date(params.value).toLocaleDateString()
  },
  { field: 'km', headerName: 'KM', width: 100 },
  { 
    field: 'assignmentHistoryId', 
    headerName: 'Has Transfer', 
    width: 120,
    valueFormatter: (params: any) => params.value ? 'Yes' : 'No'
  },
  { 
    field: 'inspectionItems', 
    headerName: 'Inspection Items', 
    width: 150,
    valueFormatter: (params: any) => {
      if (!params.value) return 'N/A';
      const items = Object.values(params.value);
      const passed = items.filter((item: any) => item).length;
      return `${passed}/${items.length} passed`;
    }
  },
];

interface VehicleAcceptanceInventoryProps {
  acceptances: VehicleAcceptance[];
  loading: boolean;
}

export default function VehicleAcceptanceInventory({ acceptances, loading }: VehicleAcceptanceInventoryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Vehicle Acceptance</h2>
      {acceptances.length > 0 ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={acceptances}
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
          {loading ? 'Loading...' : 'No vehicle acceptances match the selected filters'}
        </div>
      )}
    </div>
  );
}