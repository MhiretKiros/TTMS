import Link from 'next/link';

const driverStats = [
  { name: 'Assigned Car', value: 'Toyota Camry', id: 'CAM-2023' },
  { name: 'Current Status', value: 'Available', status: 'active' },
  { name: 'Today\'s Trips', value: '3', change: '+1' },
  { name: 'Pending Requests', value: '2', change: '0' },
];

export default function DriverDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Driver Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {driverStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              {stat.id && (
                <span className="ml-2 text-sm text-gray-500">{stat.id}</span>
              )}
              {stat.change && (
                <span className="ml-2 text-sm text-green-600">+{stat.change}</span>
              )}
            </div>
            {stat.status === 'active' && (
              <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/tms-module/driver/view-members">
            <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:bg-gray-50">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-medium">View Members</p>
            </div>
          </Link>
          <Link href="/tms-module/driver/view-parking">
            <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:bg-gray-50">
              <div className="text-2xl mb-2">🅿️</div>
              <p className="font-medium">View Parking</p>
            </div>
          </Link>
          <Link href="/tms-module/driver/send-complaint">
            <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:bg-gray-50">
              <div className="text-2xl mb-2">📢</div>
              <p className="font-medium">Send Complaint</p>
            </div>
          </Link>
          <Link href="/tms-module/driver/car-attendance">
            <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:bg-gray-50">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-medium">Car Attendance</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Schedule and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {[
              { time: '08:00 AM', activity: 'Pickup from HQ to Client A', status: 'completed' },
              { time: '10:30 AM', activity: 'Pickup from Client A to Airport', status: 'completed' },
              { time: '02:00 PM', activity: 'Pickup from Airport to HQ', status: 'upcoming' },
              { time: '04:30 PM', activity: 'Field visit with Team B', status: 'upcoming' },
            ].map((item, index) => (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  item.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {item.status === 'completed' ? '✓' : index + 1}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{item.time} - {item.activity}</p>
                  <p className={`text-xs ${
                    item.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {item.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Vehicle Location</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Map View</p>
          </div>
        </div>
      </div>
    </div>
  );
}