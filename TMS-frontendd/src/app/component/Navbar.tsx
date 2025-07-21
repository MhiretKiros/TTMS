"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTimes, FaEnvelope, FaLock, FaUserTag, FaUserShield, FaIdCard, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Swal from 'sweetalert2';

export interface User {
  id?: number;
  name: string;
  email: string;
  myUsername: string;
  role: 'USER' | 'ADMIN';
  token?: string;
  refreshedToken?: string;
}

export interface UserResponse {
  status: number;
  message: string;
  error?: string;
  ourUser?: User;
  token?: string;
  refreshedToken?: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    myUsername: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN'
  });
  const [otp, setOtp] = useState('');
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState({
    login: false,
    register: false,
    otp: false,
    logout: false
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Failed to parse user data', err);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? value as 'USER' | 'ADMIN' : value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading({...loading, login: true});
    
    try {
      const response = await axios.post<UserResponse>('http://localhost:8080/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.status === 200 && response.data.token) {
        // Store token immediately after successful login
        localStorage.setItem('token', response.data.token);
        try {
          const otpResponse = await axios.post<UserResponse>('http://localhost:8080/auth/request-otp', {
            email: formData.email
          });

        if (response.data.status === 200 && response.data.ourUser) {
        const userData: User = {
          name: response.data.ourUser.name,
          email: response.data.ourUser.email,
          myUsername: response.data.ourUser.myUsername,
          role: response.data.ourUser.role,
          token: localStorage.getItem('token') || '', // Get token from localStorage
          refreshedToken: response.data.refreshedToken
        };

         localStorage.setItem('user', JSON.stringify(userData));
         if(response.data.ourUser.role=="ADMIN"){
            setLoginEmail(formData.email);
            setOtpModalOpen(true);
            setLoginOpen(false);
             await Swal.fire({
              title: 'OTP Sent!',
              text: 'Verification code has been sent to your email',
              icon: 'success',
              confirmButtonColor: '#3d7aed'
            });
         }else{
          router.push('/tms-modules/admin');
          router.refresh();
           await Swal.fire({
              title: 'success!',
              text: 'You have logedin successfuly!',
              icon: 'success',
              confirmButtonColor: '#3d7aed'
            });
         }
            
           
          }
        } catch (otpErr) {
          const otpError = otpErr as AxiosError<UserResponse>;
          await Swal.fire({
            title: 'OTP Error',
            text: otpError.response?.data?.message || 'Failed to send OTP',
            icon: 'error',
            confirmButtonColor: '#3d7aed'
          });
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      const axiosError = err as AxiosError<UserResponse>;
      await Swal.fire({
        title: 'Login Failed',
        text: axiosError.response?.data?.message || 'Invalid credentials',
        icon: 'error',
        confirmButtonColor: '#3d7aed'
      });
    } finally {
      setLoading({...loading, login: false});
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading({...loading, otp: true});
    
    try {
      const response = await axios.post<UserResponse>('http://localhost:8080/auth/verify-otp', {
        email: loginEmail,
        otp: otp
      });

      if (response.data.status === 200 && response.data.ourUser) {
        const userData: User = {
          name: response.data.ourUser.name,
          email: response.data.ourUser.email,
          myUsername: response.data.ourUser.myUsername,
          role: response.data.ourUser.role,
          token: localStorage.getItem('token') || '', // Get token from localStorage
          refreshedToken: response.data.refreshedToken
        };

        localStorage.setItem('user', JSON.stringify(userData));
        
        if (response.data.refreshedToken) {
          localStorage.setItem('refreshedToken', response.data.refreshedToken);
        }

        setUser(userData);
        setOtpModalOpen(false);
        
        await Swal.fire({
          title: 'Verified!',
          text: 'OTP verification successful',
          icon: 'success',
          confirmButtonColor: '#3d7aed'
        });

        // Redirect to admin dashboard
        router.push('/tms-modules/admin');
        router.refresh();
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (err) {
      const axiosError = err as AxiosError<UserResponse>;
      await Swal.fire({
        title: 'Verification Failed',
        text: axiosError.response?.data?.message || 'Invalid OTP. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3d7aed'
      });
    } finally {
      setLoading({...loading, otp: false});
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading({...loading, register: true});
    
    try {
      const response = await axios.post<UserResponse>('http://localhost:8080/auth/register', formData);
      
      if (response.data.status === 200) {
        await Swal.fire({
          title: 'Registration Successful!',
          text: 'Please login with your credentials',
          icon: 'success',
          confirmButtonColor: '#3d7aed'
        });
        setIsRegistering(false);
        setLoginOpen(true);
        setFormData({
          name: '',
          email: '',
          myUsername: '',
          password: '',
          role: 'USER'
        });
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err) {
      const axiosError = err as AxiosError<UserResponse>;
      await Swal.fire({
        title: 'Registration Failed',
        text: axiosError.response?.data?.message || 'Registration failed. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3d7aed'
      });
    } finally {
      setLoading({...loading, register: false});
    }
  };

  const handleLogout = async () => {
    setLoading({...loading, logout: true});
    
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshedToken');
      setUser(null);
      await Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out',
        icon: 'success',
        confirmButtonColor: '#3d7aed'
      });
      router.push('/tms-modules');
      router.refresh();
    } catch (err) {
      await Swal.fire({
        title: 'Logout Error',
        text: 'There was an error logging out',
        icon: 'error',
        confirmButtonColor: '#3d7aed'
      });
    } finally {
      setLoading({...loading, logout: false});
    }
  };

  // Properly typed variants
  const modalVariants: Variants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 500,
        duration: 0.4 
      } 
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      transition: { 
        duration: 0.3 
      } 
    }
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 }
  };

  const navItemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.1, 
        duration: 0.3,
        ease: "easeOut" 
      }
    }),
    hover: { scale: 1.05 }
  };

  const inputFieldVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50 border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 relative">
            {/* LOGO at far left */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex items-center space-x-3"
              >
                <Image
                  src="/images/insaprofile.png"
                  alt="TMS Logo"
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-white shadow-lg"
                />
                <span className="text-2xl font-bold text-gray-800 hidden sm:inline-block">
                  Transport Management System
                </span>
              </motion.div>
            </div>

            {/* Spacer to offset logo space */}
            <div className="flex-1"></div>

            {/* Desktop Navigation - right aligned */}
            <div className="hidden md:flex items-center space-x-6">
              {[{ label: 'Home', href: '/tms-modules' },
                { label: 'Service', href: '/tms-modules/services' },
                ...(user ? [{ label: 'Dashboard', href: '/tms-modules/admin' }] : []),
                ...(user?.role === 'ADMIN' ? [{ label: 'Admin Panel', href: '/tms-modules/admin' }] : []),
                { label: 'About', href: '/tms-modules/about' },
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  custom={i}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Link
                    href={item.href}
                    className="text-lg text-gray-700 font-semibold px-4 py-2 hover:text-blue-600 transition-all"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {user ? (
                <motion.div className="relative group" custom={5} variants={navItemVariants} initial="hidden" animate="visible">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center text-lg text-gray-700 space-x-2 px-4 py-2 rounded-md"
                  >
                    <span>{user.name || user.email}</span>
                    <div className="w-8 h-8 bg-gray-100 border rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block z-50"
                  >
                    <div className="py-1">
                      <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                      <button
                        onClick={handleLogout}
                        disabled={loading.logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {loading.logout ? <FaSpinner className="animate-spin mr-2" /> : <FaSignOutAlt className="mr-2" />}
                        {loading.logout ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => setLoginOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-4 py-2 rounded-md shadow-md flex items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaSignInAlt className="mr-2" /> Login
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center absolute right-4 top-1/2 transform -translate-y-1/2">
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md focus:outline-none"
              >
                {isOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white shadow-lg"
            >
              <div className="px-4 pt-2 pb-4 space-y-2">
                {[{ label: 'Home', href: '/tms-modules' },
                  { label: 'Service', href: '/tms-modules/service' },
                  ...(user ? [{ label: 'Dashboard', href: '/tms-modules/admin' }] : []),
                  ...(user?.role === 'ADMIN' ? [{ label: 'Admin Panel', href: '/tms-modules/admin' }] : []),
                  { label: 'About', href: '/tms-modules/about' },
                ].map((item) => (
                  <motion.div key={item.href} variants={navItemVariants} initial="hidden" animate="visible" whileHover="hover">
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-lg text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {user ? (
                  <>
                    <Link href="/tms-modules/admin" className="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100">Profile</Link>
                    <button
                      onClick={handleLogout}
                      disabled={loading.logout}
                      className="w-full text-left px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      {loading.logout ? <FaSpinner className="animate-spin mr-2" /> : <FaSignOutAlt className="mr-2" />}
                      {loading.logout ? 'Logging out...' : 'Logout'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="w-full text-left px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {loginOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="fixed inset-0 bg-black" 
              variants={backdropVariants}
              onClick={() => setLoginOpen(false)}
            />
            
            <motion.div 
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden"
              variants={modalVariants}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setLoginOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FaTimes className="h-6 w-6" />
                </motion.button>
              </div>
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <motion.h2 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {isRegistering ? 'Create Your Account' : 'Welcome Back'}
                  </motion.h2>
                  <motion.p 
                    className="mt-2 text-gray-600"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isRegistering ? 'Join us today!' : 'Sign in to continue'}
                  </motion.p>
                </div>
                
                <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                  <div className="space-y-5">
                    {isRegistering && (
                      <>
                        <motion.div
                          custom={0}
                          variants={inputFieldVariants}
                          initial="hidden"
                          animate="visible"
                          className="relative"
                        >
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaIdCard className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          />
                        </motion.div>

                        <motion.div
                          custom={1}
                          variants={inputFieldVariants}
                          initial="hidden"
                          animate="visible"
                          className="relative"
                        >
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUserTag className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="myUsername"
                            placeholder="Username"
                            required
                            value={formData.myUsername}
                            onChange={handleInputChange}
                            className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          />
                        </motion.div>
                      </>
                    )}

                    <motion.div
                      custom={isRegistering ? 2 : 0}
                      variants={inputFieldVariants}
                      initial="hidden"
                      animate="visible"
                      className="relative"
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </motion.div>

                    <motion.div
                      custom={isRegistering ? 3 : 1}
                      variants={inputFieldVariants}
                      initial="hidden"
                      animate="visible"
                      className="relative"
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </motion.div>

                    {isRegistering && (
                      <motion.div
                        custom={4}
                        variants={inputFieldVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative"
                      >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUserShield className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          name="role"
                          required
                          value={formData.role}
                          onChange={handleInputChange}
                          className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg appearance-none bg-white"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </motion.div>
                    )}

                    <motion.div
                      custom={isRegistering ? 5 : 2}
                      variants={inputFieldVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isRegistering ? loading.register : loading.login}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg shadow-md transition duration-300 flex justify-center items-center"
                      >
                        {isRegistering ? (
                          loading.register ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Registering...
                            </>
                          ) : (
                            <>
                              <FaUserPlus className="mr-2" />
                              Register
                            </>
                          )
                        ) : loading.login ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            <FaSignInAlt className="mr-2" />
                            Sign In
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </form>

                <motion.div 
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: isRegistering ? 0.6 : 0.3 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-lg transition duration-300"
                  >
                    {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {otpModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="fixed inset-0 bg-black" 
              variants={backdropVariants}
              onClick={() => setOtpModalOpen(false)}
            />
            
            <motion.div 
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
              variants={modalVariants}
            >
              <div className="absolute top-4 right-4">
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOtpModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FaTimes className="h-6 w-6" />
                </motion.button>
              </div>
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <motion.h2 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    OTP Verification
                  </motion.h2>
                  <motion.p 
                    className="mt-2 text-gray-600 text-lg"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    We've sent a 6-digit code to {loginEmail}
                  </motion.p>
                </div>
                
                <form onSubmit={handleOtpVerification}>
                  <div className="space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative"
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        maxLength={6}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading.otp}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg shadow-md transition duration-300 flex justify-center items-center"
                      >
                        {loading.otp ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Continue'
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}