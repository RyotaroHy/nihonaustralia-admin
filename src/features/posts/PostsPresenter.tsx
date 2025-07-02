import { AdminPost } from './_api/get-posts';
import { HiSearch, HiEye, HiHeart, HiSortAscending, HiSortDescending, HiTrash } from 'react-icons/hi';

type PostsPresenterProps = {
  posts: AdminPost[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  searchTerm: string;
  statusFilter: 'all' | 'draft' | 'public' | 'closed';
  typeFilter: 'all' | 'job' | 'house' | 'qa' | 'service';
  sortBy: 'created_at' | 'updated_at' | 'view_count' | 'trust_score';
  sortOrder: 'asc' | 'desc';
  isUpdating: boolean;
  onSearch: (search: string) => void;
  onStatusFilterChange: (filter: 'all' | 'draft' | 'public' | 'closed') => void;
  onTypeFilterChange: (filter: 'all' | 'job' | 'house' | 'qa' | 'service') => void;
  onSortChange: (sortBy: typeof sortBy, sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onStatusUpdate: (postId: string, status: string) => void;
  onDelete: (postId: string) => void;
};

export function PostsPresenter({
  posts,
  totalCount,
  hasMore,
  currentPage,
  searchTerm,
  statusFilter,
  typeFilter,
  sortBy,
  sortOrder,
  isUpdating,
  onSearch,
  onStatusFilterChange,
  onTypeFilterChange,
  onSortChange,
  onPageChange,
  onStatusUpdate,
  onDelete,
}: PostsPresenterProps) {
  const handleSortClick = (field: typeof sortBy) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortOrder === 'desc' ? <HiSortDescending className="h-4 w-4" /> : <HiSortAscending className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (post: AdminPost) => {
    if (post.salary_min && post.salary_max) {
      return `$${post.salary_min.toLocaleString()} - $${post.salary_max.toLocaleString()}`;
    }
    if (post.salary) {
      return post.salary;
    }
    return 'Not specified';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'public':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'house':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'qa':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'service':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage job posts and content ({totalCount.toLocaleString()} total)
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as typeof statusFilter)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="public">Public</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as typeof typeFilter)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="job">Jobs</option>
            <option value="house">Housing</option>
            <option value="qa">Q&A</option>
            <option value="service">Services</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            Showing {posts.length} of {totalCount} posts
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location & Salary
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSortClick('view_count')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Engagement</span>
                    {getSortIcon('view_count')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSortClick('trust_score')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Trust</span>
                    {getSortIcon('trust_score')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSortClick('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {post.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(post.type)}`}>
                          {post.type}
                        </span>
                        {post.company_name && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {post.company_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.author_name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {post.author_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={post.status}
                      onChange={(e) => onStatusUpdate(post.id, e.target.value)}
                      disabled={isUpdating}
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(post.status)} disabled:opacity-50`}
                    >
                      <option value="draft">Draft</option>
                      <option value="public">Public</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      {post.state && post.suburb && (
                        <div>{post.suburb}, {post.state}</div>
                      )}
                      <div className="text-xs">{formatSalary(post)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <HiEye className="h-4 w-4 mr-1" />
                        {post.view_count}
                      </div>
                      <div className="flex items-center">
                        <HiHeart className="h-4 w-4 mr-1" />
                        {post.likes_count}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`font-medium ${getTrustScoreColor(post.trust_score)}`}>
                      {post.trust_score}/90
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDelete(post.id)}
                        disabled={isUpdating}
                        className="inline-flex items-center p-1 border border-transparent rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
                        title="Delete post"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {Math.ceil(totalCount / 20)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!hasMore}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}