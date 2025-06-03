'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchAllCars } from '@/app/tms-modules/admin/reports/api/carReports';
import { Car, CarReportFilters } from '../types';

const columns: GridColDef[] = [
  { field: 'plateNumber', headerName: 'Plate Number', width: 150 },
  { field: 'carType', headerName: 'Type', width: 120 },
  { field: 'model', headerName: 'Model', width: 150 },
  { field: 'manufactureYear', headerName: 'Year', width: 100 },
  { field: 'status', headerName: 'Status', width: 150 },
  { field: 'fuelType', headerName: 'Fuel Type', width: 120 },
  { field: 'parkingLocation', headerName: 'Location', width: 150 },
  { field: 'inspected', headerName: 'Inspected', width: 120, 
    renderCell: (params) => params.value ? 'Yes' : 'No' },
  { field: 'registeredDate', headerName: 'Registered Date', width: 150,
    valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
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
        const response = await fetchAllCars();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch car data');
        }

        const combinedCars = [
          ...(response.data?.regularCars?.carList || []).map((car: any) => ({ 
            ...car, 
            id: `regular-${car.id}`,
            carType: 'Regular' 
          })),
          ...(response.data?.organizationCars?.organizationCarList || []).map((car: any) => ({ 
            ...car, 
            id: `org-${car.id}`,
            carType: 'Organization' 
          })),
          ...(response.data?.rentalCars?.rentCarList || []).map((car: any) => ({ 
            ...car, 
            id: `rental-${car.id}`,
            carType: 'Rental' 
          })),
        ];

        setAllCars(combinedCars);
        setLocalFilteredCars(combinedCars);
        setFilteredCars(combinedCars); // Initialize parent component's filtered cars
      } catch (error) {
        console.error('Error loading car data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setFilteredCars]);

  useEffect(() => {
    if (allCars.length === 0) return;

    let result = [...allCars];

    if (filters.carType) {
      result = result.filter(car => car.carType === filters.carType);
    }

    if (filters.status) {
      result = result.filter(car => car.status === filters.status);
    }

    if (filters.model) {
      result = result.filter(car => car.model === filters.model);
    }

    if (filters.start && filters.end) {
      const startDate = new Date(filters.start);
      const endDate = new Date(filters.end);
      result = result.filter(car => {
        const carDate = new Date(car.registeredDate);
        return carDate >= startDate && carDate <= endDate;
      });
    }

    setLocalFilteredCars(result);
    setFilteredCars(result); // Update parent component's filtered cars
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
      ) : (
        <div className="text-center py-4 text-gray-500">No cars match the selected filters</div>
      )}
    </div>
  );
}