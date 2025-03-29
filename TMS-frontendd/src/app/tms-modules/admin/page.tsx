// components/AdminDashboard.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import icons directly to avoid any potential issues
import { FiTrendingUp } from 'react-icons/fi';
import { FiTrendingDown } from 'react-icons/fi';
import { FiMinus } from 'react-icons/fi';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Cars', value: '24', change: '+2', changeType: 'positive' },
    { name: 'Active Requests', value: '16', change: '+5', changeType: 'negative' },
    { name: 'Pending Complaints', value: '8', change: '+1', changeType: 'negative' },
    { name: 'Available Drivers', value: '12', change: '0', changeType: 'neutral' },
  ];

  const quickActions = [
    { href: "/tms-modules/admin/car-management/manage-cars", emoji: "🚘", text: "Manage Cars" },
    { href: "/requests", emoji: "📋", text: "Service Requests" },
    { href: "/complaints", emoji: "📢", text: "View Complaints" },
    { href: "/reports", emoji: "📊", text: "Generate Reports" }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-800"
      >
        Dashboard Overview
      </motion.h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                stat.changeType === 'positive' ? 'bg-green-100 text-green-800' :
                stat.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {stat.change}
                {stat.changeType === 'positive' && <FiTrendingUp className="ml-1" />}
                {stat.changeType === 'negative' && <FiTrendingDown className="ml-1" />}
                {stat.changeType === 'neutral' && <FiMinus className="ml-1" />}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} passHref>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-lg shadow p-4 text-center cursor-pointer"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity
                  }}
                  className="text-2xl mb-2"
                >
                  {action.emoji}
                </motion.div>
                <p>{action.text}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 bg-white rounded-xl shadow p-6"
          whileHover={{ scale: 1.01 }}
        >
          <h2 className="text-xl font-bold mb-4">Request Statistics</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p>Chart Placeholder</p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          whileHover={{ scale: 1.01 }}
        >
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                whileHover={{ x: 5 }}
                className="border-b pb-4"
              >
                <p className="text-sm">New request from Employee #{item}</p>
                <p className="text-xs text-gray-500">10 minutes ago</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}