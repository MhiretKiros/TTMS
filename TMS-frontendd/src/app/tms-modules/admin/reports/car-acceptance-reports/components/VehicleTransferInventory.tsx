// VehicleTransferInventory.tsx
'use client';

import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { VehicleTransfer } from '../types';

const columns: GridColDef[] = [
  { field: 'transferNumber', headerName: 'Transfer #', width: 150 },
  { 
    field: 'transferDate', 
    headerName: 'Transfer Date', 
    width: 150,
    valueFormatter: (params) => new Date(params.value).toLocaleDateString()
  },
  { field: 'designatedOfficial', headerName: 'From Official', width: 180 },
  { field: 'currentDesignatedOfficial', headerName: 'To Official', width: 180 },
  { field: 'driverName', headerName: 'Driver', width: 150 },
  { field: 'oldKmReading', headerName: 'Old KM', width: 100 },
  { field: 'newKmReading', headerName: 'New KM', width: 100 },
  { field: 'transferReason', headerName: 'Reason', width: 200 },
];

interface VehicleTransferInventoryProps {
  transfers: VehicleTransfer[];
  loading: boolean;
}

export default function VehicleTransferInventory({ transfers, loading }: VehicleTransferInventoryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Vehicle Transfers</h2>
      {transfers.length > 0 ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={transfers}
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
            getRowId={(row) => row.transferId}
          />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          {loading ? 'Loading...' : 'No vehicle transfers match the selected filters'}
        </div>
      )}
    </div>
  );
}