export type AdminNotice = {
  id: string;
  title_ja: string;
  title_en: string | null;
  message_ja: string;
  message_en: string | null;
  priority: string;
  status: string;
  publish_at: string | null;
  expire_at: string | null;
  target_audience: string | null;
  created_by: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
};

type GetNoticesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'draft' | 'published' | 'archived';
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
};

type GetNoticesResponse = {
  notices: AdminNotice[];
  totalCount: number;
  hasMore: boolean;
};

export const getNotices = async (
  params: GetNoticesParams = {}
): Promise<GetNoticesResponse> => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    status,
    sortBy,
    sortOrder,
  });

  const response = await fetch(`/api/notices?${searchParams}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch notices');
  }

  return response.json();
};

// Note: useNotices hook removed - using direct queries in container components instead

export type CreateNoticeData = {
  title_ja: string;
  title_en?: string;
  message_ja: string;
  message_en?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  publish_at?: string;
  expire_at?: string;
  target_audience?: string;
  created_by: string;
};

export const createNotice = async (data: CreateNoticeData): Promise<AdminNotice> => {
  const response = await fetch('/api/notices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create notice');
  }

  return response.json();
};

export type UpdateNoticeData = Partial<Omit<CreateNoticeData, 'created_by'>>;

export const updateNotice = async (
  noticeId: string,
  data: UpdateNoticeData
): Promise<void> => {
  const response = await fetch('/api/notices', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noticeId, ...data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update notice');
  }
};

export const deleteNotice = async (noticeId: string): Promise<void> => {
  const response = await fetch(`/api/notices?id=${noticeId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete notice');
  }
};

