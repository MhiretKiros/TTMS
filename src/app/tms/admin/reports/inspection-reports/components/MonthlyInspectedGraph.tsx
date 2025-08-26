'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchInspections } from '@/app/tms/admin/reports/api/carReports';
import { Inspection, InspectionReportFilters } from '../types';

interface MonthlyData {
  month: string;
  totalInspections: number;
  approved: number;
  rejected: number;
  averageBodyScore: number;
  averageInteriorScore: number;
  commonIssues: {
    mechanical: Record<string, number>;
    body: Record<string, number>;
    interior: Record<string, number>;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: MonthlyData;
  }[];
  label?: string;
}

interface InspectionMechanical {
  [key: string]: boolean;
}

interface InspectionBody {
  [key: string]: {
    problem: boolean;
    severity?: string;
    notes?: string;
  };
}

interface InspectionInterior {
  [key: string]: {
    problem: boolean;
    severity?: string;
    notes?: string;
  };
}

export default function MonthlyInspectedGraph({ filters }: { filters: InspectionReportFilters }) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchInspections();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch inspection data');
        }

        let inspections: Inspection[] = response.inspections;

        // Apply filters
        if (filters.plateNumber) {
          inspections = inspections.filter(inspection => 
            inspection.plateNumber.toLowerCase().includes(filters.plateNumber.toLowerCase())
          );
        }

        if (filters.status) {
          inspections = inspections.filter(inspection => 
            inspection.inspectionStatus.toLowerCase().includes(filters.status.toLowerCase())
          );
        }

        if (filters.start && filters.end) {
          const startDate = new Date(filters.start);
          const endDate = new Date(filters.end);
          inspections = inspections.filter(inspection => {
            const inspectionDate = new Date(inspection.inspectionDate);
            return inspectionDate >= startDate && inspectionDate <= endDate;
          });
        }

        // Group by month
        const monthlyData: Record<string, MonthlyData> = {};
        
        // Initialize all months for the current year
        for (let month = 0; month < 12; month++) {
          const monthName = new Date(currentYear, month, 1).toLocaleString('default', { month: 'short' });
          monthlyData[month] = {
            month: monthName,
            totalInspections: 0,
            approved: 0,
            rejected: 0,
            averageBodyScore: 0,
            averageInteriorScore: 0,
            commonIssues: {
              mechanical: {},
              body: {},
              interior: {}
            }
          };
        }

        // Process each inspection
        inspections.forEach((inspection: Inspection) => {
          const inspectionDate = new Date(inspection.inspectionDate);
          if (inspectionDate.getFullYear() !== currentYear) return;
          
          const month = inspectionDate.getMonth();
          const monthData = monthlyData[month];
          
          monthData.totalInspections++;
          
          if (inspection.inspectionStatus === 'Approved') {
            monthData.approved++;
          } else if (inspection.inspectionStatus === 'Rejected') {
            monthData.rejected++;
          }
          
          monthData.averageBodyScore += inspection.bodyScore;
          monthData.averageInteriorScore += inspection.interiorScore;
          
          // Count mechanical issues
          Object.entries(inspection.mechanical as InspectionMechanical).forEach(([key, value]) => {
            if (value === false) {
              monthData.commonIssues.mechanical[key] = (monthData.commonIssues.mechanical[key] || 0) + 1;
            }
          });
          
          // Count body issues
          Object.entries(inspection.body as InspectionBody).forEach(([key, value]) => {
            if (value.problem) {
              monthData.commonIssues.body[key] = (monthData.commonIssues.body[key] || 0) + 1;
            }
          });
          
          // Count interior issues
          Object.entries(inspection.interior as InspectionInterior).forEach(([key, value]) => {
            if (value.problem) {
              monthData.commonIssues.interior[key] = (monthData.commonIssues.interior[key] || 0) + 1;
            }
          });
        });
        
        // Calculate averages and format final data
        const result = Object.values(monthlyData).map(month => ({
          ...month,
          averageBodyScore: month.totalInspections > 0 
            ? Math.round(month.averageBodyScore / month.totalInspections) 
            : 0,
          averageInteriorScore: month.totalInspections > 0 
            ? Math.round(month.averageInteriorScore / month.totalInspections) 
            : 0,
        }));
        
        setData(result);
      } catch (error) {
        console.error('Error loading inspection data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentYear, filters]);

  const handleYearChange = (years: number) => {
    setCurrentYear(prev => prev + years);
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const monthData = data.find(d => d.month === label) || {
        commonIssues: { mechanical: {}, body: {}, interior: {} }
      };
      
      // Get top 3 issues for each category
      const topMechanical = Object.entries(monthData.commonIssues.mechanical)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const topBody = Object.entries(monthData.commonIssues.body)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const topInterior = Object.entries(monthData.commonIssues.interior)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-sm text-sm">
          <p className="font-semibold mb-2">{label} {currentYear}</p>
          <p>Total Inspections: {payload[0].payload.totalInspections}</p>
          <p>Approved: {payload[0].payload.approved}</p>
          <p>Rejected: {payload[0].payload.rejected}</p>
          <p>Avg Body Score: {payload[0].payload.averageBodyScore}%</p>
          <p>Avg Interior Score: {payload[0].payload.averageInteriorScore}%</p>
          
          {topMechanical.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Top Mechanical Issues:</p>
              <ul className="list-disc pl-4">
                {topMechanical.map(([issue, count]) => (
                  <li key={issue}>{issue}: {count}</li>
                ))}
              </ul>
            </div>
          )}
          
          {topBody.length > 0 && (
            <div className="mt-1">
              <p className="font-medium">Top Body Issues:</p>
              <ul className="list-disc pl-4">
                {topBody.map(([issue, count]) => (
                  <li key={issue}>{issue}: {count}</li>
                ))}
              </ul>
            </div>
          )}
          
          {topInterior.length > 0 && (
            <div className="mt-1">
              <p className="font-medium">Top Interior Issues:</p>
              <ul className="list-disc pl-4">
                {topInterior.map(([issue, count]) => (
                  <li key={issue}>{issue}: {count}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="text-center py-4">Loading inspection data...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Monthly Inspections - {currentYear}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => handleYearChange(-1)}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            Previous
          </button>
          <button 
            onClick={() => handleYearChange(1)}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
      
      {data.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
              />
              <YAxis 
                tick={{ fill: '#555', fontSize: 12 }}
                axisLine={{ stroke: '#ddd' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalInspections" 
                stroke="#3c8dbc" 
                strokeWidth={2}
                dot={{ fill: '#3c8dbc', r: 4 }}
                activeDot={{ r: 6, stroke: '#3c8dbc', strokeWidth: 2 }}
                name="Total Inspections"
              />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#00C49F" 
                strokeWidth={2}
                dot={{ fill: '#00C49F', r: 4 }}
                activeDot={{ r: 6, stroke: '#00C49F', strokeWidth: 2 }}
                name="Approved"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#FF8042" 
                strokeWidth={2}
                dot={{ fill: '#FF8042', r: 4 }}
                activeDot={{ r: 6, stroke: '#FF8042', strokeWidth: 2 }}
                name="Rejected"
              />
              <Line 
                type="monotone" 
                dataKey="averageBodyScore" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', r: 4 }}
                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                name="Avg Body Score"
              />
              <Line 
                type="monotone" 
                dataKey="averageInteriorScore" 
                stroke="#FFBB28" 
                strokeWidth={2}
                dot={{ fill: '#FFBB28', r: 4 }}
                activeDot={{ r: 6, stroke: '#FFBB28', strokeWidth: 2 }}
                name="Avg Interior Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No inspection data available for selected filters</div>
      )}
    </div>
  );
}