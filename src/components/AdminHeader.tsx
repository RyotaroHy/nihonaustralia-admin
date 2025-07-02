'use client';

import { HiBell, HiCog } from 'react-icons/hi';

export function AdminHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            NihonAustralia Admin
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <HiBell className="h-6 w-6" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <HiCog className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}