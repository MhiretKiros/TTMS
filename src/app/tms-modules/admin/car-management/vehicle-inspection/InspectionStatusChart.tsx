// src/app/tms-modules/admin/car-management/vehicle-inspection/components/InspectionStatusChart.tsx
"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Car } from './page'; // Assuming Car type is exported or defined in page.tsx

interface InspectionStatusChartProps {
  cars: Car[];
}

const COLORS = {
  Approved: '#10B981', // Emerald 500
  Rejected: '#EF4444', // Red 500
  ConditionallyApproved: '#F59E0B', // Amber 500
  InspectedOther: '#A855F7', // Purple 500 (Used for inspected but unknown result)
  NotInspected: '#6B7280', // Gray 500
  Unknown: '#D1D5DB', // Gray 300
};

const processChartData = (cars: Car[]) => {
  const counts: { [key: string]: number } = {
    Approved: 0,
    Rejected: 0,
    ConditionallyApproved: 0,
    InspectedOther: 0, // Renamed from Pending
    NotInspected: 0,
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
      // If inspected but result is null/undefined/unknown, count as 'InspectedOther'
      counts.InspectedOther++;
    }
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0); // Only include statuses with counts > 0
};

// Custom label renderer
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is significant enough (e.g., > 5%)
  if (percent * 100 < 5) {
      return null;
  }

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
      {`${value} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
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
          innerRadius={60} // Make it a donut chart
          outerRadius={110} // Slightly larger outer radius
          fill="#8884d8"
          dataKey="value"
          label={renderCustomizedLabel} // Use custom label
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
