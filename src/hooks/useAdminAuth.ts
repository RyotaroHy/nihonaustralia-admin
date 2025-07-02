'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { AdminUser, verifyAdminSession, getCurrentAdminUser } from '@/lib/admin-auth';
import { Database } from '@/types/supabase';

interface UseAdminAuthResult {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  refreshAdminStatus: () => Promise<void>;
}

/**
 * Hook for managing admin authentication state
 */
export function useAdminAuth(redirectOnFailure = true): UseAdminAuthResult {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();

  const checkAdminStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setIsAdmin(false);
        setAdminUser(null);
        if (redirectOnFailure) {
          router.push('/auth/signin?redirectTo=' + encodeURIComponent(window.location.pathname));
        }
        return;
      }

      const { isAdmin: adminStatus, user: adminUserData } = await verifyAdminSession(supabase);

      setIsAdmin(adminStatus);
      setAdminUser(adminUserData);

      if (!adminStatus && redirectOnFailure) {
        setError('管理者権限が必要です');
        // Redirect to main site or access denied page
        router.push('/auth/signin?error=insufficient_permissions');
      }

    } catch (err) {
      console.error('Admin auth check failed:', err);
      setError('認証の確認中にエラーが発生しました');
      setIsAdmin(false);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAdminStatus = async () => {
    await checkAdminStatus();
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  return {
    adminUser,
    isAdmin,
    isLoading,
    error,
    refreshAdminStatus,
  };
}

/**
 * Hook for admin user data only (without auth checks)
 */
export function useAdminUser() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useUser();
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    async function fetchAdminUser() {
      if (!user) {
        setAdminUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const adminUserData = await getCurrentAdminUser(supabase);
        setAdminUser(adminUserData);
      } catch (error) {
        console.error('Failed to fetch admin user:', error);
        setAdminUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminUser();
  }, [user, supabase]);

  return { adminUser, isLoading };
}