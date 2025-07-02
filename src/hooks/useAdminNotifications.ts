import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export type AdminNotification = {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
};

// Mock notifications for demo - in real app, this would come from API
const mockNotifications: AdminNotification[] = [
  {
    id: '1',
    type: 'warning',
    title: '未承認投稿があります',
    message: '5件の求人投稿が承認待ちです。確認してください。',
    priority: 'high',
    read: false,
    actionUrl: '/admin/posts?status=draft',
    actionLabel: '確認する',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    type: 'info',
    title: '新規ユーザー登録',
    message: '本日15名の新規ユーザーが登録されました。',
    priority: 'medium',
    read: false,
    actionUrl: '/admin/users',
    actionLabel: 'ユーザー管理',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: '3',
    type: 'error',
    title: 'システムエラー',
    message: 'メール送信サービスでエラーが発生しています。',
    priority: 'urgent',
    read: false,
    actionUrl: '/admin/settings',
    actionLabel: '設定確認',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: '4',
    type: 'success',
    title: 'データベースバックアップ完了',
    message: '定期バックアップが正常に完了しました。',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
];

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(mockNotifications);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      // In real app, fetch from API
      // const response = await fetch('/api/admin/notifications');
      // return response.json();
      
      // For demo, return mock data with some delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockNotifications;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    
    // In real app, send API request to mark as read
    // fetch(`/api/admin/notifications/${notificationId}/read`, { method: 'PATCH' });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    
    // In real app, send API request to mark all as read
    // fetch('/api/admin/notifications/mark-all-read', { method: 'PATCH' });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    
    // In real app, send API request to delete
    // fetch(`/api/admin/notifications/${notificationId}`, { method: 'DELETE' });
  };

  return {
    notifications,
    unreadCount,
    urgentCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}