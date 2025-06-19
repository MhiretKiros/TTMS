'use client';
import TravelRequestForm from '../components/FieldRequestForm';
import CarServiceForm from '../components/CarServiceForm';
import CommentForm from '../components/CommentForm';
import DailyServiceRequestForm from '../components/DailyServiceRequestForm';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTool, FiMessageSquare, FiSend, FiX, FiTruck } from 'react-icons/fi';

export default function ServiceRequestPage() {
  const [activeTab, setActiveTab] = useState<'field' | 'daily' | 'service' | 'comment'>('field');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Full width container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto"
      >        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            className="text-2xl sm:text-3xl font-bold text-gray-800"
          >
            Service Requests
          </motion.h1>
        </div>

        {/* Tab Navigation */}
        <motion.div className="flex flex-wrap mb-8 border-b border-gray-200">
          {[
            { id: 'field', icon: <FiTool className="mr-2" />, label: 'Field Service Request' },
            { id: 'daily', icon: <FiTruck className="mr-2" />, label: 'Daily Service Request' },
            { id: 'service', icon: <FiTruck className="mr-2" />, label: 'Car Service' },
            { id: 'comment', icon: <FiMessageSquare className="mr-2" />, label: 'Send Complaint' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-6 py-3 flex items-center font-medium ${
                activeTab === tab.id 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} <span className="whitespace-nowrap">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeTab === 'field' && <TravelRequestForm actorType="user" onSuccess={handleSuccess} />}
            {activeTab === 'service' && <CarServiceForm onSuccess={handleSuccess} />}
            {activeTab === 'daily' && <DailyServiceRequestForm actorType="manager" onSuccess={handleSuccess} />}
            {activeTab === 'comment' && <CommentForm onSuccess={handleSuccess} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Request submitted successfully!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}