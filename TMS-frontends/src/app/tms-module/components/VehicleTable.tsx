export default function VehicleTable() {
    const vehicles = [
      { id: 'VH001', type: 'Sedan', status: 'Available', lastService: '2023-05-15', location: 'Parking A' },
      { id: 'VH002', type: 'SUV', status: 'In Service', lastService: '2023-04-20', location: 'Workshop' },
      { id: 'VH003', type: 'Truck', status: 'Assigned', lastService: '2023-05-01', location: 'On Route' },
      { id: 'VH004', type: 'Van', status: 'Available', lastService: '2023-05-10', location: 'Parking B' },
      { id: 'VH005', type: 'Sedan', status: 'Maintenance', lastService: '2023-03-28', location: 'Workshop' },
    ];
  
    const statusColors = {
      Available: 'bg-emerald-500/10 text-emerald-400',
      'In Service': 'bg-amber-500/10 text-amber-400',
      Assigned: 'bg-blue-500/10 text-blue-400',
      Maintenance: 'bg-red-500/10 text-red-400',
    };
  
    // Example for VehicleTable.tsx
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle ID
              </th>
              {/* ... other headers ... */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vehicle.id}
                </td>
                {/* ... other cells ... */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }