'use client';
import { useEffect, useState, useRef } from 'react';
import { 
  FiTruck, FiUsers, FiClipboard, FiCheckCircle, FiPlusCircle, 
  FiSettings, FiBarChart2, FiFileText, FiAlertTriangle, 
  FiTool, FiCalendar, FiMapPin, FiHome 
} from 'react-icons/fi';
import { motion, useAnimation, Variants, TargetAndTransition } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, LineChart, Line, TooltipProps
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
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

const COLORS = ['#3c8dbc', '#82ca9d', '#ff7f50', '#ffc658', '#8884d8', '#a0aec0'];
const CARD_ICON_COLOR = '#3c8dbc';

// Role-specific configuration
const roleConfig = {
  // ADMIN, DISTRIBUTOR, HEAD_OF_DISTRIBUTOR cards
  adminCards: [
    { 
      href: '/tms/admin/car-management/manage-cars', 
      icon: <FiTruck />, 
      label: 'Total Vehicles' 
    },
    { 
      href: '/tms/admin/car-management/assign-car', 
      icon: <FiClipboard />, 
      label: 'Total Assignments' 
    },
    { 
      href: '/tms/admin/users', 
      icon: <FiUsers />, 
      label: 'Total Users' 
    },
    { 
      href: '/tms/admin/reports/car-reports', 
      icon: <FiFileText />, 
      label: 'All Reports' 
    },
  ],
  adminQuickActions: [
    { 
      href: '/tms/admin/car-management/add-car', 
      icon: <FiPlusCircle />, 
      label: 'Add New Vehicle' 
    },
    { 
      href: '/tms/admin/assign-vehicle', 
      icon: <FiClipboard />, 
      label: 'Assign Vehicle' 
    },
    { 
      href: '/reports/monthly', 
      icon: <FiBarChart2 />, 
      label: 'Monthly Report' 
    },
    { 
      href: '/tms/admin/maintenance-schedule', 
      icon: <FiSettings />, 
      label: 'Maintenance Schedule' 
    }
  ],
  // Other roles cards
  roleCards: {
    NEZEK: [
      { 
        title: 'Fuel Requests', 
        count: 0,
        icon: <FiTool />,
        link: '/tms/admin/car-management/fuel-oil-grease-request',
        color: 'bg-blue-100 text-blue-600'
      },
      { 
        title: 'Maintenance Requests', 
        count: 0,
        icon: <FiSettings />,
        link: '/tms/admin/car-management/maintenance',
        color: 'bg-orange-100 text-orange-600'
      },
      { 
        title: 'Vehicle Inspections', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/car-management/vehicle-inspection',
        color: 'bg-green-100 text-green-600'
      }
    ],
    INSPECTOR: [
      { 
        title: 'Pending Inspections', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/car-management/vehicle-inspection',
        color: 'bg-blue-100 text-blue-600'
      },
      { 
        title: 'Completed Inspections', 
        count: 0,
        icon: <FiClipboard />,
        link: '/tms/admin/reports/inspection-reports',
        color: 'bg-green-100 text-green-600'
      },
      { 
        title: 'Maintenance Logs', 
        count: 0,
        icon: <FiSettings />,
        link: '/tms/admin/car-management/approved-maintenance-requests',
        color: 'bg-purple-100 text-purple-600'
      }
    ],
    CORPORATOR: [
      { 
        title: 'Service Requests', 
        count: 0,
        icon: <FiFileText />,
        link: '/tms/admin/request-management/request-field',
        color: 'bg-blue-100 text-blue-600'
      },
      { 
        title: 'Approved Requests', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/request-management',
        color: 'bg-green-100 text-green-600'
      }
    ],
    HEAD_OF_MECHANIC: [
      { 
        title: 'Maintenance Requests', 
        count: 0,
        icon: <FiSettings />,
        link: '/tms/admin/car-management/maintenance',
        color: 'bg-blue-100 text-blue-600'
      },
      { 
        title: 'Parts Inventory', 
        count: 0,
        icon: <FiTool />,
        link: '/tms/admin/car-management/fuel-oil-grease-request',
        color: 'bg-orange-100 text-orange-600'
      },
      { 
        title: 'Completed Maintenance', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/car-management/approved-maintenance-requests',
        color: 'bg-green-100 text-green-600'
      }
    ],
    USER: [
      { 
        title: 'My Requests', 
        count: 0,
        icon: <FiFileText />,
        link: '/tms/admin/request-management/request-field',
        color: 'bg-blue-100 text-blue-600'
      },
      { 
        title: 'Approved Requests', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/request-management',
        color: 'bg-green-100 text-green-600'
      }
    ],
    DRIVER: [
      { 
        title: 'Current Assignment', 
        count: 0,
        icon: <FiTruck />,
        link: '/tms/admin/car-management/view-assigned-employee',
        color: 'bg-blue-100 text-blue-600'
      },
      { 
        title: 'Vehicle Status', 
        count: 0,
        icon: <FiCheckCircle />,
        link: '/tms/admin/car-management/maintenance',
        color: 'bg-green-100 text-green-600'
      },
      { 
        title: 'Trip History', 
        count: 0,
        icon: <FiMapPin />,
        link: '/tms/admin/vehicle-map-view',
        color: 'bg-purple-100 text-purple-600'
      }
    ]
  },
  roleRecentActivities: {
    NEZEK: [
      { type: 'Fuel Request', status: 'Pending', date: '2023-05-15', id: 'FR-001' },
      { type: 'Maintenance Approval', status: 'Approved', date: '2023-05-14', id: 'MA-023' }
    ],
    INSPECTOR: [
      { type: 'Vehicle Inspection', status: 'Completed', date: '2023-05-15', id: 'VI-456' },
      { type: 'Inspection Report', status: 'Submitted', date: '2023-05-14', id: 'IR-789' }
    ],
    CORPORATOR: [
      { type: 'Service Request', status: 'Pending', date: '2023-05-15', id: 'SR-001' }
    ],
    HEAD_OF_MECHANIC: [
      { type: 'Maintenance Request', status: 'Approved', date: '2023-05-15', id: 'MR-001' }
    ],
    USER: [
      { type: 'Service Request', status: 'Approved', date: '2023-05-14', id: 'SR-002' }
    ],
    DRIVER: [
      { type: 'Trip Completed', status: 'Completed', date: '2023-05-15', id: 'TC-001' }
    ]
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

export default function UnifiedDashboard() {
  const router = useRouter();
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Data states for admin/dashboard roles
  const [cars, setCars] = useState<Car[]>([]);
  const [orgCars, setOrgCars] = useState<OrganizationCar[]>([]);
  const [rentCars, setRentCars] = useState<RentCar[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // Data states for other roles
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [fuelRequests, setFuelRequests] = useState<FuelRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Month and week states for navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const weeks = getWeeksInMonth(currentDate);

  // Check if current date is the current month
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && 
                        currentDate.getFullYear() === new Date().getFullYear();

  // Sample data for trips/calendar
  const upcomingTrips: Trip[] = [
    { title: 'Trip to Lahore', date: new Date('2025-04-15') },
    { title: 'Delivery to Islamabad', date: new Date('2025-04-18') },
    { title: 'Meeting in Peshawar', date: new Date('2025-04-22') },
  ];

  // --- Variants ---
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
  
  const itemVariants: Variants = {
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
  
  const cardHoverVariants: TargetAndTransition = {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.3 }
  };

  // --- Tooltip Renderers ---
  const renderCarStatusTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      const statusSet = Array.from(new Set([...cars, ...orgCars, ...rentCars]
        .map(c => c.status)
        .filter((status): status is string => !!status)
      ));
      
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div className="font-bold">{label}</div>
          {statusSet.map((status, i) => (
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
  
  const renderCarTypeTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div className="font-bold">{data.name}</div>
          <div>Total: {data.value}</div>
        </div>
      );
    }
    return null;
  };
  
  const renderAssignmentTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      const statusSet = Array.from(new Set(assignments
        .map(a => a.status)
        .filter((status): status is string => !!status)
      ));
      
      return (
        <div className="bg-white p-2 rounded shadow text-xs">
          <div className="font-bold">{label}</div>
          {statusSet.map((status, i) => (
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

  // Fetch data based on role
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

        // Fetch data based on role
        if (['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'].includes(role)) {
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
        } else {
          // Simulate API calls for other roles with mock data
          const mockData = {
            maintenanceRequests: [
              { id: 'MR-001', vehicleId: 'V-1001', type: 'Brakes', status: 'Pending', requestedDate: '2023-05-15' }
            ],
            fuelRequests: [
              { id: 'FR-001', vehicleId: 'V-1001', amount: 50, status: 'Pending', requestedDate: '2023-05-14' }
            ],
            assignments: [
              { id: 'A-001', vehicleId: 'V-1001', driverId: 'D-001', startDate: '2023-05-10', endDate: '2023-05-17', status: 'Active' }
            ],
            vehicles: [
              { id: 'V-1001', plateNumber: 'ABC123', model: 'Toyota Hilux', status: 'In Use' }
            ]
          };
          
          // setMaintenanceRequests(mockData.maintenanceRequests);
          // setFuelRequests(mockData.fuelRequests);
          // setAssignments(mockData.assignments);
          // setVehicles(mockData.vehicles);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load dashboard data',
          icon: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Role Configuration</h1>
        <p className="mt-2">Unable to determine your role.</p>
      </div>
    );
  }

  // Check if admin/dashboard role
  const isAdminDashboard = ['ADMIN', 'DISTRIBUTOR', 'HEAD_OF_DISTRIBUTOR'].includes(userRole);

  // --- Summary Card Data ---
  const totalVehicles = cars.length + orgCars.length + rentCars.length;
  const totalAssignments = assignments.length;
  const totalUsers = new Set(assignments.map(a => a.requesterName)).size;

  const summaryCardData = [
    { ...roleConfig.adminCards[0], value: totalVehicles },
    { ...roleConfig.adminCards[1], value: totalAssignments },
    { ...roleConfig.adminCards[2], value: totalUsers },
    { ...roleConfig.adminCards[3], value: '📁' },
  ];

  // --- Weekly Car Registration by Status (Bar) ---
  const carStatusSet = Array.from(new Set([...cars, ...orgCars, ...rentCars]
    .map(c => c.status)
    .filter((status): status is string => !!status)
  ));
  
  const getWeeklyCarData = () => {
    return weeks.map(week => {
      const carsInWeek = [...cars, ...orgCars, ...rentCars].filter(car => {
        const carDateStr = car.registeredDate || car.createdAt || car.dateOfIn;
        if (!carDateStr) return false;
        
        const carDate = new Date(carDateStr);
        return carDate >= week.start && carDate <= week.end;
      });
      
      const statusCounts: Record<string, number> = {};
      carStatusSet.forEach(status => {
        statusCounts[status] = carsInWeek.filter(c => c.status === status).length;
      });
      
      return { week: week.label, ...statusCounts };
    });
  };

  // --- Car Types Breakdown ---
  const carTypeData: CarTypeData[] = [
    { 
      name: 'Personal/Regular', 
      value: cars.length,
      color: '#3c8dbc',
      models: cars.reduce<Record<string, number>>((acc, car) => {
        const model = car.model || 'Unknown';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {})
    },
    { 
      name: 'Organization', 
      value: orgCars.length,
      color: '#82ca9d',
      models: orgCars.reduce<Record<string, number>>((acc, car) => {
        const model = car.model || 'Unknown';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {})
    },
    { 
      name: 'Rent', 
      value: rentCars.length,
      color: '#ff7f50',
      models: rentCars.reduce<Record<string, number>>((acc, car) => {
        const model = car.model || 'Unknown';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {})
    }
  ];

  // --- Weekly Assignments by Status (Line) ---
  const assignmentStatusSet = Array.from(new Set(assignments
    .map(a => a.status)
    .filter((status): status is string => !!status)
  ));
  
  const getWeeklyAssignmentData = () => {
    return weeks.map(week => {
      const weekAssignments = assignments.filter(a => {
        const assignDateStr = a.assignedDate || a.requestDate;
        if (!assignDateStr) return false;
        
        const assignDate = new Date(assignDateStr);
        return assignDate >= week.start && assignDate <= week.end;
      });
      
      const statusCounts: Record<string, number> = {};
      assignmentStatusSet.forEach(status => {
        statusCounts[status] = weekAssignments.filter(a => a.status === status).length;
      });
      
      return { week: week.label, ...statusCounts };
    });
  };

  // Get current role cards and activities
  const currentCards = isAdminDashboard ? summaryCardData : roleConfig.roleCards[userRole as keyof typeof roleConfig.roleCards] || [];
  const currentActivities = roleConfig.roleRecentActivities[userRole as keyof typeof roleConfig.roleRecentActivities] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-10"
      ref={ref}
    >
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {userRole} Dashboard
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <p className="text-blue-800 font-medium">{userRole}</p>
        </div>
      </div>

      {/* Role-specific Cards */}
      <motion.div
        className={`grid grid-cols-1 ${isAdminDashboard ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {currentCards.map((card, index) => (
        <Link key={index} href={'href' in card ? card.href : (card as any).link}>
          <motion.div
            variants={itemVariants}
            whileHover={cardHoverVariants}
            className={`p-6 rounded-xl shadow-sm border ${
              'label' in card ? 'border-gray-200' : (card as any).color?.split(' ')[0] + ' border-opacity-30'
            } cursor-pointer transition-all`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {'label' in card ? card.label : (card as any).title}
                </p>
                <p className="text-3xl font-bold mt-2">
                  {'label' in card ? card.value : (card as any).count}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                'label' in card ? 'bg-blue-100 text-blue-600' : (card as any).color?.split(' ')[0] + ' bg-opacity-20'
              }`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        </Link>
        ))}
      </motion.div>

      {/* Admin/Dashboard specific content */}
      {isAdminDashboard && (
        <>
          {/* First Row: Car Charts */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {/* Weekly Car Registration by Status - Wider */}
            <motion.div
              variants={itemVariants}
              whileHover={cardHoverVariants}
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
                  barCategoryGap="10%"
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
                      barSize={90}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Car Types Breakdown - Smaller but with cards */}
            <motion.div
              variants={itemVariants}
              whileHover={cardHoverVariants}
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
                    style={{ 
                      backgroundColor: `${type.color}20`, 
                      borderLeft: `4px solid ${type.color}` 
                    }}
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
            whileHover={cardHoverVariants}
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
            whileHover={cardHoverVariants}
            className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
            onClick={() => router.push("/tms/admin/Location")}
          >
            <h2 className="font-bold text-xl mb-4 text-gray-800">Vehicle Map View</h2>
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
              <MapWithNoSSR />
            </div>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              This interactive map displays the real-time location of all assigned
              vehicles across regions.
            </p>
          </motion.div>

            {/* Vehicle Status Section */}
            <motion.div
              variants={itemVariants}
              whileHover={cardHoverVariants}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h2 className="font-bold text-xl mb-4 text-gray-800">Fleet Overview</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { count: cars.filter(c => c.status === 'Available').length, color: 'green', status: 'Available' },
                  { count: cars.filter(c => c.status === 'In Use').length, color: 'blue', status: 'In Use' },
                  { count: cars.filter(c => c.status === 'Maintenance').length, color: 'red', status: 'Maintenance' }
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
            </motion.div>
          </motion.div>

          {/* Calendar + Trips Section */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
          >
            {/* First Row: Calendar + Trips */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {/* Calendar Section */}
              <motion.div
                variants={itemVariants}
                whileHover={cardHoverVariants}
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
                whileHover={cardHoverVariants}
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
              {roleConfig.adminQuickActions.map((action, idx) => (
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
        </>
      )}

      {/* Non-admin dashboard content */}
      {!isAdminDashboard && (
        <>
          {/* Recent Activities */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activities</h2>
            <div className="space-y-4">
              {currentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`p-2 rounded-full mr-4 ${
                    activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                    activity.status === 'Approved' ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type.includes('Request') ? <FiFileText /> : 
                     activity.type.includes('Inspection') ? <FiCheckCircle /> : 
                     <FiClipboard />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-gray-500">{activity.id} • {activity.status}</p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Role-specific Additional Sections */}
          {userRole === 'DRIVER' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              variants={containerVariants}
            >
              {/* Current Assignment */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4 text-gray-800">Current Assignment</h2>
                {assignments.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Vehicle</p>
                      <p>{vehicles.find(v => v.id === assignments[0].vehicleId)?.plateNumber || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-medium">Duration</p>
                      <p>
                        {new Date(assignments[0].startDate || '').toLocaleDateString()} - 
                        {new Date(assignments[0].endDate || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-medium">Status</p>
                      <p className={`px-2 py-1 rounded-full text-xs ${
                        assignments[0].status === 'Active' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignments[0].status}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No current assignments</p>
                )}
              </motion.div>

              {/* Vehicle Status */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4 text-gray-800">Vehicle Status</h2>
                {vehicles.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="font-medium">Model</p>
                      <p>{vehicles[0].model}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-medium">Plate Number</p>
                      <p>{vehicles[0].plateNumber}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-medium">Status</p>
                      <p className={`px-2 py-1 rounded-full text-xs ${
                        vehicles[0].status === 'Available' ? 'bg-green-100 text-green-800' :
                        vehicles[0].status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vehicles[0].status}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No vehicle assigned</p>
                )}
              </motion.div>
            </motion.div>
          )}

          {userRole === 'NEZEK' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              variants={containerVariants}
            >
              {/* Pending Approvals */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4 text-gray-800">Pending Approvals</h2>
                <div className="space-y-4">
                  {fuelRequests.filter(fr => fr.status === 'Pending').map((request, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">Fuel Request #{request.id}</p>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <p>Vehicle: {request.vehicleId}</p>
                        <p>{request.amount} L</p>
                      </div>
                    </motion.div>
                  ))}
                  {maintenanceRequests.filter(mr => mr.status === 'Pending').map((request, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">Maintenance #{request.id}</p>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <p>{request.type}</p>
                        <p>Vehicle: {request.vehicleId}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Approvals */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Approvals</h2>
                <div className="space-y-4">
                  {fuelRequests.filter(fr => fr.status !== 'Pending').map((request, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="p-3 border border-gray-100 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">Fuel Request #{request.id}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <p>Vehicle: {request.vehicleId}</p>
                        <p>{request.amount} L</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Quick Actions for non-admin roles */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userRole === 'DRIVER' && (
                <>
                  <Link href="/tms/admin/car-management/maintenance">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-4 border border-gray-200 rounded-lg text-center cursor-pointer"
                    >
                      <div className="text-blue-600 text-2xl mb-2">
                        <FiSettings />
                      </div>
                      <p>Report Issue</p>
                    </motion.div>
                  </Link>
                  <Link href="/tms/admin/request-management/request-field">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-4 border border-gray-200 rounded-lg text-center cursor-pointer"
                    >
                      <div className="text-blue-600 text-2xl mb-2">
                        <FiFileText />
                      </div>
                      <p>Request Service</p>
                    </motion.div>
                  </Link>
                </>
              )}
              {userRole === 'NEZEK' && (
                <Link href="/tms/admin/car-management/fuel-oil-grease-request">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border border-gray-200 rounded-lg text-center cursor-pointer"
                  >
                    <div className="text-blue-600 text-2xl mb-2">
                      <FiTool />
                    </div>
                    <p>Fuel Approvals</p>
                  </motion.div>
                </Link>
              )}
              {/* Add more role-specific quick actions as needed */}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}