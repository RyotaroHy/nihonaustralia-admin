import { HiUsers, HiDocumentText, HiSpeakerphone, HiBriefcase, HiClock } from 'react-icons/hi';

type Stats = {
  totalUsers: number;
  totalPosts: number;
  totalNotices: number;
  activeJobs: number;
  pendingPosts: number;
};

type Activity = {
  id: string;
  type: string;
  message: string;
  time: string;
  created_at: string | null;
};

type DashboardPresenterProps = {
  stats: Stats;
  recentActivity: Activity[];
};

export function DashboardPresenter({ stats, recentActivity }: DashboardPresenterProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: HiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: HiDocumentText,
      color: 'bg-green-500',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs.toLocaleString(),
      icon: HiBriefcase,
      color: 'bg-yellow-500',
    },
    {
      title: 'Notices',
      value: stats.totalNotices.toLocaleString(),
      icon: HiSpeakerphone,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Posts',
      value: stats.pendingPosts.toLocaleString(),
      icon: HiClock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}