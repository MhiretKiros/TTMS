'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTool, FiCheckCircle, FiAlertCircle, FiList, FiPlus, FiFileText, FiUser, FiUsers, FiClipboard } from 'react-icons/fi';
import MaintenanceRequestForm from './components/MaintenanceRequestForm';
import Swal from 'sweetalert2';

export default function MaintenanceRequestPage() {
  const [activeTab, setActiveTab] = useState<'driver' | 'distributor' | 'maintenance' | 'inspector'>('driver');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role?.toUpperCase();
        
        // Map role to activeTab
        switch(role) {
          case 'DRIVER':
            setActiveTab('driver');
            break;
          case 'DISTRIBUTOR':
          case 'HEAD_OF_DISTRIBUTOR':
            setActiveTab('distributor');
            break;
          case 'HEAD_OF_MECHANIC':
            setActiveTab('maintenance');
            break;
          case 'INSPECTOR':
            setActiveTab('inspector');
            break;
          default:
            setActiveTab('driver');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setActiveTab('driver');
      }
    }
    setLoading(false);
  }, []);

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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Form container with animation */}
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
      </div>
    </div>
  );
}