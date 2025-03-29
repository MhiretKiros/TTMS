'use client';
export default function CarLocationPage() {
    const vehicles = [
      { id: 'VH001', type: 'Sedan', location: 'Parking Lot A', status: 'Parked', lastUpdate: '5 min ago' },
      { id: 'VH002', type: 'SUV', location: 'Building B', status: 'In Use', lastUpdate: '2 min ago' },
      { id: 'VH003', type: 'Truck', location: 'Main Gate', status: 'Idle', lastUpdate: '10 min ago' },
      { id: 'VH004', type: 'Van', location: 'Service Road', status: 'Moving', lastUpdate: '1 min ago' },
    ];
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Vehicle Locations</h1>
          <div className="flex space-x-3">
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
              Refresh Map
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
              Export Data
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 h-[500px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-5xl mb-4">🌍</div>
                  <h3 className="text-xl font-semibold mb-2">Interactive Map View</h3>
                  <p className="text-gray-400">Vehicle locations would be displayed here with real-time tracking</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400">Vehicle Status</h2>
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div>
                      <div className="font-medium">{vehicle.id} - {vehicle.type}</div>
                      <div className="text-sm text-gray-400">{vehicle.location}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      vehicle.status === 'Parked' ? 'bg-emerald-500/10 text-emerald-400' :
                      vehicle.status === 'In Use' ? 'bg-amber-500/10 text-amber-400' :
                      vehicle.status === 'Moving' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-between">
                  <span>Send Message to All Drivers</span>
                  <span>✉️</span>
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-between">
                  <span>Request Location Update</span>
                  <span>🔄</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }