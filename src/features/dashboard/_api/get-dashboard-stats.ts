import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';

type DashboardStats = {
  totalUsers: number;
  totalPosts: number;
  totalNotices: number;
  activeJobs: number;
  pendingPosts: number;
  recentActivity: Activity[];
};

type Activity = {
  id: string;
  type: 'user' | 'post' | 'notice';
  message: string;
  time: string;
  created_at: string;
};

export const getDashboardStats = async (
  supabase: SupabaseClient<Database>
): Promise<DashboardStats> => {
  // Get total users count
  const { count: totalUsers } = await supabase
    .from('mypage_profiles')
    .select('*', { count: 'exact', head: true });

  // Get total posts count
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  // Get total notices count
  const { count: totalNotices } = await supabase
    .from('notices')
    .select('*', { count: 'exact', head: true });

  // Get active job posts count
  const { count: activeJobs } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'job')
    .eq('status', 'public');

  // Get pending posts count
  const { count: pendingPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');

  // Get recent activity
  const recentActivity = await getRecentActivity(supabase);

  return {
    totalUsers: totalUsers || 0,
    totalPosts: totalPosts || 0,
    totalNotices: totalNotices || 0,
    activeJobs: activeJobs || 0,
    pendingPosts: pendingPosts || 0,
    recentActivity,
  };
};

const getRecentActivity = async (
  supabase: SupabaseClient<Database>
): Promise<Activity[]> => {
  const activities: Activity[] = [];

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('mypage_profiles')
    .select('id, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent posts
  const { data: recentPosts } = await supabase
    .from('job_posts')
    .select('post_id, title, created_at, posts!inner(created_by, created_at)')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent notices
  const { data: recentNotices } = await supabase
    .from('notices')
    .select('id, message_ja, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  // Format user activities
  if (recentUsers) {
    recentUsers.forEach((user) => {
      activities.push({
        id: user.id,
        type: 'user',
        message: `New user registered: ${user.full_name || 'Anonymous'}`,
        time: formatTimeAgo(user.created_at),
        created_at: user.created_at,
      });
    });
  }

  // Format post activities
  if (recentPosts) {
    recentPosts.forEach((post) => {
      activities.push({
        id: post.post_id,
        type: 'post',
        message: `New job post: ${post.title}`,
        time: formatTimeAgo(post.created_at),
        created_at: post.created_at,
      });
    });
  }

  // Format notice activities
  if (recentNotices) {
    recentNotices.forEach((notice) => {
      const title = notice.message_ja.substring(0, 50) + '...';
      activities.push({
        id: notice.id,
        type: 'notice',
        message: `Notice published: ${title}`,
        time: formatTimeAgo(notice.created_at),
        created_at: notice.created_at,
      });
    });
  }

  // Sort by created_at and return top 10
  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
};

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

export const useDashboardStats = (supabase: SupabaseClient<Database>) => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(supabase),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};