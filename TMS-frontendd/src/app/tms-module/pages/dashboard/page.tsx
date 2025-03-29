import { Card } from '../../components/DashboardCards';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Transport Management Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Service Requests" value="12 pending" progress={68} />
        <Card title="Active Vehicles" value="24/30" progress={80} />
        <Card title="Maintenance Due" value="5 vehicles" progress={25} />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Vehicle Utilization</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => (
                  <th key={month} className="px-4 py-2 text-center text-sm font-medium text-gray-500">{month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 text-center">14</td>
                <td className="px-4 py-2 text-center">18</td>
                <td className="px-4 py-2 text-center">22</td>
                <td className="px-4 py-2 text-center">19</td>
                <td className="px-4 py-2 text-center">25</td>
                <td className="px-4 py-2 text-center">28</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}