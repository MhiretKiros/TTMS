"use client";
import { useState } from 'react';
import { FuelRequestForm } from '../components/FuelForms/FuelRequestForm';
import { FuelReturnForm } from '../components/FuelForms/FuelReturnForm';
import { FormNavigation } from '../components/FuelForms/FormNavigation';


import { motion, AnimatePresence } from "framer-motion";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const fieldVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function FuelRequestPage() {
  const [activeTab, setActiveTab] = useState<'request' | 'return'>('request');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="space-y-6"
    >
      <motion.h2 
        variants={fieldVariants}
        className="text-2xl font-bold text-gray-800"
      >
        Fuel Request Management
      </motion.h2>

      <motion.div 
        variants={fieldVariants}
        className="flex border-b border-gray-200"
      >
        <button
          onClick={() => setActiveTab('request')}
          className={`px-4 py-2 font-medium ${activeTab === 'request' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          New Request
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`px-4 py-2 font-medium ${activeTab === 'return' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Fuel Return
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'request' ? (
            <FuelRequestForm />
          ) : (
            <FuelReturnForm />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}