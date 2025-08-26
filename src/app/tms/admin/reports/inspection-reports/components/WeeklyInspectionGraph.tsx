'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchInspections } from '@/app/tms/admin/reports/api/carReports';
import { Inspection, InspectionReportFilters } from '../types';

interface WeeklyData {
  week: string;
  count: number;
  approved: number;
  rejected: number;
  warning: number;
  dateRange: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: WeeklyData;
  }[];
  label?: string;
}

export default function WeeklyInspectionGraph({ filters }: { filters: InspectionReportFilters }) {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
          inspections = inspections.filter((inspection: Inspection) => 
            inspection.plateNumber.toLowerCase().includes(filters.plateNumber.toLowerCase())
          );
        }

        if (filters.status) {
          inspections = inspections.filter((inspection: Inspection) => 
            inspection.inspectionStatus.toLowerCase().includes(filters.status.toLowerCase())
          );
        }

        if (filters.start && filters.end) {
          const startDate = new Date(filters.start);
          const endDate = new Date(filters.end);
          inspections = inspections.filter((inspection: Inspection) => {
            const inspectionDate = new Date(inspection.inspectionDate);
            return inspectionDate >= startDate && inspectionDate <= endDate;
          });
        }

        // Get first and last day of current month
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        // Group by week
        const weeklyData: WeeklyData[] = [];
        let currentWeekStart = new Date(firstDay);
        let weekNumber = 1;
        
        while (currentWeekStart <= lastDay) {
          const currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
          if (currentWeekEnd > lastDay) currentWeekEnd.setDate(lastDay.getDate());

          const weekInspections = inspections.filter((inspection: Inspection) => {
            const inspectionDate = new Date(inspection.inspectionDate);
            return inspectionDate >= currentWeekStart && inspectionDate <= currentWeekEnd;
          });

          const weekCount = weekInspections.length;
          const approved = weekInspections.filter((inspection: Inspection) => inspection.inspectionStatus === 'Approved').length;
          const rejected = weekInspections.filter((inspection: Inspection) => inspection.inspectionStatus === 'Rejected').length;
          const warning = weekInspections.filter((inspection: Inspection) => inspection.inspectionStatus === 'ReadyWithWarning').length;

          // Format the date range (e.g., "1-5" or "6-12")
          const startDay = currentWeekStart.getDate();
          const endDay = currentWeekEnd.getDate();
          const dateRange = `${startDay}-${endDay}`;

          weeklyData.push({
            week: `Week ${weekNumber}`,
            count: weekCount,
            approved,
            rejected,
            warning,
            dateRange
          });

          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
          weekNumber++;
        }

        setData(weeklyData);
      } catch (error) {
        console.error('Error loading inspection data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentMonth, filters]);

  const handleMonthChange = (months: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setCurrentMonth(newMonth);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-sm">
          <p className="font-semibold">{`${label} (${dataItem.dateRange})`}</p>
          <p className="text-sm">Total: {dataItem.count}</p>
          <p className="text-sm text-green-600">Approved: {dataItem.approved}</p>
          <p className="text-sm text-red-600">Rejected: {dataItem.rejected}</p>
          <p className="text-sm text-yellow-600">Warning: {dataItem.warning}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tick formatter for XAxis
  const formatXAxisTick = (tick: string, index: number) => {
    const dataItem = data[index];
    return `${tick}\n(${dataItem?.dateRange || ''})`;
  };

  if (loading) return <div className="text-center py-4">Loading inspection data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Weekly Inspections - {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => handleMonthChange(-1)}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            Previous
          </button>
          <button 
            onClick={() => handleMonthChange(1)}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
      
      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="week" 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
                tickFormatter={formatXAxisTick}
                interval={0}
                height={40}
              />
              <YAxis 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3c8dbc" 
                strokeWidth={2}
                dot={{ fill: '#3c8dbc', r: 4 }}
                activeDot={{ r: 6, stroke: '#3c8dbc', strokeWidth: 2 }}
                name="Total Inspections"
              />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#00C49F" 
                strokeWidth={2}
                dot={{ fill: '#00C49F', r: 4 }}
                activeDot={{ r: 6, stroke: '#00C49F', strokeWidth: 2 }}
                name="Approved"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#FF8042" 
                strokeWidth={2}
                dot={{ fill: '#FF8042', r: 4 }}
                activeDot={{ r: 6, stroke: '#FF8042', strokeWidth: 2 }}
                name="Rejected"
              />
              <Line 
                type="monotone" 
                dataKey="warning" 
                stroke="#FFBB28" 
                strokeWidth={2}
                dot={{ fill: '#FFBB28', r: 4 }}
                activeDot={{ r: 6, stroke: '#FFBB28', strokeWidth: 2 }}
                name="Warning"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No inspection data available for selected filters</div>
      )}
    </div>
  );
}