'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTool, FiCheckCircle, FiAlertCircle, FiList, FiPlus, FiFileText, FiUser, FiUsers } from 'react-icons/fi';
import MaintenanceRequestForm from './components/MaintenanceRequestForm';
import Swal from 'sweetalert2';

export default function MaintenanceRequestPage() {
  const [activeTab, setActiveTab] = useState<'driver' | 'distributor' | 'maintenance'>('driver');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedRequestId(null);
    setRefreshKey(prev => prev + 1);
    Swal.fire({
      title: 'Success!',
      text: 'Operation completed successfully',
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg'
      }
    });
  };

  const handleRowClick = (request: { id: number }) => {
    setSelectedRequestId(request.id);
  };

  const handleCancel = () => {
    setSelectedRequestId(null);
    setShowForm(false);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header and Tab Navigation remain the same */}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${refreshKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {showForm && activeTab === 'driver' ? (
                <MaintenanceRequestForm 
                  actorType="driver" 
                  onSuccess={handleSuccess} 
                  onCancel={handleCancel}
                />
              ) : selectedRequestId ? (
                <MaintenanceRequestForm 
                  requestId={selectedRequestId} 
                  actorType={activeTab} 
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              ) : (
                <MaintenanceRequestForm 
                  actorType={activeTab} 
                  onSuccess={handleSuccess}
                  onRowClick={handleRowClick}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status Legend remains the same */}
      </div>
    </div>
  );
}