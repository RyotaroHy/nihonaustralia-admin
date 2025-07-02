import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  gender: string | null;
  au_state: string | null;
  visa: string | null;
  origin_country: string | null;
  admin_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  trust_score: number;
  post_count: number;
  created_at: string;
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
  supabase: SupabaseClient<Database>,
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

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Build query with joins
  let query = supabase
    .from('trust_scores_view')
    .select(`
      user_id,
      full_name,
      phone,
      gender,
      au_state,
      visa,
      origin_country,
      admin_verified,
      verified_by,
      verified_at,
      verification_notes,
      trust_score,
      post_count,
      profile_created_at,
      mypage_profiles!inner(created_at)
    `)
    .range(from, to);

  // Apply search filter
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  // Apply verification status filter
  if (verificationStatus === 'verified') {
    query = query.eq('admin_verified', true);
  } else if (verificationStatus === 'unverified') {
    query = query.eq('admin_verified', false);
  }

  // Apply sorting
  if (sortBy === 'trust_score') {
    query = query.order('trust_score', { ascending: sortOrder === 'asc' });
  } else if (sortBy === 'full_name') {
    query = query.order('full_name', { ascending: sortOrder === 'asc' });
  } else {
    query = query.order('profile_created_at', { ascending: sortOrder === 'asc' });
  }

  const { data: profilesData, error: profilesError } = await query;

  if (profilesError) {
    throw new Error(`Failed to fetch users: ${profilesError.message}`);
  }

  // Get auth user data for emails and last sign in
  const userIds = profilesData?.map(p => p.user_id) || [];
  
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    perPage: 1000, // Supabase admin API limitation
  });

  if (authError) {
    throw new Error(`Failed to fetch auth users: ${authError.message}`);
  }

  // Merge profile and auth data
  const users: AdminUser[] = (profilesData || []).map(profile => {
    const authUser = authUsers.users.find(u => u.id === profile.user_id);
    
    return {
      id: profile.user_id,
      email: authUser?.email || '',
      full_name: profile.full_name,
      phone: profile.phone,
      gender: profile.gender,
      au_state: profile.au_state,
      visa: profile.visa,
      origin_country: profile.origin_country,
      admin_verified: profile.admin_verified || false,
      verified_by: profile.verified_by,
      verified_at: profile.verified_at,
      verification_notes: profile.verification_notes,
      trust_score: profile.trust_score || 0,
      post_count: profile.post_count || 0,
      created_at: profile.profile_created_at || profile.mypage_profiles.created_at,
      last_sign_in_at: authUser?.last_sign_in_at || null,
      email_confirmed_at: authUser?.email_confirmed_at || null,
    };
  });

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('trust_scores_view')
    .select('*', { count: 'exact', head: true });

  return {
    users,
    totalCount: totalCount || 0,
    hasMore: (from + users.length) < (totalCount || 0),
  };
};

// Note: useUsers hook removed - using direct queries in container components instead

// Helper function to update user verification status
export const updateUserVerification = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  verified: boolean,
  notes?: string
): Promise<void> => {
  const { error } = await supabase
    .from('mypage_profiles')
    .update({
      admin_verified: verified,
      verified_at: verified ? new Date().toISOString() : null,
      verification_notes: notes || null,
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update verification: ${error.message}`);
  }
};