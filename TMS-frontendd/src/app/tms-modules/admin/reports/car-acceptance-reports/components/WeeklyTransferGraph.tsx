// WeeklyTransferGraph.tsx
'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { VehicleTransfer } from '../types';

interface WeeklyData {
  week: string;
  count: number;
}

export default function WeeklyTransferGraph({ transfers }: { transfers: VehicleTransfer[] }) {
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

      const weekTransfers = transfers.filter(transfer => {
        const transferDate = new Date(transfer.transferDate);
        return transferDate >= currentWeekStart && transferDate <= currentWeekEnd;
      });

      weeklyData.push({
        week: `Week ${weekNumber}`,
        count: weekTransfers.length
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
          Weekly Vehicle Transfers - {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
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
      
      {transfers.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#00a65a" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name="Transfers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No transfer data available</div>
      )}
    </div>
  );
}