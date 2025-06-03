'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyService } from '../types';

interface WeeklyData {
  week: string;
  count: number;
  pending: number;
  assigned: number;
  completed: number;
}

export default function WeeklyDailyServiceGraph({ dailyServices }: { dailyServices: DailyService[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const processWeeklyData = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const weeklyData: WeeklyData[] = [];
    let currentWeekStart = new Date(firstDay);
    let weekNumber = 1;
    
    while (currentWeekStart <= lastDay) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      if (currentWeekEnd > lastDay) currentWeekEnd.setDate(lastDay.getDate());

      const weekServices = dailyServices.filter(service => {
        const serviceDate = new Date(service.dateTime);
        return serviceDate >= currentWeekStart && serviceDate <= currentWeekEnd;
      });

      weeklyData.push({
        week: `Week ${weekNumber}`,
        count: weekServices.length,
        pending: weekServices.filter(s => s.status === 'PENDING').length,
        assigned: weekServices.filter(s => s.status === 'ASSIGNED').length,
        completed: weekServices.filter(s => s.status === 'COMPLETED').length
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    return weeklyData;
  };

  const weeklyData = processWeeklyData();

  const handleMonthChange = (months: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Weekly Daily Services - {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
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
      
      {dailyServices.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="week" 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
                interval={0}
                height={40}
              />
              <YAxis 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3c8dbc" 
                strokeWidth={2}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke="#FFBB28" 
                strokeWidth={2}
                name="Pending"
              />
              <Line 
                type="monotone" 
                dataKey="assigned" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Assigned"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No daily service data available</div>
      )}
    </div>
  );
}