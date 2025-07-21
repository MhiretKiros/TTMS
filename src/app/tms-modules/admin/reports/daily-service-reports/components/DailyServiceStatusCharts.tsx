'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyService } from '../types';

const COLORS = [
  '#FFBB28', // Yellow (Pending)
  '#8884d8', // Purple (Assigned)
  '#00C49F'  // Green (Completed)
];

interface DailyServiceStatusChartsProps {
  dailyServices: DailyService[];
}

export default function DailyServiceStatusCharts({ dailyServices }: DailyServiceStatusChartsProps) {
  const statusOptions = ['PENDING', 'ASSIGNED', 'COMPLETED'];

  const statusData = statusOptions.map(status => ({
    name: status,
    value: dailyServices.filter(service => service.status === status).length
  }));

  return (
    <div className="space-y-4 h-full">
      <h2 className="text-xl font-semibold text-gray-800">Status Distribution</h2>
      {dailyServices.length > 0 ? (
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
                paddingAngle={0}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="none"
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
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: '20px'
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