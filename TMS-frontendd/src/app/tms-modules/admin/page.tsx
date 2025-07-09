'use client';
import { useEffect, useState, useRef } from 'react';
import { FiTruck, FiUsers, FiClipboard, FiCheckCircle, FiPlusCircle, FiSettings, FiBarChart2, FiFileText } from 'react-icons/fi';
import { motion, useAnimation, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dynamic from 'next/dynamic';
import MapComponent from './components/MapComponent';

const MapWithNoSSR = dynamic(() => import('./components/MapComponent'), { ssr: false });

const COLORS = ['#3c8dbc', '#82ca9d', '#ff7f50', '#ffc658', '#8884d8', '#a0aec0'];
const CARD_ICON_COLOR = '#3c8dbc';

const cardLinks = [
  { href: '/tms-modules/admin/car-management/manage-cars', icon: <FiTruck />, label: 'Total Vehicles' },
  { href: '/tms-modules/admin/car-management/assign-car', icon: <FiClipboard />, label: 'Total Assignments' },
  { href: '/tms-modules/admin/users', icon: <FiUsers />, label: 'Total Users' },
  { href: '/tms-modules/admin/reports/car-reports', icon: <FiFileText />, label: 'All Reports' },
];

// Helper function to get weeks in a month
const getWeeksInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentWeek = [];
  let currentDate = new Date(firstDay);
  
  // Weeks structure: Week1 (1-7), Week2 (8-14), Week3 (15-21), Week4 (22-28), Week5 (29-31)
  const weekRanges = [
    { start: 1, end: 7, label: 'Week 1 (1-7)' },
    { start: 8, end: 14, label: 'Week 2 (8-14)' },
    { start: 15, end: 21, label: 'Week 3 (15-21)' },
    { start: 22, end: 28, label: 'Week 4 (22-28)' },
    { start: 29, end: 31, label: 'Week 5 (29-31)' }
  ];
  
  return weekRanges.map(week => {
    const endDay = Math.min(week.end, lastDay.getDate());
    return {
      label: `Week ${week.label.split(' ')[0]} (${week.start}-${endDay})`,
      start: new Date(year, month, week.start),
      end: new Date(year, month, endDay)
    };
  });
};

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Data states
  const [cars, setCars] = useState([]);
  const [orgCars, setOrgCars] = useState([]);
  const [rentCars, setRentCars] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Month and week states for navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const weeks = getWeeksInMonth(currentDate);

  // Check if current date is the current month
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && 
                        currentDate.getFullYear() === new Date().getFullYear();

  // Sample data for trips/calendar
  const upcomingTrips = [
    { title: 'Trip to Lahore', date: new Date('2025-04-15') },
    { title: 'Delivery to Islamabad', date: new Date('2025-04-18') },
    { title: 'Meeting in Peshawar', date: new Date('2025-04-22') },
  ];

  // Quick Actions
  const quickActions = [
    { href: '/tms-modules/admin/car-management/add-car', icon: <FiPlusCircle />, label: 'Add New Vehicle' },
    { href: '/tms-modules/admin/assign-vehicle', icon: <FiClipboard />, label: 'Assign Vehicle' },
    { href: '/reports/monthly', icon: <FiBarChart2 />, label: 'Monthly Report' },
    { href: '/tms-modules/admin/maintenance-schedule', icon: <FiSettings />, label: 'Maintenance Schedule' }
  ];

  useEffect(() => {
    setIsClient(true);
    if (isInView) controls.start("visible");

    const fetchJson = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
      return response.json();
    };

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [carRes, orgCarRes, rentCarRes, assignRes] = await Promise.all([
          fetchJson(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/all`),
          fetchJson(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/all`),
          fetchJson(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/all`),
          fetchJson(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/assignment/all`),
        ]);
        setCars(carRes.carList || []);
        setOrgCars(orgCarRes.organizationCarList || []);
        setRentCars(rentCarRes.rentCarList || []);
        setAssignments(assignRes.assignmentHistoryList || []);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      }
      setLoading(false);
    };
    fetchAll();
  }, [isInView, controls]);

  // --- Summary Card Data ---
  const totalVehicles = cars.length + orgCars.length + rentCars.length;
  const totalAssignments = assignments.length;
  const totalUsers = new Set(assignments.map(a => a.requesterName)).size;

  const summaryCardData = [
    { ...cardLinks[0], value: totalVehicles },
    { ...cardLinks[1], value: totalAssignments },
    { ...cardLinks[2], value: totalUsers },
    { ...cardLinks[3], value: '📁' }, // Reports card doesn't need a count
  ];

  // --- Weekly Car Registration by Status (Bar) ---
  const carStatusSet = Array.from(new Set([...cars, ...orgCars, ...rentCars].map(c => c.status))).filter(Boolean);
  
  const getWeeklyCarData = () => {
    return weeks.map(week => {
      const carsInWeek = [...cars, ...orgCars, ...rentCars].filter(car => {
        const carDate = new Date(car.registeredDate || car.createdAt || car.dateOfIn);
        return carDate >= week.start && carDate <= week.end;
      });
      const statusCounts = {};
      carStatusSet.forEach(status => {
        statusCounts[status] = carsInWeek.filter(c => c.status === status).length;
      });
      return { week: week.label, ...statusCounts };
    });
  };

  // --- Car Types Breakdown ---
  const [activeCarType, setActiveCarType] = useState(null);
  
  const carTypeData = [
    { 
      name: 'Personal/Regular', 
      value: cars.length,
      color: '#3c8dbc',
      models: cars.reduce((acc, car) => {
        const model = car.model || 'Unknown';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {})
    },
    { 
      name: 'Organization', 
      value: orgCars.length,
      color: '#82ca9d',
      models: orgCars.reduce((acc, car) => {
        const model = car.model || 'Unknown';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {})
    },
    { 
      name: 'Rent', 
      value: rentCars.length,
      color: '#ff7f50',
      models: rentCars.reduce((acc, car) => {
        const model = car.model || 'Unknown';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {})
    }
  ];

  // --- Weekly Assignments by Status (Line) ---
  const assignmentStatusSet = Array.from(new Set(assignments.map(a => a.status))).filter(Boolean);
  
  const getWeeklyAssignmentData = () => {
    return weeks.map(week => {
      const weekAssignments = assignments.filter(a => {
        const assignDate = new Date(a.assignedDate || a.requestDate);
        return assignDate >= week.start && assignDate <= week.end;
      });
      const statusCounts = {};
      assignmentStatusSet.forEach(status => {
        statusCounts[status] = weekAssignments.filter(a => a.status === status).length;
      });
      return { week: week.label, ...statusCounts };
    });
  };

  // --- Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };
  const cardHoverVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    }
  };

  // --- Tooltip Renderers ---
  const renderCarStatusTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div className="font-bold">{label}</div>
          {carStatusSet.map((status, i) => (
            <div key={status} className="flex justify-between">
              <span style={{ color: COLORS[i % COLORS.length] }}>{status}:</span>
              <span>{payload[0].payload[status] || 0}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const renderCarTypeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div className="font-bold">{data.name}</div>
          <div>Total: {data.value}</div>
          {activeCarType === data.name && (
            <div className="mt-2">
              {Object.entries(data.models).map(([model, count]) => (
                <div key={model} className="flex justify-between">
                  <span>{model}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  const renderAssignmentTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div className="font-bold">{label}</div>
          {assignmentStatusSet.map((status, i) => (
            <div key={status} className="flex justify-between">
              <span style={{ color: COLORS[i % COLORS.length] }}>{status}:</span>
              <span>{payload[0].payload[status] || 0}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Navigation functions
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {summaryCardData.map((card, idx) => (
          <Link key={idx} href={card.href} passHref>
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              variants={cardHoverVariants}
              className="bg-white rounded-2xl p-4 shadow flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{ minHeight: 150 }}
            >
              <div className="mb-4" style={{ fontSize: 50, color: CARD_ICON_COLOR }}>
                {card.icon}
              </div>
              {idx !== 4 ? (
                <>
                  <div className="text-4xl font-extrabold mb-2">{card.value}</div>
                  <div className="text-xl font-semibold text-gray-700">{card.label}</div>
                </>
              ) : (
              
                <div className="text-xl font-semibold text-gray-700">{card.label}</div>
              )}
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* First Row: Car Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Weekly Car Registration by Status - Wider */}
        <motion.div
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-8 shadow lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-2xl">Weekly Car Status - {monthName}</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevMonth}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                &lt;
              </button>
              <button 
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className={`px-3 py-1 rounded ${
                  !isCurrentMonth 
                    ? 'bg-gray-100 hover:bg-gray-200' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
    <BarChart
  data={getWeeklyCarData()}
  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  barCategoryGap="10%" // Decrease to make bars thicker
>
  <XAxis dataKey="week" interval={0} angle={-45} textAnchor="end" height={50} />
  <YAxis />
  <Tooltip content={renderCarStatusTooltip} />
  {carStatusSet.map((status, i) => (
    <Bar 
      key={status} 
      dataKey={status} 
      stackId="a" 
      fill={COLORS[i % COLORS.length]} 
      barSize={90} // Adjust this (e.g., 60) to make it thicker
    />
  ))}
</BarChart>


          </ResponsiveContainer>
        </motion.div>

        {/* Car Types Breakdown - Smaller but with cards */}
        <motion.div
          variants={itemVariants}
          whileHover="hover"
          variants={cardHoverVariants}
          className="bg-white rounded-xl p-8 shadow flex flex-col"
        >
          <h2 className="font-bold text-2xl mb-4">Car Types Breakdown</h2>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={carTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={0}
                  label
                  onMouseEnter={(data) => setActiveCarType(data.name)}
                  onMouseLeave={() => setActiveCarType(null)}
                >
                  {carTypeData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderCarTypeTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Car type summary cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {carTypeData.map((type, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-lg text-center shadow-sm"
                style={{ backgroundColor: `${type.color}20`, borderLeft: `4px solid ${type.color}` }}
              >
                <p className="text-sm font-medium text-gray-700">{type.name}</p>
                <p className="text-xl font-bold" style={{ color: type.color }}>{type.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Second Row: Assignments Graph */}
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        variants={cardHoverVariants}
        className="bg-white rounded-xl p-8 shadow"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl">Weekly Assignments - {monthName}</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={prevMonth}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              &lt;
            </button>
            <button 
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className={`px-3 py-1 rounded ${
                !isCurrentMonth 
                  ? 'bg-gray-100 hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={getWeeklyAssignmentData()}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="week" interval={0} angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip content={renderAssignmentTooltip} />
            {assignmentStatusSet.map((status, i) => (
              <Line 
                key={status} 
                type="monotone" 
                dataKey={status} 
                stroke={COLORS[i % COLORS.length]} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Third Row: Map + Additional Content */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {/* Map Section */}
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
                <p className={`text-2xl font-bold text-${item.color}-600`}>{item.count}</p>
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

      {/* Calendar + Trips Section */}
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