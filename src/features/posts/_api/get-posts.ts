export type AdminPost = {
  id: string;
  type: string;
  status: string;
  title: string;
  content: string;
  location: string | null;
  salary: string | null;
  user_id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
};

type GetPostsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'public' | 'draft' | 'archived';
  type?: 'all' | 'job' | 'community' | 'housing';
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'status' | 'type';
  sortOrder?: 'asc' | 'desc';
};

type GetPostsResponse = {
  posts: AdminPost[];
  totalCount: number;
  hasMore: boolean;
};

export const getPosts = async (
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

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    status,
    type,
    sortBy,
    sortOrder,
  });

  const response = await fetch(`/api/posts?${searchParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch posts');
  }

  return response.json();
};

// Note: usePosts hook removed - using direct queries in container components instead

export const updatePostStatus = async (
  postId: string,
  status: string,
  moderationNotes?: string
): Promise<void> => {
  const response = await fetch('/api/posts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, status, moderationNotes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update post');
  }
};
