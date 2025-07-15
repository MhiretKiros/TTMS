"use client";
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { FiSave, FiX } from 'react-icons/fi';
import { User, UserResponse } from '../types/user';
import { motion } from 'framer-motion';

interface AddUserProps {
  onClose: () => void;
  onUserAdded: () => void;
}

export default function AddUser({ onClose, onUserAdded }: AddUserProps) {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    myUsername: '',
    password: '',
    role: 'USER'
  });
  const [errors, setErrors] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ 
      ...prev, 
      [name]: name === 'role' ? value as 'USER' | 'ADMIN' : value 
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<User> = {};
    if (!user.name.trim()) newErrors.name = 'Name is required';
    if (!user.email.trim() || !/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!user.myUsername.trim()) newErrors.myUsername = 'Username is required';
    if (!user.password || user.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post<UserResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, 
        user,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'User created successfully',
          icon: 'success',
          confirmButtonColor: '#3c8dbc'
        });
        onUserAdded();
        onClose();
      }
    } catch (error) {
      const axiosError = error as AxiosError<UserResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to create user';
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#3c8dbc'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <FiX size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            name="myUsername"
            value={user.myUsername}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.myUsername ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]`}
          />
          {errors.myUsername && <p className="text-red-500 text-xs mt-1">{errors.myUsername}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          name="role"
          value={user.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3c8dbc] focus:border-[#3c8dbc]"
        >
          <option value="ADMIN">Admin</option>
          <option value="DISTRIBUTOR">Distributor</option>
          <option value="NEZEK">Nezek</option>
          <option value="INSPECTOR">Inspector</option>
          <option value="CORPORATOR">Corporator</option>
          <option value="HEAD_OF_MECHANIC">Head of Mechanic</option>
          <option value="USER">User</option>
          <option value="DRIVER">Driver</option>
          <option value="HEAD_OF_DISTRIBUTOR">Head of Distributor</option>
        </select>
      </div>


        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] disabled:opacity-50 flex items-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSave className="mr-2" /> {loading ? 'Saving...' : 'Save User'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}