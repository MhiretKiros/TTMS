'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAllCars } from '@/app/tms-modules/admin/reports/api/carReports';
import { CarReportFilters } from '../types';

interface WeeklyData {
  week: string;
  count: number;
  dateRange: string; // Added for tooltip display
}

export default function MonthlyRegistrationGraph({ filters }: { filters: CarReportFilters }) {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAllCars();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch car data');
        }

        // Combine all cars and apply filters
        let allCars = [
          ...(response.data?.regularCars?.carList || []),
          ...(response.data?.organizationCars?.organizationCarList || []),
          ...(response.data?.rentalCars?.rentCarList || []),
        ];

        // Apply filters
        if (filters.carType) {
          allCars = allCars.filter(car => 
            (filters.carType === 'Regular' && response.data?.regularCars?.carList?.includes(car)) ||
            (filters.carType === 'Organization' && response.data?.organizationCars?.organizationCarList?.includes(car)) ||
            (filters.carType === 'Rental' && response.data?.rentalCars?.rentCarList?.includes(car))
          );
        }

        if (filters.model) {
          allCars = allCars.filter(car => car.model === filters.model);
        }

        if (filters.status) {
          allCars = allCars.filter(car => car.status === filters.status);
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

          const weekCount = allCars.filter(car => {
            const carDate = new Date(car.registeredDate || car.createdAt);
            return carDate >= currentWeekStart && carDate <= currentWeekEnd;
          }).length;

          // Format the date range (e.g., "1-5" or "6-12")
          const startDay = currentWeekStart.getDate();
          const endDay = currentWeekEnd.getDate();
          const dateRange = `${startDay}-${endDay}`;

          weeklyData.push({
            week: `Week ${weekNumber}`, // Show week number only in the label
            count: weekCount,
            dateRange: dateRange // Store the date range separately
          });

          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
          weekNumber++;
        }

        setData(weeklyData);
      } catch (error) {
        console.error('Error loading registration data:', error);
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
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-sm">
          <p className="font-semibold">{`${label} (${dataItem.dateRange})`}</p>
          <p className="text-sm">{`Cars: ${payload[0].value}`}</p>
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

  if (loading) return <div className="text-center py-4">Loading registration data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Monthly Registrations - {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
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
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }} // Increased bottom margin for date ranges
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="week" 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
                tickFormatter={formatXAxisTick}
                interval={0}
                height={40} // Increased height to accommodate two lines
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
                name="Registered Cars"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No registration data available for selected filters</div>
      )}
    </div>
  );
}