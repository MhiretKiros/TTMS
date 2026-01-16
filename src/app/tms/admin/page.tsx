'use client';
import { useEffect, useState, useRef } from 'react';
import { 
  FiTruck, FiUsers, FiClipboard, FiCheckCircle, FiPlusCircle, 
  FiSettings, FiBarChart2, FiFileText, FiAlertTriangle, 
  FiTool, FiCalendar, FiMapPin, FiHome, FiChevronRight,
  FiActivity, FiTrendingUp, FiMap, FiClock, FiStar,
  FiPackage, FiShield, FiGlobe, FiNavigation
} from 'react-icons/fi';
import { motion, useAnimation, Variants, TargetAndTransition } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  CartesianGrid, Legend, RadialBarChart, RadialBar
} from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';

// Define types for our data structures
type Car = {
  id: string;
  model?: string;
  status?: string;
  registeredDate?: string;
  createdAt?: string;
  dateOfIn?: string;
};

type OrganizationCar = {
  id: string;
  model?: string;
  status?: string;
  registeredDate?: string;
  createdAt?: string;
  dateOfIn?: string;
};

type RentCar = {
  id: string;
  model?: string;
  status?: string;
  registeredDate?: string;
  createdAt?: string;
  dateOfIn?: string;
};

type Assignment = {
  id: string;
  status?: string;
  assignedDate?: string;
  requestDate?: string;
  requesterName?: string;
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
};

type WeekRange = {
  label: string;
  start: Date;
  end: Date;
};

type CarTypeData = {
  name: string;
  value: number;
  color: string;
  models: Record<string, number>;
};

type Trip = {
  title: string;
  date: Date;
  type?: string;
  duration?: number;
};

type MaintenanceRequest = {
  id: string;
  vehicleId: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedDate: string;
};

type FuelRequest = {
  id: string;
  vehicleId: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Completed';
  requestedDate: string;
};

type Vehicle = {
  id: string;
  plateNumber: string;
  model: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  lastInspectionDate?: string;
};

const MapWithNoSSR = dynamic(() => import('./components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3c8dbc]/40 mx-auto"></div>
      <p className="mt-2 text-slate-500 text-sm">Loading map...</p>
    </div>
  </div>
});

// Refined color palette with faded/softer variations
const COLORS = {
  primary: '#3c8dbc',
  primaryFaded: '#e8f4fd',
  primaryLight: '#a6cde8',
  primarySoft: '#8bc1e4',
  secondary: '#10b981',
  secondaryFaded: '#f0fdf9',
  accent: '#8b5cf6',
  accentFaded: '#f5f3ff',
  warning: '#f59e0b',
  warningFaded: '#fefce8',
  danger: '#ef4444',
  dangerFaded: '#fef2f2',
  neutral: '#6b7280',
  neutralFaded: '#f9fafb'
};

// Soft, faded chart colors
const CHART_COLORS = [
  '#3c8dbc', '#10b981', '#8b5cf6', 
  '#f59e0b', '#ef4444', '#8b8bf6'
];

// Faded background gradients for cards
const GRADIENTS = {
  card: 'bg-gradient-to-br from-white to-slate-50',
  header: 'bg-gradient-to-r from-[#3c8dbc] via-[#5ca5d8] to-[#3c8dbc]',
  statCard: 'bg-gradient-to-br from-white to-slate-50',
  mapCard: 'bg-gradient-to-br from-slate-50 to-white'
};

