'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchAllCars } from '@/app/tms-modules/admin/reports/api/carReports';

const COLORS = ['#3c8dbc', '#00C49F', '#FFBB28', '#FF8042'];

interface CarTypeBreakdownProps {
  filters?: {
    start?: string;
    end?: string;
    carType?: string;
    status?: string;
    model?: string;
  };
}

export default function CarTypeBreakdown({ filters = {} }: CarTypeBreakdownProps) {
  const [typeData, setTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAllCars();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch car data');
        }

        // Get all cars and apply filters
        let regularCars = response.data?.regularCars?.carList || [];
        let orgCars = response.data?.organizationCars?.organizationCarList || [];
        let rentalCars = response.data?.rentalCars?.rentCarList || [];

        // Apply filters to each type
        if (filters.start && filters.end) {
          const filterByDate = (cars: any[]) => cars.filter((car: any) => {
            const carDate = car.registeredDate || '1970-01-01';
            return filters.start && filters.end && carDate >= filters.start && carDate <= filters.end;
          });
          
          regularCars = filterByDate(regularCars);
          orgCars = filterByDate(orgCars);
          rentalCars = filterByDate(rentalCars);
        }

        if (filters.status) {
          const filterByStatus = (cars: any[]) => cars.filter((car: any) => 
            filters.status && car.status?.toLowerCase().includes(filters.status.toLowerCase())
          );
          
          regularCars = filterByStatus(regularCars);
          orgCars = filterByStatus(orgCars);
          rentalCars = filterByStatus(rentalCars);
        }

        if (filters.model) {
          const filterByModel = (cars: any[]) => cars.filter((car: any) => 
            filters.model && car.model?.toLowerCase().includes(filters.model.toLowerCase())
          );
          
          regularCars = filterByModel(regularCars);
          orgCars = filterByModel(orgCars);
          rentalCars = filterByModel(rentalCars);
        }

        // Count each car type after filtering
        const regularCount = regularCars.length;
        const orgCount = orgCars.length;
        const rentalCount = rentalCars.length;

        setTypeData([
          { name: 'Regular', value: regularCount },
          { name: 'Organization', value: orgCount },
          { name: 'Rental', value: rentalCount },
        ]);
      } catch (error) {
        console.error('Error loading car type data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) return <div className="text-center py-4">Loading type data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Car Type Distribution</h2>
      {typeData.length > 0 ? (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {typeData.map((item, index) => (
              <div key={item.name} className="p-2 rounded" style={{ backgroundColor: COLORS[index] + '20' }}>
                <p className="font-medium">{item.name}</p>
                <p className="text-lg font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">No type data available</div>
      )}
    </div>
  );
}