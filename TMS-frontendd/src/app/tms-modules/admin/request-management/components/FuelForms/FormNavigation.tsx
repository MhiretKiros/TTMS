"use client";
import { useState } from 'react';

interface FormNavigationProps {
  activeTab: 'request' | 'return';
  onTabChange: (tab: 'request' | 'return') => void;
}

export const FormNavigation = ({ activeTab, onTabChange }: FormNavigationProps) => (
  <div className="flex border-b border-gray-200 mb-6">
    <button
      onClick={() => onTabChange('request')}
      className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === 'request' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      Fuel Request
    </button>
    <button
      onClick={() => onTabChange('return')}
      className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === 'return' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      Fuel Return
    </button>
  </div>
);