// Role-specific configuration with faded backgrounds
const roleConfig = {
  adminCards: [
    { 
      href: '/tms/admin/car-management/manage-cars', 
      icon: <FiTruck />, 
      label: 'Total Vehicles',
      gradient: 'from-[#e8f4fd] to-white',
      borderColor: 'border-[#3c8dbc]/20',
      textColor: 'text-[#3c8dbc]'
    },
    { 
      href: '/tms/admin/car-management/assign-car', 
      icon: <FiClipboard />, 
      label: 'Total Assignments',
      gradient: 'from-[#f0fdf9] to-white',
      borderColor: 'border-[#10b981]/20',
      textColor: 'text-[#10b981]'
    },
    { 
      href: '/tms/admin/users', 
      icon: <FiUsers />, 
      label: 'Total Users',
      gradient: 'from-[#f5f3ff] to-white',
      borderColor: 'border-[#8b5cf6]/20',
      textColor: 'text-[#8b5cf6]'
    },
    { 
      href: '/tms/admin/reports/car-reports', 
      icon: <FiFileText />, 
      label: 'All Reports',
      gradient: 'from-[#fefce8] to-white',
      borderColor: 'border-[#f59e0b]/20',
      textColor: 'text-[#f59e0b]'
    },
  ],
  adminQuickActions: [
    { 
      href: '/tms/admin/car-management/add-car', 
      icon: <FiPlusCircle />, 
      label: 'Add Vehicle',
      description: 'Register new vehicle',
      bgColor: 'bg-[#e8f4fd]',
      iconColor: 'text-[#3c8dbc]',
      hoverColor: 'hover:bg-[#d4e9fb]'
    },
    { 
      href: '/tms/admin/assign-vehicle', 
      icon: <FiClipboard />, 
      label: 'Assign Vehicle',
      description: 'Create new assignment',
      bgColor: 'bg-[#f0fdf9]',
      iconColor: 'text-[#10b981]',
      hoverColor: 'hover:bg-[#e0faf4]'
    },
    { 
      href: '/reports/monthly', 
      icon: <FiBarChart2 />, 
      label: 'Generate Report',
      description: 'Monthly analytics',
      bgColor: 'bg-[#f5f3ff]',
      iconColor: 'text-[#8b5cf6]',
      hoverColor: 'hover:bg-[#ede9fe]'
    },
    { 
      href: '/tms/admin/maintenance-schedule', 
      icon: <FiSettings />, 
      label: 'Maintenance',
      description: 'Schedule service',
      bgColor: 'bg-[#fefce8]',
      iconColor: 'text-[#f59e0b]',
      hoverColor: 'hover:bg-[#fef9c3]'
    }
  ],
  roleCards: {
    NEZEK: [
      { 
        title: 'Fuel Requests', 
        count: 0,
        icon: <FiTool />,
        link: '/tms/admin/car-management/fuel-oil-grease-request',
        gradient: 'from-[#e8f4fd] to-white'
      },
      { 
        title: 'Maintenance Requests', 
        count: 0,
        icon: <FiSettings />,
        link: '/tms/admin/car-management/maintenance',
        gradient: 'from-[#fefce8] to-white'
      },
      { 
        title: 'Vehicle Inspections', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/car-management/vehicle-inspection',
        gradient: 'from-[#f0fdf9] to-white'
      }
    ],
    INSPECTOR: [
      { 
        title: 'Pending Inspections', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/car-management/vehicle-inspection',
        gradient: 'from-[#e8f4fd] to-white'
      },
      { 
        title: 'Completed Inspections', 
        count: 0,
        icon: <FiClipboard />,
        link: '/tms/admin/reports/inspection-reports',
        gradient: 'from-[#f0fdf9] to-white'
      },
      { 
        title: 'Maintenance Logs', 
        count: 0,
        icon: <FiSettings />,
        link: '/tms/admin/car-management/approved-maintenance-requests',
        gradient: 'from-[#f5f3ff] to-white'
      }
    ],
  }
};

