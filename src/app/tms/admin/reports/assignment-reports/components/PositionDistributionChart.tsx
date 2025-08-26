// PositionDistributionChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAssignmentHistories } from '@/app/tms/admin/reports/api/carReports';
import { CarAssignmentFilters } from '../types';

// Position name mapping
const POSITION_NAMES: Record<string, string> = {
  'Level 1': 'Directorate',
  'Level 2': 'Director',
  'Level 3': 'Sub Director',
  'Level 4': 'Division',
  'Level 5': 'Expert'
};

interface AssignmentHistory {
  assignedDate?: string;
  plateNumber?: string;
  allPlateNumbers?: string;
  status?: string;
  position?: string;
}

export default function PositionDistributionChart({ filters }: { filters: CarAssignmentFilters }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAssignmentHistories();

        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch assignment data');
        }

        let assignments: AssignmentHistory[] = response.data?.assignmentHistoryList || [];

        // Apply filters
        if (filters.plateNumber) {
          assignments = assignments.filter((assignment: AssignmentHistory) =>
            assignment.plateNumber?.toLowerCase().includes(filters.plateNumber!.toLowerCase()) ||
            assignment.allPlateNumbers?.toLowerCase().includes(filters.plateNumber!.toLowerCase())
          );
        }

        if (filters.status) {
          assignments = assignments.filter((assignment: AssignmentHistory) =>
            assignment.status?.toLowerCase() === filters.status!.toLowerCase()
          );
        }

        if (filters.start && filters.end) {
          assignments = assignments.filter((assignment: AssignmentHistory) => {
            const assignDate = assignment.assignedDate || '1970-01-01';
            return assignDate >= filters.start! && assignDate <= filters.end!;
          });
        }

        // Count assignments by position (Level 1 to Level 5)
        const positionCounts = assignments.reduce((acc: Record<string, number>, assignment: AssignmentHistory) => {
          const position = assignment.position || 'Unknown';
          acc[position] = (acc[position] || 0) + 1;
          return acc;
        }, {});

        // Create data for all levels with the requested names
        const chartData = [
          { level: 'Level 1', name: POSITION_NAMES['Level 1'], count: positionCounts['Level 1'] || 0 },
          { level: 'Level 2', name: POSITION_NAMES['Level 2'], count: positionCounts['Level 2'] || 0 },
          { level: 'Level 3', name: POSITION_NAMES['Level 3'], count: positionCounts['Level 3'] || 0 },
          { level: 'Level 4', name: POSITION_NAMES['Level 4'], count: positionCounts['Level 4'] || 0 },
          { level: 'Level 5', name: POSITION_NAMES['Level 5'], count: positionCounts['Level 5'] || 0 }
        ];

        setData(chartData);
      } catch (error) {
        console.error('Error loading position data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) return <div className="text-center py-4">Loading position data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Position Distribution</h3>
      {data.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [`${value} Assignments`, 'Count']}
                labelFormatter={(label) => `Position: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Number of Assignments"
                fill="#3c8dbc"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) :  (
        <div className="text-center py-4 text-gray-500">No position data available</div>
      )}
    </div>
  );
}