'use client';
export default function AssignServicePage() {
    const services = [
      { id: 'SR001', vehicle: 'VH001 - Sedan', type: 'Oil Change', status: 'Pending', assignedTo: 'Not assigned' },
      { id: 'SR002', vehicle: 'VH003 - Truck', type: 'Brake Inspection', status: 'In Progress', assignedTo: 'Tech 1' },
      { id: 'SR003', vehicle: 'VH002 - SUV', type: 'Tire Rotation', status: 'Completed', assignedTo: 'Tech 2' },
    ];
  
    const technicians = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
  
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Assign Service</h1>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{service.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{service.vehicle}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{service.type}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                        service.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{service.assignedTo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <select 
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        defaultValue={service.assignedTo}
                      >
                        <option value="Not assigned">Not assigned</option>
                        {technicians.map(tech => (
                          <option key={tech} value={tech}>{tech}</option>
                        ))}
                      </select>
                      <button className="ml-2 text-cyan-400 hover:text-cyan-300 text-sm">Save</button>
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