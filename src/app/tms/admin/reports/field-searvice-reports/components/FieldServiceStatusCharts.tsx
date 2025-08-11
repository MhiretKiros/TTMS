'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FieldService } from '../types';

// Custom color palette
const COLORS = [
  '#3c8dbc', // Blue
  '#00a65a', // Green
  '#f39c12', // Orange
  '#dd4b39', // Red
  '#605ca8', // Purple
  '#ff851b'  // Dark Orange
];

interface FieldServiceStatusChartsProps {
  fieldServices: FieldService[];
}

export default function FieldServiceStatusCharts({ fieldServices }: FieldServiceStatusChartsProps) {
  const statusOptions = ['PENDING', 'APPROVED', 'ASSIGNED', 'COMPLETED', 'FINISHED', 'REJECTED'];

  const statusData = statusOptions.map(status => ({
    name: status,
    value: fieldServices.filter(service => service.status === status).length
  }));

  return (
    <div className="space-y-4 h-full">
      <h2 className="text-xl font-semibold text-gray-800">Status Distribution</h2>
      {fieldServices.length > 0 ? (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                paddingAngle={0} // No gap between segments
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none" // No border
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} services`, name]}
                contentStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                layout="horizontal" // Horizontal layout
                verticalAlign="bottom" // Position at bottom
                align="center" // Center aligned
                wrapperStyle={{
                  paddingTop: '20px' // Add some space above legend
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No status data available</div>
      )}
    </div>
  );
}