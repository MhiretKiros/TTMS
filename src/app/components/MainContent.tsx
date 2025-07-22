"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useRouter } from "next/navigation";

export default function MainContent() {
  const router = useRouter();
  const areaChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  useEffect(() => {
    if (!areaChartRef.current || !pieChartRef.current) return;

    // Area Chart
    const areaCtx = areaChartRef.current.getContext("2d");
    const areaChart = new Chart(areaCtx!, {
      type: "line",
      data: {
        labels: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        datasets: [
          {
            label: "Series 1",
            data: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });

    // Pie Chart
    const pieCtx = pieChartRef.current.getContext("2d");
    const pieChart = new Chart(pieCtx!, {
      type: "pie",
      data: {
        labels: ["Engineering", "Management", "Economics", "Marketing", "Others"],
        datasets: [
          {
            data: [14.8, 4.9, 2.6, 1.5, 5.5],
            backgroundColor: [
              "#4CAF50", "#FF9800", "#F44336", "#2196F3", "#9C27B0"
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw}%`;
              },
            },
          },
        },
      },
    });

    return () => {
      areaChart.destroy();
      pieChart.destroy();
    };
  }, []);



  const employees = [
    { name: "John Doe", department: "Engineering", position: "Software Engineer", salary: "$100,000" },
    { name: "Jane Smith", department: "Management", position: "Project Manager", salary: "$120,000" },
    { name: "Bob Johnson", department: "Economics", position: "Economist", salary: "$90,000" },
    { name: "Alice Brown", department: "Marketing", position: "Marketing Specialist", salary: "$80,000" },
    { name: "Charlie Davis", department: "Others", position: "Administrative Assistant", salary: "$50,000" },
  ];

  const totalPages = Math.ceil(employees.length / rowsPerPage);
  const currentRows = employees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-4">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">HR Manager</h2>
          <button
            onClick={() => router.push('/hr')}
            className="mt-2 bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded text-sm transition-colors"
          >
            View Details
          </button>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Payroll</h2>
          <button
            onClick={() => router.push('/payroll')}
            className="mt-2 bg-yellow-700 hover:bg-yellow-800 px-3 py-1.5 rounded text-sm transition-colors"
          >
            View Details
          </button>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Procurement</h2>
          <button
            onClick={() => router.push('/procurement')}
            className="mt-2 bg-green-700 hover:bg-green-800 px-3 py-1.5 rounded text-sm transition-colors"
          >
            View Details
          </button>
        </div>
        <div className="bg-red-500 text-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Lookup</h2>
          <button
            onClick={() => router.push('/lookup')}
            className="mt-2 bg-red-700 hover:bg-red-800 px-3 py-1.5 rounded text-sm transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Employee Growth</h2>
          <canvas ref={areaChartRef} height="300"></canvas>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Department Distribution</h2>
          <canvas ref={pieChartRef} height="300"></canvas>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Employee Directory</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase">Department</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase">Position</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase">Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRows.map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{employee.name}</td>
                  <td className="py-3 px-4">{employee.department}</td>
                  <td className="py-3 px-4">{employee.position}</td>
                  <td className="py-3 px-4">{employee.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}