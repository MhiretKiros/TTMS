'use client';
export default function TransportManagementPage() {
    const routes = [
      { id: 'RT001', name: 'Morning Campus Shuttle', vehicle: 'VH004 - Van', driver: 'Driver 1', status: 'Active' },
      { id: 'RT002', name: 'Faculty Commute', vehicle: 'VH001 - Sedan', driver: 'Driver 2', status: 'Completed' },
      { id: 'RT003', name: 'Guest Transport', vehicle: 'VH002 - SUV', driver: 'Driver 3', status: 'Scheduled' },
    ];
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Transport Management</h1>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
            Create New Route
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400">Active Routes</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Route ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Route Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Driver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {routes.map((route) => (
                      <tr key={route.id} className="hover:bg-gray-800/50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{route.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{route.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{route.vehicle}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{route.driver}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            route.status === 'Active' ? 'bg-green-500/10 text-green-400' :
                            route.status === 'Completed' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {route.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          <button className="text-cyan-400 hover:text-cyan-300 mr-3">View</button>
                          <button className="text-purple-400 hover:text-purple-300">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Active Routes</span>
                    <span>5</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Available Vehicles</span>
                    <span>12</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Available Drivers</span>
                    <span>8</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400">Recent Activities</h2>
              <div className="space-y-4">
                {[
                  { id: 'ACT001', description: 'Route RT004 completed', time: '2 hours ago' },
                  { id: 'ACT002', description: 'New vehicle VH006 registered', time: '5 hours ago' },
                  { id: 'ACT003', description: 'Driver assignment changed for RT002', time: '1 day ago' },
                ].map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="bg-cyan-500/10 p-1 rounded-full mr-3 mt-1">
                      <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm">{activity.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }