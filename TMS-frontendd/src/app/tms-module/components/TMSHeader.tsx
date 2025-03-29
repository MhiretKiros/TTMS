// Correct import syntax for Heroicons v2
import { 
    MagnifyingGlassIcon as SearchIcon,
    BellIcon,
    UserCircleIcon 
  } from '@heroicons/react/24/outline';
// src/app/tms-module/components/TMSHeader.tsx
export default function TMSHeader() {
    return (
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-blue-600">Transport Management System</h2>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          <button className="relative p-1 text-gray-500 hover:text-gray-700">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-700">Admin User</span>
          </div>
        </div>
      </header>
    );
  }