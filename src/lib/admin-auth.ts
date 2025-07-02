import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  admin_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

/**
 * Check if a user has admin privileges
 */
export async function isAdminUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  try {
    // Try to get admin status from database
    const { data, error } = await supabase
      .from('mypage_profiles')
      .select('admin_verified')
      .eq('id', userId)
      .single();

    if (error) {
      // If admin_verified column doesn't exist, fall back to email check
      if (error.message.includes('admin_verified') || error.message.includes('column')) {
        console.log('⚠️ admin_verified field not found, using fallback email check');
        
        // Get current user to check email
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user || user.id !== userId) {
          return false;
        }

        // Fallback admin emails
        const adminEmails = [
          'admin@nihonaustralia.com',
          'moderator@nihonaustralia.com',
          'support@nihonaustralia.com',
          'ryotaro.ueda@outlook.com'
        ];
        
        return adminEmails.includes(user.email || '');
      }
      return false;
    }

    return data?.admin_verified === true;
  } catch {
    return false;
  }
}

/**
 * Get admin user details
 */
export async function getAdminUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AdminUser | null> {
  try {
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('mypage_profiles')
      .select('*')
      .eq('id', userId)
      .eq('admin_verified', true)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Get current user for email (assuming this user is calling this function)
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    return {
      id: profile.id,
      email: currentUser?.email || '',
      full_name: profile.full_name,
      phone: profile.phone,
      admin_verified: profile.admin_verified || false,
      verified_by: profile.verified_by,
      verified_at: profile.verified_at,
      verification_notes: profile.verification_notes,
      created_at: profile.created_at,
      last_sign_in_at: currentUser?.last_sign_in_at || null,
    };
  } catch {
    return null;
  }
}

/**
 * Get current authenticated admin user
 */
export async function getCurrentAdminUser(
  supabase: SupabaseClient<Database>
): Promise<AdminUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return await getAdminUser(supabase, user.id);
  } catch {
    return null;
  }
}

/**
 * Verify admin permissions for current session
 */
export async function verifyAdminSession(
  supabase: SupabaseClient<Database>
): Promise<{ isAdmin: boolean; user: AdminUser | null }> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { isAdmin: false, user: null };
    }

    const isAdmin = await isAdminUser(supabase, user.id);
    const adminUser = isAdmin ? await getAdminUser(supabase, user.id) : null;

    return { isAdmin, user: adminUser };
  } catch {
    return { isAdmin: false, user: null };
  }
}

/**
 * Admin role types for future expansion
 */
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
}

/**
 * Check if user has specific admin role (for future role-based access)
 * Currently uses admin_verified, but can be extended with roles table
 */
export async function hasAdminRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: AdminRole
): Promise<boolean> {
  // For now, all admin_verified users have full admin access
  // This can be extended with a roles table in the future
  return await isAdminUser(supabase, userId);
}

/**
 * Error types for admin authentication
 */
export class AdminAuthError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export const ADMIN_AUTH_ERRORS = {
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  NOT_ADMIN: 'NOT_ADMIN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
} as const;
