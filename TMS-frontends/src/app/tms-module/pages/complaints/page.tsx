'use client';
export default function ComplaintsPage() {
  const complaints = [
    { id: 'CMP001', subject: 'Late Vehicle', status: 'Open', date: '2023-05-15', assignedTo: 'Manager 1' },
    { id: 'CMP002', subject: 'Vehicle Cleanliness', status: 'In Progress', date: '2023-05-10', assignedTo: 'Manager 2' },
    { id: 'CMP003', subject: 'Driver Behavior', status: 'Resolved', date: '2023-05-05', assignedTo: 'Manager 1' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Complaint Management</h1>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
          New Complaint
        </button>
      </div>
      
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Complaint ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{complaint.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.subject}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      complaint.status === 'Open' ? 'bg-red-500/10 text-red-400' :
                      complaint.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.assignedTo}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button className="text-cyan-400 hover:text-cyan-300 mr-3">View</button>
                    <button className="text-purple-400 hover:text-purple-300">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white">
            Export All Complaints
          </button>
        </div>
      </div>
    </div>
  );
}