'use client';

import { useState } from 'react';
import { HiBell, HiCog, HiLogout, HiUser } from 'react-icons/hi';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useAdminUser } from '@/hooks/useAdminAuth';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { NotificationsDropdown } from './NotificationsDropdown';
import { SettingsDropdown } from './SettingsDropdown';
import { ProfileDropdown } from './ProfileDropdown';

export function AdminHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { adminUser, isLoading } = useAdminUser();
  const { unreadCount, urgentCount } = useAdminNotifications();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            NihonAustralia Admin
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <HiBell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {urgentCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-600 rounded-full animate-pulse"></span>
              )}
            </button>
            
            <NotificationsDropdown 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
          
          {/* Settings */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <HiCog className="h-6 w-6" />
            </button>
            
            <SettingsDropdown 
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
            />
          </div>
          
          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowSettings(false);
              }}
              className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {isLoading ? 'A' : getUserInitials(adminUser?.full_name)}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isLoading ? '読み込み中...' : (adminUser?.full_name || 'システム管理者')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  管理者
                </div>
              </div>
            </button>

            <ProfileDropdown 
              isOpen={showUserMenu}
              onClose={() => setShowUserMenu(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}