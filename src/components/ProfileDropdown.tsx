'use client';

import { useState } from 'react';
import { 
  HiUser, 
  HiX, 
  HiLogout,
  HiShieldCheck,
  HiClock,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiCog,
  HiClipboardList
} from 'react-icons/hi';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useAdminUser } from '@/hooks/useAdminAuth';

type ProfileDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const { adminUser, isLoading } = useAdminUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

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

  const formatLastSignIn = (dateString: string | null) => {
    if (!dateString) return 'ログイン履歴なし';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return '1時間以内';
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 30) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
        {/* Header */}
        <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HiUser className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              プロフィール
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <HiX className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center text-gray-500">
              読み込み中...
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {getUserInitials(adminUser?.full_name)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {adminUser?.full_name || 'システム管理者'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {adminUser?.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <HiShieldCheck className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      管理者権限
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {adminUser?.verified_at ? '認証済み' : '未認証'}
                  </div>
                  <div className="text-xs text-gray-500">認証状態</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatLastSignIn(adminUser?.last_sign_in_at)}
                  </div>
                  <div className="text-xs text-gray-500">最終ログイン</div>
                </div>
              </div>

              {/* Toggle Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              >
                {showDetails ? '詳細を非表示' : '詳細を表示'}
              </button>

              {/* Detailed Info */}
              {showDetails && (
                <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  {adminUser?.phone && (
                    <div className="flex items-center space-x-2">
                      <HiPhone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {adminUser.phone}
                      </span>
                    </div>
                  )}
                  
                  {adminUser?.verified_by && (
                    <div className="flex items-center space-x-2">
                      <HiShieldCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        認証者: {adminUser.verified_by}
                      </span>
                    </div>
                  )}

                  {adminUser?.verified_at && (
                    <div className="flex items-center space-x-2">
                      <HiClock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        認証日: {new Date(adminUser.verified_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}

                  {adminUser?.verification_notes && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-200 dark:border-blue-700">
                      <div className="flex items-center space-x-1 mb-1">
                        <HiClipboardList className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          認証メモ
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {adminUser.verification_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-3 border-t dark:border-gray-600 space-y-1">
                <button
                  onClick={() => {
                    router.push('/admin/profile');
                    onClose();
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <HiUser className="mr-2 h-4 w-4" />
                  プロフィール設定
                </button>

                <button
                  onClick={() => {
                    router.push('/admin/settings');
                    onClose();
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <HiCog className="mr-2 h-4 w-4" />
                  アカウント設定
                </button>

                <button
                  onClick={() => {
                    router.push('/admin/activity');
                    onClose();
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <HiClipboardList className="mr-2 h-4 w-4" />
                  アクティビティログ
                </button>

                <div className="pt-2 border-t dark:border-gray-600">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <HiLogout className="mr-2 h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}