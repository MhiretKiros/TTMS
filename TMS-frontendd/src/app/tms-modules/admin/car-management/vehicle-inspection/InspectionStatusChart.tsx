// src/app/tms-modules/admin/car-management/vehicle-inspection/components/InspectionStatusChart.tsx
"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Car } from './page'; // Assuming Car type is exported or defined in page.tsx

interface InspectionStatusChartProps {
  cars: Car[];
}

// Define colors for different statuses
const COLORS = {
  Approved: '#10B981', // Emerald 500
  Rejected: '#EF4444', // Red 500
  ConditionallyApproved: '#F59E0B', // Amber 500
  NotInspected: '#6B7280', // Gray 500
  Pending: '#A855F7', // Purple 500
  Unknown: '#D1D5DB', // Gray 300
};

const processChartData = (cars: Car[]) => {
  const counts: { [key: string]: number } = {
    Approved: 0,
    Rejected: 0,
    ConditionallyApproved: 0,
    NotInspected: 0,
    Pending: 0,
  };

  cars.forEach(car => {
    if (!car.inspected) {
      counts.NotInspected++;
    } else if (car.inspectionResult === 'Approved') {
      counts.Approved++;
    } else if (car.inspectionResult === 'Rejected') {
      counts.Rejected++;
    } else if (car.inspectionResult === 'ConditionallyApproved') { // Check if this status exists
      counts.ConditionallyApproved++;
    } else {
      // If inspected but no specific result, consider it Pending
      counts.Pending++;
    }
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0); // Only include statuses with counts > 0
};

const InspectionStatusChart: React.FC<InspectionStatusChartProps> = ({ cars }) => {
  const chartData = processChartData(cars);

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 py-4">No inspection data to display.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Unknown} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} vehicles`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default InspectionStatusChart;

// Add this interface to page.tsx if it's not already exported
// export interface Car { ... }
