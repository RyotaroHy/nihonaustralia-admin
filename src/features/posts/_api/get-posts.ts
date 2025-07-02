import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { createSupabaseAdminClient } from '@/lib/supabase-browser';

export type AdminPost = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  author_name: string | null;
  author_email: string;
  company_name: string | null;
  salary: string | null;
  salary_min: number | null;
  salary_max: number | null;
  state: string | null;
  suburb: string | null;
  view_count: number;
  likes_count: number;
  trust_score: number;
  created_at: string | null;
  updated_at: string | null;
};

type GetPostsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'draft' | 'public' | 'closed';
  type?: 'all' | 'job' | 'house' | 'qa' | 'service';
  sortBy?: 'created_at' | 'updated_at' | 'view_count' | 'trust_score';
  sortOrder?: 'asc' | 'desc';
};

type GetPostsResponse = {
  posts: AdminPost[];
  totalCount: number;
  hasMore: boolean;
};

export const getPosts = async (
  supabase: SupabaseClient<Database>,
  params: GetPostsParams = {}
): Promise<GetPostsResponse> => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = 'all',
    type = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Use the job_posts_with_trust view for comprehensive data
  let query = supabase
    .from('job_posts_with_trust')
    .select(`
      post_id,
      title,
      description,
      status,
      full_name,
      company_name,
      salary,
      salary_min,
      salary_max,
      state,
      suburb,
      likes_count,
      trust_score,
      post_created_at,
      created_by
    `)
    .range(from, to);

  // Apply search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply type filter - note: filtering by type needs to be done via posts table join
  // For now, we'll only fetch job posts since this is job_posts_with_trust view

  // Apply sorting - map to correct column names
  const sortColumn = sortBy === 'created_at' ? 'post_created_at' : 
                     sortBy === 'updated_at' ? 'post_created_at' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  const { data: postsData, error: postsError } = await query;

  if (postsError) {
    throw new Error(`Failed to fetch posts: ${postsError.message}`);
  }

  // Get author emails from auth users (optional for now)
  const authorEmails: Record<string, string> = {};
  
  // Note: auth.admin.listUsers() requires service role key and proper setup
  // For now, we'll use placeholder emails and implement this later

  // Transform data
  const posts: AdminPost[] = (postsData || []).map(post => ({
    id: post.post_id || '',
    type: 'job', // Since this is from job_posts_with_trust view
    title: post.title || 'Untitled',
    description: post.description,
    status: post.status || 'draft',
    author_name: post.full_name,
    author_email: 'admin@example.com', // Placeholder for now
    company_name: post.company_name,
    salary: post.salary,
    salary_min: post.salary_min,
    salary_max: post.salary_max,
    state: post.state,
    suburb: post.suburb,
    view_count: 0, // Not available in this view
    likes_count: post.likes_count || 0,
    trust_score: post.trust_score || 0,
    created_at: post.post_created_at,
    updated_at: post.post_created_at, // Using created_at as fallback
  }));

  // Get total count for pagination
  let countQuery = supabase
    .from('job_posts_with_trust')
    .select('*', { count: 'exact', head: true });

  if (search) {
    countQuery = countQuery.or(`title.ilike.%${search}%,company_name.ilike.%${search}%,full_name.ilike.%${search}%`);
  }
  if (status !== 'all') {
    countQuery = countQuery.eq('status', status);
  }
  // Note: type filtering removed since this view is job-specific

  const { count: totalCount } = await countQuery;

  return {
    posts,
    totalCount: totalCount || 0,
    hasMore: (from + posts.length) < (totalCount || 0),
  };
};

// Note: usePosts hook removed - using direct queries in container components instead

// Helper function to update post status
export const updatePostStatus = async (
  supabase: SupabaseClient<Database>,
  postId: string,
  status: string
): Promise<void> => {
  const { error } = await supabase
    .from('posts')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (error) {
    throw new Error(`Failed to update post status: ${error.message}`);
  }
};

// Helper function to delete post
export const deletePost = async (
  supabase: SupabaseClient<Database>,
  postId: string
): Promise<void> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};