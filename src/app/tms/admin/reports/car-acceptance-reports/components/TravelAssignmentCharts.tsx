'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchTravelRequests, fetchDailyServiceRequests } from '@/app/tms/admin/reports/api/travelReports';

const COLORS = ['#3c8dbc', '#00C49F', '#FFBB28', '#FF8042'];

export default function TravelAssignmentCharts() {
  const [travelStatusData, setTravelStatusData] = useState<any[]>([]);
  const [serviceTypeData, setServiceTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [travelRequests, serviceRequests] = await Promise.all([
          fetchTravelRequests(),
          fetchDailyServiceRequests()
        ]);

        // Process travel request status data
        const travelStatusCounts = travelRequests.reduce((acc: any, request: any) => {
          acc[request.status] = (acc[request.status] || 0) + 1;
          return acc;
        }, {});

        setTravelStatusData(Object.keys(travelStatusCounts).map(status => ({
          name: status,
          value: travelStatusCounts[status]
        })));

        // Process service request type data (example - could be by destination or other criteria)
        const serviceTypeCounts = serviceRequests.reduce((acc: any, request: any) => {
          const type = request.endingPlace || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        setServiceTypeData(Object.keys(serviceTypeCounts).map(type => ({
          name: type,
          value: serviceTypeCounts[type]
        })));
      } catch (error) {
        console.error('Error loading travel data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Travel Request Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={travelStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {travelStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Service Request Destinations</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={serviceTypeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3c8dbc" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}