import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  gender: string | null;
  au_state: string | null;
  visa: number | string | null;
  origin_country: number | string | null;
  admin_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  trust_score: number;
  post_count: number;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: 'all' | 'verified' | 'unverified';
  sortBy?: 'created_at' | 'last_sign_in_at' | 'trust_score' | 'full_name';
  sortOrder?: 'asc' | 'desc';
};

type GetUsersResponse = {
  users: AdminUser[];
  totalCount: number;
  hasMore: boolean;
};

export const getUsers = async (
  params: GetUsersParams = {}
): Promise<GetUsersResponse> => {
  const {
    page = 1,
    limit = 20,
    search = '',
    verificationStatus = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    verificationStatus,
    sortBy,
    sortOrder,
  });

  const response = await fetch(`/api/users?${searchParams}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users');
  }

  return response.json();
};

// Note: useUsers hook removed - using direct queries in container components instead

// Helper function to update user verification status
export const updateUserVerification = async (
  userId: string,
  verified: boolean,
  notes?: string
): Promise<void> => {
  const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, verified, notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update verification');
  }
};