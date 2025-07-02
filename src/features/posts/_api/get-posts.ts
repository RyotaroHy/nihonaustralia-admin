import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';

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
  created_at: string;
  updated_at: string;
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
      post_type,
      title,
      description,
      status,
      author_name,
      company_name,
      salary,
      salary_min,
      salary_max,
      state,
      suburb,
      view_count,
      likes_count,
      trust_score,
      created_at,
      updated_at
    `)
    .range(from, to);

  // Apply search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%,author_name.ilike.%${search}%`);
  }

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply type filter
  if (type !== 'all') {
    query = query.eq('post_type', type);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  const { data: postsData, error: postsError } = await query;

  if (postsError) {
    throw new Error(`Failed to fetch posts: ${postsError.message}`);
  }

  // Get author emails from auth users
  const authorIds = [...new Set(postsData?.map(p => p.created_by).filter(Boolean) || [])];
  const authorEmails: Record<string, string> = {};

  if (authorIds.length > 0) {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (!authError && authUsers) {
      authUsers.users.forEach(user => {
        if (authorIds.includes(user.id)) {
          authorEmails[user.id] = user.email || '';
        }
      });
    }
  }

  // Transform data
  const posts: AdminPost[] = (postsData || []).map(post => ({
    id: post.post_id,
    type: post.post_type || 'job',
    title: post.title || 'Untitled',
    description: post.description,
    status: post.status || 'draft',
    author_name: post.author_name,
    author_email: authorEmails[post.created_by] || 'Unknown',
    company_name: post.company_name,
    salary: post.salary,
    salary_min: post.salary_min,
    salary_max: post.salary_max,
    state: post.state,
    suburb: post.suburb,
    view_count: post.view_count || 0,
    likes_count: post.likes_count || 0,
    trust_score: post.trust_score || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
  }));

  // Get total count for pagination
  let countQuery = supabase
    .from('job_posts_with_trust')
    .select('*', { count: 'exact', head: true });

  if (search) {
    countQuery = countQuery.or(`title.ilike.%${search}%,company_name.ilike.%${search}%,author_name.ilike.%${search}%`);
  }
  if (status !== 'all') {
    countQuery = countQuery.eq('status', status);
  }
  if (type !== 'all') {
    countQuery = countQuery.eq('post_type', type);
  }

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