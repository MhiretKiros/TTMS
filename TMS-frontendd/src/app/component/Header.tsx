"use client";
import { useState, useRef, useEffect } from 'react';
import DarkModeToggle from "./DarkModeToggle";
import { useNotification } from '../contexts/NotificationContext'; // Adjusted path
import { FiSearch, FiBell, FiRefreshCw, FiSettings, FiHelpCircle, FiLogOut, FiUser } from 'react-icons/fi';

interface User {
  name: string;
  avatar: string;
  role: string;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  user?: User;
}

export default function Header({ onToggleSidebar, user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { unassignedInspectedBusesCount, newRegisteredCarsCount, isLoadingNotifications, refreshNotifications } = useNotification();

  const currentUser = user || {
    name: "Guest",
    avatar: "https://ui-avatars.com/api/?name=Guest&background=random",
    role: "Unknown"
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between">
      {/* Left section - Toggle and Search */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right section - Icons and User */}
      <div className="flex items-center space-x-4">
        <button 
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          onClick={() => {
            refreshNotifications();
            window.location.reload();
          }}
          aria-label="Refresh"
        >
          <FiRefreshCw className="h-5 w-5" />
        </button>
        
        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {!isLoadingNotifications && (unassignedInspectedBusesCount > 0 || newRegisteredCarsCount > 0) && (
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2" aria-live="polite" aria-atomic="true">
                {unassignedInspectedBusesCount + newRegisteredCarsCount}
              </span>
            )}
          </button>
        </div>


        
        <button 
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="Help"
        >
          <FiHelpCircle className="h-5 w-5" />
        </button>

        <div>
        <DarkModeToggle />

        </div>


        <div className="relative" ref={profileRef}>
          <button 
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="User menu"
          >
            <div className="text-right hidden md:block">
              <p className="font-medium text-sm">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <img 
              src={currentUser.avatar} 
              alt={`${currentUser.name}'s profile`} 
              className="w-8 h-8 rounded-full border-2 border-gray-300"
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <p className="font-medium">Signed in as</p>
                <p className="truncate">{currentUser.name}</p>
              </div>
              <a 
                href="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiSettings className="mr-3" />
                Settings
              </a>
              <a 
                href="/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser className="mr-3" />
                Profile
              </a>
              <button 
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                // Replace with your actual logout function
                // Example: await signOut();
                setIsProfileOpen(false);
                window.location.href = '/tms-modules'; // Redirect after logout
              }}
            >
              <FiLogOut className="mr-3" />
              Logout
            </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}