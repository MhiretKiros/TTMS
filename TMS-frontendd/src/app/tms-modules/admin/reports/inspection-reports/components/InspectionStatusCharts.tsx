'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchInspections } from '@/app/tms-modules/admin/reports/api/carReports';
import { Inspection, InspectionReportFilters } from '../types';

const COLORS = ['#3c8dbc', '#00C49F', '#FFBB28', '#FF8042'];

interface StatusData {
  name: string;
  value: number;
}

interface InspectionStatusChartsProps {
  filters?: Partial<InspectionReportFilters>;
  statusOptions?: string[];
}

export default function InspectionStatusCharts({ 
  filters = {
    plateNumber: '',
    status: '',
  }, 
  statusOptions = ['Approved', 'Rejected', 'ReadyWithWarning'] 
}: InspectionStatusChartsProps) {
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchInspections();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch inspection data');
        }

        let inspections: Inspection[] = response.inspections;

        // Apply filters with proper null checks
        if (filters.plateNumber) {
          inspections = inspections.filter(inspection => 
            inspection.plateNumber.toLowerCase().includes(filters.plateNumber?.toLowerCase() ?? '')
          );
        }

        if (filters.status) {
          inspections = inspections.filter(inspection => 
            inspection.inspectionStatus.toLowerCase().includes(filters.status?.toLowerCase() ?? '')
          );
        }

        if (filters.start && filters.end) {
          const startDate = new Date(filters.start);
          const endDate = new Date(filters.end);
          inspections = inspections.filter(inspection => {
            const inspectionDate = new Date(inspection.inspectionDate);
            return inspectionDate >= startDate && inspectionDate <= endDate;
          });
        }

        // Process status data with proper typing
        const statusCounts: Record<string, number> = inspections.reduce((acc, inspection) => {
          const status = inspection.inspectionStatus;
          if (statusOptions.includes(status)) {
            acc[status] = (acc[status] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        setStatusData(
          statusOptions.map(status => ({
            name: status,
            value: statusCounts[status] || 0
          }))
        );
      } catch (error) {
        console.error('Error loading inspection data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, statusOptions]);

  if (loading) return <div className="text-center py-4">Loading status data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Inspection Status Distribution</h2>
      {statusData.length > 0 ? (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {statusData.map((item, index) => (
              <div key={item.name} className="p-2 rounded" style={{ backgroundColor: COLORS[index] + '20' }}>
                <p className="font-medium">{item.name}</p>
                <p className="text-lg font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">No status data available</div>
      )}
    </div>
  );
}