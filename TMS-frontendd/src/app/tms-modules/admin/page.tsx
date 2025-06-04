'use client';
import { FiTruck, FiUsers, FiClock, FiCheckCircle, FiTool, FiPieChart, FiBarChart2, FiCalendar, FiAlertCircle, FiMapPin, FiPlusCircle, FiClipboard, FiSettings } from 'react-icons/fi';
import { motion, useAnimation, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Dynamically import Map to avoid SSR issues
import dynamic from 'next/dynamic';
import MapComponent from './components/MapComponent';

const MapWithNoSSR = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
});

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Sample data
  const upcomingTrips = [
    { title: 'Trip to Lahore', date: new Date('2025-04-15') },
    { title: 'Delivery to Islamabad', date: new Date('2025-04-18') },
    { title: 'Meeting in Peshawar', date: new Date('2025-04-22') },
  ];

  const summaryCards = [
    { title: 'Total Vehicles', value: 120, icon: <FiTruck className="text-blue-600 text-2xl" /> },
    { title: 'Total Employees', value: 342, icon: <FiUsers className="text-green-600 text-2xl" /> },
    { title: 'Pending Requests', value: 17, icon: <FiClock className="text-yellow-600 text-2xl" /> },
    { title: 'Approved Assignments', value: 96, icon: <FiCheckCircle className="text-green-500 text-2xl" /> },
    { title: 'Vehicles Under Maintenance', value: 5, icon: <FiTool className="text-red-600 text-2xl" /> },
    { title: 'Available Vehicles Today', value: 78, icon: <FiPieChart className="text-purple-600 text-2xl" /> }
  ];
  const quickActions = [
    { href: '/tms-modules/admin/car-management/add-car', icon: <FiPlusCircle />, label: 'Add New Vehicle' },
    { href: '/tms-modules/admin/assign-vehicle', icon: <FiClipboard />, label: 'Assign Vehicle' },
    { href: '/reports/monthly', icon: <FiBarChart2 />, label: 'Monthly Report' },
    { href: '/tms-modules/admin/maintenance-schedule', icon: <FiSettings />, label: 'Maintenance Schedule' }
  ];
  const recentRequests = [
    { name: 'John Doe', type: 'Operational', status: 'Pending', priority: 'High' },
    { name: 'Jane Smith', type: 'Emergency', status: 'Approved', priority: 'Critical' },
    { name: 'Ali Hassan', type: 'General', status: 'Rejected', priority: 'Low' },
  ];
  const notifications = [
    'Vehicle IN-123 due for inspection',
    'New assignment request from Directorate',
    'Vehicle returned late by 2 hours'
  ];
  const assignmentHistory = [
    'Vehicle X assigned to Y — Status: Complete',
    'Vehicle Y assigned to Z — Status: Late',
    'Vehicle Z assigned to A — Status: Issues'
  ];
  const monthlyVehicleRequestsData = [
    { month: 'Jan', requests: 30 },
    { month: 'Feb', requests: 45 },
    { month: 'Mar', requests: 60 },
    { month: 'Apr', requests: 50 },
    { month: 'May', requests: 70 },
    { month: 'Jun', requests: 65 },
  ];
  const vehicleAvailabilityData = [
    { name: 'Available', value: 78 },
    { name: 'In Use', value: 42 },
    { name: 'Maintenance', value: 5 },
  ];
  const COLORS = ['#8884d8', '#82ca9d', '#ff7f50'];
  const fuelConsumptionTrendData = [
    { month: 'Jan', consumption: 300 },
    { month: 'Feb', consumption: 280 },
    { month: 'Mar', consumption: 350 },
    { month: 'Apr', consumption: 320 },
    { month: 'May', consumption: 400 },
    { month: 'Jun', consumption: 370 },
  ];
  const assignmentPrioritizationData = [
    { month: 'Jan', general: 20, emergency: 10, discontinued: 5, gender: 2 },
    { month: 'Feb', general: 25, emergency: 12, discontinued: 7, gender: 3 },
    { month: 'Mar', general: 22, emergency: 15, discontinued: 6, gender: 2 },
    { month: 'Apr', general: 30, emergency: 14, discontinued: 4, gender: 3 },
    { month: 'May', general: 28, emergency: 18, discontinued: 8, gender: 3 },
    { month: 'Jun', general: 32, emergency: 20, discontinued: 5, gender: 2 },
  ];

  useEffect(() => {
    setIsClient(true);
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-10"
      ref={ref}
    >
      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {summaryCards.map((card, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover="hover"
            variants={cardHoverVariants}
            className="bg-white rounded-xl p-6 shadow flex items-center space-x-4"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {card.icon}
            </motion.div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Monthly Vehicle Requests - Bar Chart */}
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-6 shadow"
        >
          <h2 className="font-bold text-lg mb-4">Monthly Vehicle Requests</h2>
          <ResponsiveContainer width="100%" height={256}>
            <BarChart data={monthlyVehicleRequestsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* Vehicle Availability - Pie Chart */}
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-6 shadow"
        >
          <h2 className="font-bold text-lg mb-4">Vehicle Availability</h2>
          <ResponsiveContainer width="100%" height={256}>
            <PieChart>
              <Pie
                data={vehicleAvailabilityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {vehicleAvailabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* Fuel Consumption Trend - Line Chart */}
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-6 shadow lg:col-span-2"
        >
          <h2 className="font-bold text-lg mb-4">Fuel Consumption Trend</h2>
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={fuelConsumptionTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="consumption" stroke="#3182ce" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        Assignment Prioritization - Stacked Area Chart
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-6 shadow lg:col-span-2"
        >
          <h2 className="font-bold text-lg mb-4">Assignment Prioritization</h2>
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart
              data={assignmentPrioritizationData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="general" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="emergency" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="discontinued" stackId="1" stroke="#ffc658" fill="#ffc658" />
              <Area type="monotone" dataKey="gender" stackId="1" stroke="#ff7f50" fill="#ff7f50" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div> 


     {/* Second Row: Map + Additional Content */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          Map Section
          <motion.div 
            variants={itemVariants}
            whileHover="hover"
            variants={cardHoverVariants}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="font-bold text-xl mb-4 text-gray-800">Vehicle Map View</h2>
            
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
              <MapComponent />
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              This interactive map displays the real-time location of all assigned vehicles across regions. It helps track vehicle movement, identify idle or active vehicles, and improve route planning and operational visibility.
            </p>
          </motion.div>


          {/* Vehicle Status Section */}
          <motion.div 
            variants={itemVariants}
            whileHover="hover"
            variants={cardHoverVariants}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="font-bold text-xl mb-4 text-gray-800">Fleet Overview</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { count: 12, color: 'green', status: 'Available' },
                { count: 5, color: 'blue', status: 'In Use' },
                { count: 2, color: 'red', status: 'Maintenance' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-${item.color}-50 p-3 rounded-lg text-center`}
                >
                  <p className="text-2xl font-bold text-${item.color}-600">{item.count}</p>
                  <p className={`text-xs text-${item.color}-800`}>{item.status}</p>
                </motion.div>
              ))}
            </div>
            
            <h3 className="font-semibold text-gray-700 mb-3">Recent Alerts</h3>
            <div className="space-y-3">
              {[
                { 
                  type: 'Maintenance Required', 
                  details: 'Vehicle #V-2456 - Brakes',
                  time: '2 hours ago',
                  color: 'red'
                },
                { 
                  type: 'Service Due Soon', 
                  details: 'Vehicle #V-1892 - Oil Change',
                  time: '1 day ago',
                  color: 'yellow'
                }
              ].map((alert, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="flex items-start p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className={`mt-1.5 h-2.5 w-2.5 bg-${alert.color}-500 rounded-full flex-shrink-0`}></div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{alert.type}</p>
                    <p className="text-sm text-gray-500">{alert.details}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                {[
                  { color: 'green', label: 'Available' },
                  { color: 'blue', label: 'In Use' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center"
                  >
                    <div className={`w-3 h-3 bg-${item.color}-500 rounded-full mr-1`}></div>
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Alerts
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        
      {/* Calendar + Trips + Map Section */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* First Row: Calendar + Trips */}
        <motion.div 
  className="grid grid-cols-1 md:grid-cols-2 gap-6"
  variants={containerVariants}
>
  {/* Calendar Section */}
  <motion.div 
    variants={itemVariants}
    whileHover="hover"
    variants={cardHoverVariants}
    className="bg-white rounded-xl p-6 shadow-lg w-full"
  >
    <h2 className="font-bold text-xl mb-4 text-gray-800">Upcoming Trips Calendar</h2>
    <div className="w-full">
      <Calendar
        className="w-full border-0"
        tileClassName={({ date, view }) => {
          const hasTrip = upcomingTrips.some(
            trip => date.toDateString() === trip.date.toDateString()
          );
          return view === 'month' && hasTrip ? 'relative bg-blue-50 rounded-md' : null;
        }}
        tileContent={({ date, view }) => {
          const trip = upcomingTrips.find(
            t => date.toDateString() === t.date.toDateString()
          );
          return view === 'month' && trip ? (
            <div className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></div>
          ) : null;
        }}
      />
    </div>
  </motion.div>

  {/* Trip List Section */}
  <motion.div 
    variants={itemVariants}
    whileHover="hover"
    variants={cardHoverVariants}
    className="bg-white rounded-xl p-6 shadow-lg"
  >
    <h2 className="font-bold text-xl mb-4 text-gray-800">Next Trips</h2>
    <div className="space-y-3">
      {upcomingTrips.slice(0, 5).map((trip, idx) => (
        <motion.div 
          key={idx} 
          whileHover={{ x: 5 }}
          className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="mt-1.5 h-2.5 w-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-start">
              <p className="font-medium text-gray-800">{trip.title}</p>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {trip.type || 'Business'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {trip.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            {trip.duration && (
              <p className="text-xs text-gray-400 mt-1">
                Duration: {trip.duration} days
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
    
    {upcomingTrips.length > 5 && (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border border-gray-200 rounded-lg"
      >
        View all {upcomingTrips.length} trips
      </motion.button>
    )}
  </motion.div>
</motion.div>

   
      </motion.div>

      {/* Requests Table
      <motion.div 
        variants={itemVariants}
        whileHover="hover"
        variants={cardHoverVariants}
        className="bg-white rounded-xl p-6 shadow"
      >
        <h2 className="font-bold text-lg mb-4">Recent Requests</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Employee Name</th>
              <th>Request Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((req, idx) => (
              <motion.tr 
                key={idx} 
                className="border-t"
                whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
              >
                <td>{req.name}</td>
                <td>{req.type}</td>
                <td>{req.status}</td>
                <td>{req.priority}</td>
                <td className="space-x-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-green-600"
                  >
                    Approve
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-blue-600"
                  >
                    View
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-red-600"
                  >
                    Reject
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Notifications & History */}
      {/* <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-6 shadow"
        >
          <h2 className="font-bold text-lg mb-4">Notifications</h2>
          <ul className="list-disc ml-5 space-y-2">
            {notifications.map((note, idx) => (
              <motion.li 
                key={idx}
                whileHover={{ x: 5 }}
              >
                {note}
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-6 shadow"
        >
          <h2 className="font-bold text-lg mb-4">Assignment History</h2>
          <ul className="list-disc ml-5 space-y-2">
            {assignmentHistory.map((item, idx) => (
              <motion.li 
                key={idx}
                whileHover={{ x: 5 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div> */}

      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
      >
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link key={idx} href={action.href} passHref>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-lg shadow p-4 text-center cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-2xl text-blue-600 mb-2 mx-auto">{action.icon}</div>
                <p>{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}