// Helper function to get weeks in a month
const getWeeksInMonth = (date: Date): WeekRange[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  
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

// Custom Tooltip Components with faded styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600">{entry.dataKey}:</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProfessionalDashboard() {
  const router = useRouter();
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [cars, setCars] = useState<Car[]>([]);
  const [orgCars, setOrgCars] = useState<OrganizationCar[]>([]);
  const [rentCars, setRentCars] = useState<RentCar[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // Month and week states for navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const weeks = getWeeksInMonth(currentDate);

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', vehicles: 120, assignments: 85 },
    { month: 'Feb', vehicles: 135, assignments: 92 },
    { month: 'Mar', vehicles: 145, assignments: 105 },
    { month: 'Apr', vehicles: 165, assignments: 120 },
    { month: 'May', vehicles: 180, assignments: 135 },
    { month: 'Jun', vehicles: 200, assignments: 150 },
  ];

  const performanceData = [
    { day: 'Mon', efficiency: 92, utilization: 85 },
    { day: 'Tue', efficiency: 88, utilization: 82 },
    { day: 'Wed', efficiency: 94, utilization: 88 },
    { day: 'Thu', efficiency: 90, utilization: 86 },
    { day: 'Fri', efficiency: 86, utilization: 80 },
    { day: 'Sat', efficiency: 82, utilization: 75 },
    { day: 'Sun', efficiency: 78, utilization: 70 },
  ];

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };
  
  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = localStorage.getItem('user');
        if (!user) throw new Error('No user data');
        
        const parsedUser = JSON.parse(user);
        const role = parsedUser.role?.toUpperCase();
        
        if (!role) throw new Error('Invalid role');
        setUserRole(role);

        // Fetch actual data
        const [carRes, orgCarRes, rentCarRes, assignRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/car/all`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/organization-car/all`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/rent-car/all`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/assignment/all`).then(res => res.json()),
        ]);
        
        setCars(carRes.carList || []);
        setOrgCars(orgCarRes.organizationCarList || []);
        setRentCars(rentCarRes.rentCarList || []);
        setAssignments(assignRes.assignmentHistoryList || []);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load dashboard data',
          icon: 'error',
          background: '#1f2937',
          color: '#f8fafc'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#3c8dbc]/30 border-t-[#3c8dbc] rounded-full mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiTruck className="text-[#3c8dbc] text-2xl" />
            </div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading Professional Dashboard...</p>
        </div>
      </div>
    );
  }

  // Summary data
  const totalVehicles = cars.length + orgCars.length + rentCars.length;
  const totalAssignments = assignments.length;
  const availableVehicles = cars.filter(c => c.status === 'Available').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3c8dbc] via-[#5ca5d8] to-[#a6cde8] bg-clip-text text-transparent">
              Fleet Management Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Real-time insights and analytics for your vehicle fleet
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-4"
          >
            <div className="text-right">
              <p className="text-sm text-slate-500">Welcome back,</p>
              <p className="font-semibold text-[#3c8dbc]">{userRole}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e8f4fd] to-white border border-[#3c8dbc]/20 flex items-center justify-center text-[#3c8dbc] font-semibold shadow-sm">
              {userRole.charAt(0)}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* KPI Cards - Faded Design */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          {
            title: 'Total Fleet',
            value: totalVehicles,
            change: '+12%',
            icon: <FiTruck />,
            gradient: 'from-[#e8f4fd] to-white',
            borderColor: 'border-[#3c8dbc]/20',
            textColor: 'text-[#3c8dbc]',
            iconBg: 'bg-[#3c8dbc]/10',
            link: '/tms/admin/car-management/manage-cars'
          },
          {
            title: 'Active Assignments',
            value: totalAssignments,
            change: '+8%',
            icon: <FiClipboard />,
            gradient: 'from-[#f0fdf9] to-white',
            borderColor: 'border-[#10b981]/20',
            textColor: 'text-[#10b981]',
            iconBg: 'bg-[#10b981]/10',
            link: '/tms/admin/car-management/assign-car'
          },
          {
            title: 'Available Vehicles',
            value: availableVehicles,
            change: '+5%',
            icon: <FiCheckCircle />,
            gradient: 'from-[#f5f3ff] to-white',
            borderColor: 'border-[#8b5cf6]/20',
            textColor: 'text-[#8b5cf6]',
            iconBg: 'bg-[#8b5cf6]/10',
            link: '/tms/admin/car-management/manage-cars'
          },
          {
            title: 'Utilization Rate',
            value: '84%',
            change: '+3%',
            icon: <FiTrendingUp />,
            gradient: 'from-[#fefce8] to-white',
            borderColor: 'border-[#f59e0b]/20',
            textColor: 'text-[#f59e0b]',
            iconBg: 'bg-[#f59e0b]/10',
            link: '/tms/admin/reports/car-reports'
          }
        ].map((card, index) => (
          <Link key={index} href={card.link}>
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -3, borderColor: card.borderColor.replace('/20', '/40') }}
              className={`bg-gradient-to-br ${card.gradient} border ${card.borderColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <FiTrendingUp className={`mr-1 ${card.textColor}`} />
                    <span className="text-slate-500">{card.change} from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.iconBg} ${card.textColor}`}>
                  {card.icon}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Overview Chart */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3c8dbc]">Monthly Overview</h2>
              <p className="text-slate-600 text-sm">Fleet growth and assignments trend</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 text-xs font-medium text-[#3c8dbc] bg-[#e8f4fd] rounded-lg hover:bg-[#d4e9fb]">
                Monthly
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Quarterly
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3c8dbc" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3c8dbc" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="vehicles" 
                  stroke="#3c8dbc" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVehicles)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="assignments" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAssignments)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3c8dbc]">Performance Metrics</h2>
              <p className="text-slate-600 text-sm">Weekly efficiency and utilization</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#3c8dbc] mr-2"></div>
                <span className="text-xs text-slate-600">Efficiency</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#10b981] mr-2"></div>
                <span className="text-xs text-slate-600">Utilization</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#3c8dbc" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: "#3c8dbc" }} 
                  activeDot={{ r: 5, fill: "#3c8dbc" }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: "#10b981" }} 
                  activeDot={{ r: 5, fill: "#10b981" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Third Row: Map + Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Live Fleet Map */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3c8dbc]">Live Fleet Map</h2>
              <p className="text-slate-600 text-sm">Real-time vehicle locations</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/tms/admin/Location")}
              className="px-4 py-2 bg-[#e8f4fd] text-[#3c8dbc] rounded-lg hover:bg-[#d4e9fb] flex items-center space-x-2 text-sm font-medium border border-[#3c8dbc]/20"
            >
              <FiNavigation />
              <span>Explore Map</span>
            </motion.button>
          </div>
          <div className="h-64 rounded-lg overflow-hidden border border-slate-200">
            <MapWithNoSSR />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: 'Active Trips', value: '24', color: 'text-[#3c8dbc]' },
              { label: 'Idle Vehicles', value: '8', color: 'text-slate-600' },
              { label: 'Avg Speed', value: '65 km/h', color: 'text-[#10b981]' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fleet Status */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <h2 className="text-lg font-semibold text-[#3c8dbc] mb-6">Fleet Status</h2>
          <div className="space-y-4">
            {[
              { 
                status: 'Available', 
                count: availableVehicles, 
                color: 'bg-[#10b981]/20', 
                textColor: 'text-[#10b981]',
                borderColor: 'border-[#10b981]/30',
                icon: <FiCheckCircle /> 
              },
              { 
                status: 'In Use', 
                count: cars.filter(c => c.status === 'In Use').length, 
                color: 'bg-[#3c8dbc]/20', 
                textColor: 'text-[#3c8dbc]',
                borderColor: 'border-[#3c8dbc]/30',
                icon: <FiActivity /> 
              },
              { 
                status: 'Maintenance', 
                count: cars.filter(c => c.status === 'Maintenance').length, 
                color: 'bg-[#f59e0b]/20', 
                textColor: 'text-[#f59e0b]',
                borderColor: 'border-[#f59e0b]/30',
                icon: <FiSettings /> 
              },
              { 
                status: 'Idle', 
                count: 8, 
                color: 'bg-slate-200/50', 
                textColor: 'text-slate-600',
                borderColor: 'border-slate-300',
                icon: <FiClock /> 
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 3 }}
                className={`flex items-center justify-between p-4 ${item.color} rounded-lg border ${item.borderColor} cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.textColor}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{item.status}</p>
                    <p className="text-sm text-slate-600">{item.count} vehicles</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-1.5 bg-slate-300 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / totalVehicles) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full ${item.color.replace('/20', '')}`}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-8">
                    {Math.round((item.count / totalVehicles) * 100)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <h2 className="text-lg font-semibold text-[#3c8dbc] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {roleConfig.adminQuickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className={`${action.bgColor} rounded-lg p-4 text-center ${action.hoverColor} transition-colors border border-transparent hover:border-slate-300`}
                >
                  <div className={`text-xl mb-2 ${action.iconColor}`}>{action.icon}</div>
                  <p className="font-medium text-slate-800 text-sm">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#3c8dbc]">Recent Activity</h2>
            <button className="text-[#3c8dbc] text-xs font-medium hover:text-[#2a6599]">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {[
              { action: 'New vehicle assigned', time: '10 min ago', user: 'John Doe', type: 'assignment' },
              { action: 'Maintenance completed', time: '1 hour ago', user: 'Service Team', type: 'maintenance' },
              { action: 'Fuel request approved', time: '2 hours ago', user: 'Sarah Smith', type: 'fuel' },
              { action: 'Trip completed', time: '3 hours ago', user: 'Michael Brown', type: 'trip' },
              { action: 'Inspection scheduled', time: '5 hours ago', user: 'Quality Team', type: 'inspection' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start p-3 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <div className={`p-1.5 rounded mr-3 ${
                  activity.type === 'assignment' ? 'bg-[#e8f4fd] text-[#3c8dbc]' :
                  activity.type === 'maintenance' ? 'bg-[#fefce8] text-[#f59e0b]' :
                  activity.type === 'fuel' ? 'bg-[#f0fdf9] text-[#10b981]' :
                  'bg-[#f5f3ff] text-[#8b5cf6]'
                }`}>
                  {activity.type === 'assignment' ? <FiClipboard size={14} /> :
                   activity.type === 'maintenance' ? <FiSettings size={14} /> :
                   activity.type === 'fuel' ? <FiTool size={14} /> : <FiCheckCircle size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{activity.action}</p>
                  <p className="text-xs text-slate-500 truncate">{activity.user}</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-slate-200"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Mileage', value: '45,238 km', color: 'text-[#3c8dbc]' },
            { label: 'Fuel Consumption', value: '2,845 L', color: 'text-[#10b981]' },
            { label: 'Avg Response Time', value: '12 min', color: 'text-slate-700' },
            { label: 'Satisfaction Rate', value: '96%', color: 'text-[#8b5cf6]' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}