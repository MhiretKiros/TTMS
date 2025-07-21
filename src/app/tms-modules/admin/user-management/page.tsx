"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { FiEdit, FiTrash2, FiUserPlus, FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { User, UserResponse } from './types/user';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import AddUser from './components/AddUser';
import EditUser from './components/EditUser';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/tms-modules');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<UserResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-all-users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.ourUserLists) {
        setUsers(response.data.ourUserLists);
      }
      setLoading(false);
    } catch (error) {
      const axiosError = error as AxiosError<UserResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to fetch users';
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3c8dbc'
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3c8dbc',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await axios.delete<UserResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire({
          title: 'Deleted!',
          text: 'User has been deleted.',
          icon: 'success',
          confirmButtonColor: '#3c8dbc'
        });
        fetchUsers();
      }
    } catch (error) {
      const axiosError = error as AxiosError<UserResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to delete user';
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#3c8dbc'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.myUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modalVariants: Variants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.4,
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: {
        ease: 'easeIn',
        duration: 0.3
      }
    }
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.5,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiUserPlus className="mr-2" /> Add User
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c8dbc]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#3c8dbc] rounded-full flex items-center justify-center text-white">
                        <span className="font-medium">{user.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.myUsername}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id || null);
                          setIsEditModalOpen(true);
                        }}
                        className="text-[#3c8dbc] hover:text-[#367fa9] flex items-center"
                      >
                        <FiEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => user.id && handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-black"
              variants={backdropVariants}
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
              variants={modalVariants}
            >
              <AddUser
                onClose={() => setIsAddModalOpen(false)}
                onUserAdded={fetchUsers}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUserId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="fixed inset-0 bg-black"
              variants={backdropVariants}
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
              variants={modalVariants}
            >
              <EditUser
                userId={selectedUserId}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedUserId(null);
                }}
                onUserUpdated={fetchUsers}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
