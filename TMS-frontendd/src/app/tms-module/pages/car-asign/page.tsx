'use client';
export default function AssignCarPage() {
  const departments = [
    { name: 'Administration', assignedVehicle: 'VH001 - Sedan', contact: 'admin@example.com' },
    { name: 'Faculty', assignedVehicle: 'VH002 - SUV', contact: 'faculty@example.com' },
    { name: 'Maintenance', assignedVehicle: 'VH003 - Truck', contact: 'maintenance@example.com' },
    { name: 'Guest Services', assignedVehicle: 'Not assigned', contact: 'guest@example.com' },
  ];

  const availableVehicles = [
    'VH001 - Sedan',
    'VH002 - SUV',
    'VH003 - Truck',
    'VH004 - Van',
    'VH005 - Sedan',
    'VH006 - SUV',
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Assign Car for Department</h1>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Assigned Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {departments.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-800/50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{dept.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select 
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      defaultValue={dept.assignedVehicle}
                    >
                      <option value="Not assigned">Not assigned</option>
                      {availableVehicles.map(vehicle => (
                        <option key={vehicle} value={vehicle}>{vehicle}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{dept.contact}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button className="text-cyan-400 hover:text-cyan-300">Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}