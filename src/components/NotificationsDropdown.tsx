'use client';

import { Fragment } from 'react';
import { 
  HiBell, 
  HiX, 
  HiExclamationTriangle, 
  HiInformationCircle, 
  HiCheckCircle, 
  HiXCircle,
  HiChevronRight,
  HiCheck 
} from 'react-icons/hi';
import { useAdminNotifications, AdminNotification } from '@/hooks/useAdminNotifications';
import { useRouter } from 'next/navigation';

type NotificationsDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    urgentCount,
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useAdminNotifications();
  
  const router = useRouter();

  if (!isOpen) return null;

  const handleNotificationClick = (notification: AdminNotification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const getNotificationIcon = (type: AdminNotification['type']) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'info':
        return <HiInformationCircle className={`${iconClass} text-blue-500`} />;
      case 'warning':
        return <HiExclamationTriangle className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <HiXCircle className={`${iconClass} text-red-500`} />;
      case 'success':
        return <HiCheckCircle className={`${iconClass} text-green-500`} />;
      default:
        return <HiBell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getPriorityColor = (priority: AdminNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'border-l-gray-300 bg-white dark:bg-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${diffDays}日前`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20 max-h-96 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HiBell className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              通知
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {unreadCount}
              </span>
            )}
            {urgentCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                緊急 {urgentCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                すべて既読
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HiX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              読み込み中...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <HiBell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>新しい通知はありません</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-opacity-50' : ''
                  } hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {notification.title}
                        </p>
                        
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <HiCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <HiX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.actionUrl && (
                          <div className="flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            {notification.actionLabel || 'アクション'}
                            <HiChevronRight className="h-3 w-3 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={() => {
                router.push('/admin/notifications');
                onClose();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 w-full text-center"
            >
              すべての通知を表示
            </button>
          </div>
        )}
      </div>
    </>
  );
}