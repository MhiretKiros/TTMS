// AssignmentTypeBreakdown.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchAssignmentHistories } from '@/app/tms-modules/admin/reports/api/carReports';
import { CarAssignmentFilters } from '../types';

const COLORS = ['#3c8dbc', '#00C49F', '#FFBB28', '#FF8042'];

interface AssignmentTypeBreakdownProps {
  filters?: Partial<CarAssignmentFilters>;
}

// Define the assignment type if not already imported
interface AssignmentHistory {
  plateNumber?: string;
  allPlateNumbers?: string;
  status?: string;
  position?: string;
  assignedDate?: string;
  rentalType?: string;
}

export default function AssignmentTypeBreakdown({
  filters = { plateNumber: '', status: '', position: '', start: '', end: '' }
}: AssignmentTypeBreakdownProps) {
  const [typeData, setTypeData] = useState<{ name: string; value: number }[]>([]);
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

        // Count each assignment type
        const standardCount = assignments.filter((a: AssignmentHistory) => a.rentalType === 'standard').length;
        const projectCount = assignments.filter((a: AssignmentHistory) => a.rentalType === 'project').length;
        const otherCount = assignments.filter((a: AssignmentHistory) => !a.rentalType || !['standard', 'project'].includes(a.rentalType)).length;

        setTypeData([
          { name: 'Standard', value: standardCount },
          { name: 'Project', value: projectCount },
          { name: 'Other', value: otherCount },
        ]);
      } catch (error) {
        console.error('Error loading assignment type data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) return <div className="text-center py-4">Loading type data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Assignment Type Distribution</h2>
      {typeData.length > 0 ? (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {typeData.map((item, index) => (
              <div key={item.name} className="p-2 rounded" style={{ backgroundColor: COLORS[index] + '20' }}>
                <p className="font-medium">{item.name}</p>
                <p className="text-lg font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500">No type data available</div>
      )}
    </div>
  );
}