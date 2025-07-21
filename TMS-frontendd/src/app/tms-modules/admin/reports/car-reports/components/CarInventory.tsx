'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { fetchAllCars } from '@/app/tms-modules/admin/reports/api/carReports';
import { Car, CarReportFilters } from '../types';

const columns: GridColDef<Car>[] = [
  { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
  { field: 'carType', headerName: 'Type', width: 120 },
  { field: 'model', headerName: 'Model', width: 150 },
  { field: 'manufactureYear', headerName: 'Year', width: 100 },
  { field: 'status', headerName: 'Status', width: 150 },
  { field: 'fuelType', headerName: 'Fuel Type', width: 120 },
  { field: 'parkingLocation', headerName: 'Location', width: 150 },
  { 
    field: 'inspected', 
    headerName: 'Inspected', 
    width: 120, 
    valueFormatter: (params?: { value?: boolean }) => params?.value ? 'Yes' : 'No',
    renderCell: (params: GridRenderCellParams<Car, boolean>) => params.value ? 'Yes' : 'No' 
  },
  { 
    field: 'registeredDate', 
    headerName: 'Registered Date', 
    width: 150,
    valueFormatter: (params?: { value?: string | Date }) => {
      if (!params?.value) return 'N/A';
      try {
        const date = new Date(params.value);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
      } catch {
        return 'Invalid Date';
      }
    }
  },
];

interface CarInventoryProps {
  filters: CarReportFilters;
  setFilteredCars: (cars: Car[]) => void;
}

export default function CarInventory({ filters, setFilteredCars }: CarInventoryProps) {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [localFilteredCars, setLocalFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAllCars();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch car data');
        }

        const combinedCars = [
          ...(response.data?.regularCars?.carList || []).map((car: any) => ({ 
            ...car, 
            id: `regular-${car.id}`,
            carType: 'Regular',
            inspected: car.inspected ?? false,
            registeredDate: car.registeredDate || null
          })),
          ...(response.data?.organizationCars?.organizationCarList || []).map((car: any) => ({ 
            ...car, 
            id: `org-${car.id}`,
            carType: 'Organization',
            inspected: car.inspected ?? false,
            registeredDate: car.registeredDate || null
          })),
          ...(response.data?.rentalCars?.rentCarList || []).map((car: any) => ({ 
            ...car, 
            id: `rental-${car.id}`,
            carType: 'Rental',
            inspected: car.inspected ?? false,
            registeredDate: car.registeredDate || null
          })),
        ].filter((car): car is Car => Boolean(car));

        setAllCars(combinedCars);
        setLocalFilteredCars(combinedCars);
        setFilteredCars(combinedCars);
      } catch (err) {
        console.error('Error loading car data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setFilteredCars]);

  useEffect(() => {
    if (allCars.length === 0) return;

    const result = allCars.filter(car => {
      if (filters.carType && car.carType !== filters.carType) return false;
      if (filters.status && car.status !== filters.status) return false;
      if (filters.model && car.model !== filters.model) return false;
      
      if (filters.start && filters.end) {
        try {
          const startDate = new Date(filters.start);
          const endDate = new Date(filters.end);
          const carDate = car.registeredDate ? new Date(car.registeredDate) : null;
          
          if (!carDate || isNaN(carDate.getTime())) return false;
          if (carDate < startDate || carDate > endDate) return false;
        } catch {
          return false;
        }
      }

      return true;
    });

    setLocalFilteredCars(result);
    setFilteredCars(result);
  }, [filters, allCars, setFilteredCars]);

  if (loading) return <div className="text-center py-4">Loading car inventory...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Car Inventory</h2>
      {localFilteredCars.length > 0 ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={localFilteredCars}
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
          />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          {allCars.length === 0 ? 'No cars available' : 'No cars match the selected filters'}
        </div>
      )}
    </div>
  );
}