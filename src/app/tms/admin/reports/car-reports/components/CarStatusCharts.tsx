'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAllCars } from '@/app/tms/admin/reports/api/carReports';

interface CarStatusChartsProps {
  filters?: {
    start?: string;
    end?: string;
    carType?: string;
    status?: string;
    model?: string;
  };
}

export default function CarStatusCharts({ filters = {} }: CarStatusChartsProps) {
  const [statusData, setStatusData] = useState<any[]>([]);
  const [modelData, setModelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAllCars();

        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch car data');
        }

        // Combine all car types
        let allCars = [
          ...(response.data?.regularCars?.carList || []).map((car: any) => ({ ...car, type: 'Regular' })),
          ...(response.data?.organizationCars?.organizationCarList || []).map((car: any) => ({ ...car, type: 'Organization' })),
          ...(response.data?.rentalCars?.rentCarList || []).map((car: any) => ({ ...car, type: 'Rental' })),
        ];

        // Apply filters safely
        if (filters.start && filters.end) {
          allCars = allCars.filter(car => {
            const carDate = car.registeredDate || '1970-01-01';
            return carDate >= filters.start! && carDate <= filters.end!;
          });
        }
        if (filters.carType && typeof filters.carType === 'string') {
          allCars = allCars.filter(car => car.type && car.type.toLowerCase() === filters.carType!.toLowerCase());
        }
        if (filters.status && typeof filters.status === 'string') {
          allCars = allCars.filter(car => car.status && car.status.toLowerCase().includes(filters.status!.toLowerCase()));
        }
        if (filters.model && typeof filters.model === 'string') {
          allCars = allCars.filter(car => car.model && car.model.toLowerCase().includes(filters.model!.toLowerCase()));
        }

        // Process status data
        const statusCounts = allCars.reduce((acc: any, car: any) => {
          const status = car.status || 'UNKNOWN';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        setStatusData(Object.keys(statusCounts).map(status => ({
          name: status,
          count: statusCounts[status]
        })));

        // Process model data (top 5 models)
        const modelCounts = allCars.reduce((acc: any, car: any) => {
          const model = car.model || 'Unknown';
          acc[model] = (acc[model] || 0) + 1;
          return acc;
        }, {});

        const sortedModels = Object.entries(modelCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({
            name,
            count
          }));

        setModelData(sortedModels);
      } catch (error) {
        console.error('Error loading car status data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) return <div className="text-center py-4">Loading status data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Car Status Distribution</h3>
        {statusData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3c8dbc" name="Number of Cars" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No status data available</div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Top Car Models</h3>
        {modelData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" name="Number of Cars" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No model data available</div>
        )}
      </div>
    </div>
  );
}