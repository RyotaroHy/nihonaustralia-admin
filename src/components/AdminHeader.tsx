'use client';

import { useState } from 'react';
import { HiBell, HiCog, HiLogout, HiUser } from 'react-icons/hi';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useAdminUser } from '@/hooks/useAdminAuth';

export function AdminHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { adminUser, isLoading } = useAdminUser();
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
          <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <HiBell className="h-6 w-6" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <HiCog className="h-6 w-6" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
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

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                    <div className="font-medium">{adminUser?.full_name}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {adminUser?.email || 'admin@nihonaustralia.com'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <HiUser className="mr-2 h-4 w-4" />
                    プロフィール
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <HiLogout className="mr-2 h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Close dropdown when clicking outside */}
          {showUserMenu && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowUserMenu(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}