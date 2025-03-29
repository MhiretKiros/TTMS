'use client';
export default function CarLocationPage() {
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
                <div className="flex items-center justify-between">
                  <span className="text-sm">Available Vehicles</span>
                  <span className="font-medium">22</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Transit</span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Maintenance</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-cyan-400">Recent Movements</h2>
              <div className="space-y-4">
                {[
                  { id: 'VH001', time: '2 min ago', from: 'Parking A', to: 'Main Gate' },
                  { id: 'VH003', time: '15 min ago', from: 'Workshop', to: 'Parking B' },
                  { id: 'VH007', time: '32 min ago', from: 'Building 2', to: 'Workshop' },
                ].map((movement) => (
                  <div key={movement.id} className="flex items-start">
                    <div className="bg-cyan-500/10 p-1 rounded-full mr-3 mt-1">
                      <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Vehicle {movement.id}</div>
                      <div className="text-xs text-gray-400">
                        {movement.from} → {movement.to}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{movement.time}</div>
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