'use client';

import { useState } from 'react';
import { getPosts, updatePostStatus, deletePost, AdminPost } from './_api/get-posts';
import { PostsPresenter } from './PostsPresenter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseAdminClient } from '@/lib/supabase-browser';

export function PostsContainer() {
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'public' | 'closed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'job' | 'house' | 'qa' | 'service'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'view_count' | 'trust_score'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-posts', { 
      page: currentPage, 
      search: searchTerm, 
      status: statusFilter,
      type: typeFilter,
      sortBy,
      sortOrder 
    }],
    queryFn: () => {
      const adminClient = createSupabaseAdminClient();
      return getPosts(adminClient, {
        page: currentPage,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        sortBy,
        sortOrder,
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: string }) => {
      const adminClient = createSupabaseAdminClient();
      return updatePostStatus(adminClient, postId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => {
      const adminClient = createSupabaseAdminClient();
      return deletePost(adminClient, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
  });

  const handleStatusUpdate = (postId: string, status: string) => {
    statusMutation.mutate({ postId, status });
  };

  const handleDelete = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(postId);
    }
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (filter: typeof statusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (filter: typeof typeFilter) => {
    setTypeFilter(filter);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <PostsSkeleton />;
  }

  if (error) {
    return <PostsError error={error.message} />;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <PostsPresenter 
      posts={data.posts}
      totalCount={data.totalCount}
      hasMore={data.hasMore}
      currentPage={currentPage}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      typeFilter={typeFilter}
      sortBy={sortBy}
      sortOrder={sortOrder}
      isUpdating={statusMutation.isPending || deleteMutation.isPending}
      onSearch={handleSearch}
      onStatusFilterChange={handleStatusFilterChange}
      onTypeFilterChange={handleTypeFilterChange}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onStatusUpdate={handleStatusUpdate}
      onDelete={handleDelete}
    />
  );
}

function PostsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PostsError({ error }: { error: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage job posts and content</p>
      </div>

      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading posts data
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}