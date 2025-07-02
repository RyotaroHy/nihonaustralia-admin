import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type AdminNotice = {
  id: string;
  message_ja: string;
  message_en: string | null;
  created_by: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

type GetNoticesParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
};

type GetNoticesResponse = {
  notices: AdminNotice[];
  totalCount: number;
  hasMore: boolean;
};

export const getNotices = async (
  supabase: SupabaseClient<Database>,
  params: GetNoticesParams = {}
): Promise<GetNoticesResponse> => {
  const {
    page = 1,
    limit = 20,
    search = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Query notices
  let query = supabase
    .from('notices')
    .select(`
      id,
      message_ja,
      message_en,
      created_by,
      created_at,
      updated_at
    `)
    .range(from, to);

  // Apply search filter
  if (search) {
    query = query.or(`message_ja.ilike.%${search}%,message_en.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const { data: noticesData, error: noticesError } = await query;

  if (noticesError) {
    throw new Error(`Failed to fetch notices: ${noticesError.message}`);
  }

  // Get creator names from profiles
  const creatorIds = [...new Set(noticesData?.map(n => n.created_by).filter(Boolean) || [])];
  const creatorNames: Record<string, string> = {};

  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('mypage_profiles')
      .select('id, full_name')
      .in('id', creatorIds);

    if (profiles) {
      profiles.forEach(profile => {
        creatorNames[profile.id] = profile.full_name || 'Unknown';
      });
    }
  }

  // Transform data
  const notices: AdminNotice[] = (noticesData || []).map(notice => ({
    id: notice.id,
    message_ja: notice.message_ja,
    message_en: notice.message_en,
    created_by: notice.created_by,
    created_by_name: creatorNames[notice.created_by] || 'Unknown',
    created_at: notice.created_at,
    updated_at: notice.updated_at,
  }));

  // Get total count for pagination
  let countQuery = supabase
    .from('notices')
    .select('*', { count: 'exact', head: true });

  if (search) {
    countQuery = countQuery.or(`message_ja.ilike.%${search}%,message_en.ilike.%${search}%`);
  }

  const { count: totalCount } = await countQuery;

  return {
    notices,
    totalCount: totalCount || 0,
    hasMore: (from + notices.length) < (totalCount || 0),
  };
};

// Note: useNotices hook removed - using direct queries in container components instead

// Create notice
type CreateNoticeData = {
  message_ja: string;
  message_en?: string;
  created_by: string;
};

export const createNotice = async (
  supabase: SupabaseClient<Database>,
  data: CreateNoticeData
): Promise<AdminNotice> => {
  const { data: notice, error } = await supabase
    .from('notices')
    .insert({
      message_ja: data.message_ja,
      message_en: data.message_en || null,
      created_by: data.created_by,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create notice: ${error.message}`);
  }

  return {
    id: notice.id,
    message_ja: notice.message_ja,
    message_en: notice.message_en,
    created_by: notice.created_by,
    created_by_name: 'You',
    created_at: notice.created_at,
    updated_at: notice.updated_at,
  };
};

// Update notice
type UpdateNoticeData = {
  message_ja?: string;
  message_en?: string;
};

export const updateNotice = async (
  supabase: SupabaseClient<Database>,
  noticeId: string,
  data: UpdateNoticeData
): Promise<void> => {
  const { error } = await supabase
    .from('notices')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noticeId);

  if (error) {
    throw new Error(`Failed to update notice: ${error.message}`);
  }
};

// Delete notice
export const deleteNotice = async (
  supabase: SupabaseClient<Database>,
  noticeId: string
): Promise<void> => {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', noticeId);

  if (error) {
    throw new Error(`Failed to delete notice: ${error.message}`);
  }
};

// Mutation hooks
export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ supabase, data }: { supabase: SupabaseClient<Database>; data: CreateNoticeData }) =>
      createNotice(supabase, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ supabase, noticeId, data }: { 
      supabase: SupabaseClient<Database>; 
      noticeId: string; 
      data: UpdateNoticeData 
    }) => updateNotice(supabase, noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ supabase, noticeId }: { supabase: SupabaseClient<Database>; noticeId: string }) =>
      deleteNotice(supabase, noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
    },
  });
};