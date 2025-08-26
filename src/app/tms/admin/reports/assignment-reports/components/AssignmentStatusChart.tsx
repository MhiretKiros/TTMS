// AssignmentStatusChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAssignmentHistories } from '@/app/tms/admin/reports/api/carReports';
import { CarAssignmentFilters } from '../types';

interface StatusData {
  name: string;
  count: number;
}

interface PositionData {
  name: string;
  count: number;
}

// If you have a type for assignment history, import it here
interface AssignmentHistory {
  plateNumber?: string;
  allPlateNumbers?: string;
  status?: string;
  position?: string;
  assignedDate?: string;
}

export default function AssignmentStatusChart({ filters }: { filters: CarAssignmentFilters }) {
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [positionData, setPositionData] = useState<PositionData[]>([]);
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

        if (filters.position) {
          assignments = assignments.filter((assignment: AssignmentHistory) =>
            assignment.position?.toLowerCase() === filters.position!.toLowerCase()
          );
        }

        if (filters.start && filters.end) {
          assignments = assignments.filter((assignment: AssignmentHistory) => {
            const assignDate = assignment.assignedDate || '1970-01-01';
            return assignDate >= filters.start! && assignDate <= filters.end!;
          });
        }

        // Process status data with the requested statuses
        const statusCounts = assignments.reduce((acc: Record<string, number>, assignment: AssignmentHistory) => {
          const status = assignment.status || 'UNKNOWN';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        // Only include the requested statuses
        const requestedStatuses = ['Pending', 'Assigned', 'Approved', 'Completed', 'Waiting', 'In_transfer'];
        setStatusData(
          requestedStatuses.map(status => ({
            name: status,
            count: statusCounts[status] || 0
          }))
        );

        // Process position data
        const positionCounts = assignments.reduce((acc: Record<string, number>, assignment: AssignmentHistory) => {
          const position = assignment.position || 'Unknown';
          acc[position] = (acc[position] || 0) + 1;
          return acc;
        }, {});

        setPositionData(
          Object.keys(positionCounts).map(position => ({
            name: position,
            count: positionCounts[position]
          }))
        );
      } catch (error) {
        console.error('Error loading assignment data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) return <div className="text-center py-4">Loading assignment data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">Assignment Status Distribution</h3>
      {statusData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
              />
              <YAxis 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#3c8dbc" 
                name="Number of Assignments"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No status data available</div>
      )}
    </div>
  );
}