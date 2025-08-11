"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { User, UserResponse } from '../types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;


export default function AddUser() {
  const router = useRouter();
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
    if (!user.myUsername.trim()) newErrors.myUsername = 'myUsername is required';
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
      const response = await axios.post<UserResponse>(
        `${API_BASE_URL}/auth/register`, 
        user,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'User created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        router.push('/tms/admin/user-management');
      }
    } catch (error) {
      const axiosError = error as AxiosError<UserResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to create user';
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/tms/admin/user-management')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New User</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full px-3 py-2 border rounded-md ${errors.myUsername ? 'border-red-500' : 'border-gray-300'}`}
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
            className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/tms/admin/user-management')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <FiSave className="mr-2" /> {loading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  );
}