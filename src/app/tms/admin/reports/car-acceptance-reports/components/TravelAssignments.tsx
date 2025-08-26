'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchTravelRequests, fetchDailyServiceRequests } from '@/app/tms/admin/reports/api/travelReports';

const travelColumns: GridColDef[] = [
  { field: 'startingPlace', headerName: 'From', width: 150 },
  { field: 'destinationPlace', headerName: 'To', width: 150 },
  { field: 'claimantName', headerName: 'Requester', width: 150 },
  { field: 'assignedCarType', headerName: 'Car Type', width: 120 },
  { field: 'assignedDriver', headerName: 'Driver', width: 150 },
  { field: 'startingDate', headerName: 'Start Date', width: 150 },
  { field: 'returnDate', headerName: 'End Date', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
];

const serviceColumns: GridColDef[] = [
  { field: 'startingPlace', headerName: 'From', width: 150 },
  { field: 'endingPlace', headerName: 'To', width: 150 },
  { field: 'claimantName', headerName: 'Requester', width: 150 },
  { field: 'carType', headerName: 'Car Type', width: 120 },
  { field: 'driverName', headerName: 'Driver', width: 150 },
  { field: 'dateTime', headerName: 'Date/Time', width: 180 },
  { field: 'status', headerName: 'Status', width: 120 },
];

export default function TravelAssignments() {
  const [travelRequests, setTravelRequests] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('travel');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [travelData, serviceData] = await Promise.all([
          fetchTravelRequests(),
          fetchDailyServiceRequests()
        ]);
        setTravelRequests(travelData);
        setServiceRequests(serviceData);
      } catch (error) {
        console.error('Error loading travel data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'travel' ? 'border-b-2 border-[#3c8dbc] text-[#3c8dbc]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('travel')}
        >
          Travel Requests
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'service' ? 'border-b-2 border-[#3c8dbc] text-[#3c8dbc]' : 'text-gray-500'}`}
          onClick={() => setActiveTab('service')}
        >
          Daily Service Requests
        </button>
      </div>

      {activeTab === 'travel' ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={travelRequests}
            columns={travelColumns}
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
          />
        </div>
      ) : (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={serviceRequests}
            columns={serviceColumns}
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
          />
        </div>
      )}
    </div>
  );
}