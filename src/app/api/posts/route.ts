import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerAdminClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const adminClient = createSupabaseServerAdminClient();
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get posts data
    let query = adminClient
      .from('posts')
      .select(`
        id,
        type,
        status,
        title,
        content,
        location,
        salary_min,
        salary_max,
        salary_type,
        user_id,
        created_at,
        updated_at
      `)
      .range(from, to);

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply type filter
    if (type !== 'all') {
      query = query.eq('type', type);
    }

    // Apply sorting
    if (sortBy === 'title') {
      query = query.order('title', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'status') {
      query = query.order('status', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'type') {
      query = query.order('type', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError) {
      return NextResponse.json({ error: `Failed to fetch posts: ${postsError.message}` }, { status: 500 });
    }

    // Get user information for each post
    const userIds = [...new Set(postsData?.map(p => p.user_id).filter(Boolean) || [])];
    let users: any[] = [];
    
    if (userIds.length > 0) {
      const { data: usersData } = await adminClient
        .from('mypage_profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      users = usersData || [];
    }

    // Merge posts with user data
    const posts = (postsData || []).map(post => {
      const user = users.find(u => u.id === post.user_id);
      
      return {
        id: post.id,
        type: post.type,
        status: post.status,
        title: post.title,
        content: post.content,
        location: post.location,
        salary_min: post.salary_min,
        salary_max: post.salary_max,
        salary_type: post.salary_type,
        user_id: post.user_id,
        user_name: user?.full_name || 'Unknown User',
        created_at: post.created_at,
        updated_at: post.updated_at,
      };
    });

    // Get total count for pagination
    let countQuery = adminClient
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,location.ilike.%${search}%`);
    }
    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (type !== 'all') {
      countQuery = countQuery.eq('type', type);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      posts,
      totalCount: totalCount || 0,
      hasMore: (from + posts.length) < (totalCount || 0),
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { postId, status, moderationNotes } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const adminClient = createSupabaseServerAdminClient();

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (moderationNotes !== undefined) {
      updateData.moderation_notes = moderationNotes;
    }

    const { error } = await adminClient
      .from('posts')
      .update(updateData)
      .eq('id', postId);

    if (error) {
      return NextResponse.json({ error: `Failed to update post: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}