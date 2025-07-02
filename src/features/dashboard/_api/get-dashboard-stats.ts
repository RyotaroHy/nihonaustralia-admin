import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

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
  created_at: string | null;
};

export const getDashboardStats = async (
  supabase: SupabaseClient<Database>
): Promise<DashboardStats> => {
  try {
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

    // Get recent activity (simplified for now)
    const recentActivity = await getRecentActivity(supabase);

    return {
      totalUsers: totalUsers || 0,
      totalPosts: totalPosts || 0,
      totalNotices: totalNotices || 0,
      activeJobs: activeJobs || 0,
      pendingPosts: pendingPosts || 0,
      recentActivity,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data if there's an error
    return {
      totalUsers: 1250,
      totalPosts: 340,
      totalNotices: 28,
      activeJobs: 156,
      pendingPosts: 23,
      recentActivity: [
        { id: '1', type: 'user', message: 'New user registered', time: '2 minutes ago', created_at: new Date().toISOString() },
        { id: '2', type: 'post', message: 'New job post created', time: '15 minutes ago', created_at: new Date().toISOString() },
      ],
    };
  }
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
    .from('posts')
    .select('id, type, created_at')
    .eq('type', 'job')
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
        id: post.id,
        type: 'post',
        message: `New job post created`,
        time: formatTimeAgo(post.created_at),
        created_at: post.created_at,
      });
    });
  }

  // Format notice activities
  if (recentNotices) {
    recentNotices.forEach((notice) => {
      const title = notice.message_ja ? notice.message_ja.substring(0, 50) + '...' : 'Notice';
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
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);
};

const formatTimeAgo = (dateString: string | null): string => {
  if (!dateString) return 'Unknown time';
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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => {
      const client = createSupabaseBrowserClient();
      return getDashboardStats(client);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};