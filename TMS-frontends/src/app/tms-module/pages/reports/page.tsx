'use client';
export default function ReportsPage() {
    const reportTypes = [
      { name: 'Vehicle Utilization', icon: '🚗', description: 'Track vehicle usage and efficiency metrics' },
      { name: 'Maintenance History', icon: '🔧', description: 'View all service records and maintenance costs' },
      { name: 'Fuel Consumption', icon: '⛽', description: 'Analyze fuel usage patterns and costs' },
      { name: 'Driver Activity', icon: '👤', description: 'Monitor driver assignments and performance' },
      { name: 'Cost Analysis', icon: '💰', description: 'Breakdown of all transport-related expenses' },
      { name: 'Custom Report', icon: '📋', description: 'Create a customized report with specific parameters' },
    ];
  
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-cyan-500 transition-colors cursor-pointer"
            >
              <div className="flex items-start">
                <span className="text-3xl mr-4">{report.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400">{report.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{report.description}</p>
                </div>
              </div>
              <button className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 flex items-center">
                Generate Report
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }