// AssignmentList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchAssignmentHistories } from '@/app/tms/admin/reports/api/carReports';
import { AssignmentHistory, CarAssignmentFilters } from '../types';

const columns: GridColDef[] = [
  { field: 'requestLetterNo', headerName: 'Request No', width: 120 },
  { field: 'requesterName', headerName: 'Requester', width: 150 },
  { field: 'position', headerName: 'Position', width: 120 },
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'allPlateNumbers', headerName: 'Plate Numbers', width: 200 },
  { field: 'status', headerName: 'Status', width: 120 },
  { 
  field: 'assignedDate',
  headerName: 'Assigned Date',
  width: 150,
  valueFormatter: (params: any) => new Date(params.value).toLocaleDateString()
},
];

interface AssignmentListProps {
  filters: CarAssignmentFilters;
  setFilteredAssignments: (assignments: AssignmentHistory[]) => void;
}

export default function AssignmentList({ filters, setFilteredAssignments }: AssignmentListProps) {
  const [allAssignments, setAllAssignments] = useState<AssignmentHistory[]>([]);
  const [localFilteredAssignments, setLocalFilteredAssignments] = useState<AssignmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAssignmentHistories();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch assignment data');
        }

        const assignments = response.data?.assignmentHistoryList || [];
        setAllAssignments(assignments);
        setLocalFilteredAssignments(assignments);
        setFilteredAssignments(assignments); // Initialize parent component's filtered assignments
      } catch (error) {
        console.error('Error loading assignment data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setFilteredAssignments]);

  useEffect(() => {
    if (allAssignments.length === 0) return;

    let result = [...allAssignments];

    if (filters.plateNumber) {
      result = result.filter(assignment => 
        assignment.plateNumber?.toLowerCase().includes(filters.plateNumber.toLowerCase()) ||
        assignment.allPlateNumbers?.toLowerCase().includes(filters.plateNumber.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(assignment => assignment.status === filters.status);
    }

    if (filters.position) {
      result = result.filter(assignment => assignment.position === filters.position);
    }

    if (filters.start && filters.end) {
      const startDate = new Date(filters.start);
      const endDate = new Date(filters.end);
      result = result.filter(assignment => {
        const assignDate = new Date(assignment.assignedDate);
        return assignDate >= startDate && assignDate <= endDate;
      });
    }

    setLocalFilteredAssignments(result);
    setFilteredAssignments(result); // Update parent component's filtered assignments
  }, [filters, allAssignments, setFilteredAssignments]);

  if (loading) return <div className="text-center py-4">Loading assignments...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Assignment History</h2>
      {localFilteredAssignments.length > 0 ? (
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
  rows={localFilteredAssignments}
  columns={columns}
  loading={loading}
  paginationModel={{ pageSize: 10, page: 0 }}
  pageSizeOptions={[10, 25, 50]}
  checkboxSelection
  disableRowSelectionOnClick
  sx={{
    border: 'none',
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#3c8dbc',
      color: 'white',
    },
  }}
/>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No assignments match the selected filters</div>
      )}
    </div>
  );
}