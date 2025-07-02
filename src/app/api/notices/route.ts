import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerAdminClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const adminClient = createSupabaseServerAdminClient();
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get notices data
    let query = adminClient
      .from('notices')
      .select(`
        id,
        title_ja,
        title_en,
        message_ja,
        message_en,
        priority,
        status,
        publish_at,
        expire_at,
        target_audience,
        created_by,
        created_at,
        updated_at
      `)
      .range(from, to);

    // Apply search filter
    if (search) {
      query = query.or(`title_ja.ilike.%${search}%,title_en.ilike.%${search}%,message_ja.ilike.%${search}%,message_en.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    if (sortBy === 'title') {
      query = query.order('title_ja', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'priority') {
      query = query.order('priority', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'status') {
      query = query.order('status', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    const { data: noticesData, error: noticesError } = await query;

    if (noticesError) {
      return NextResponse.json({ error: `Failed to fetch notices: ${noticesError.message}` }, { status: 500 });
    }

    // Get creator information for each notice
    const creatorIds = [...new Set(noticesData?.map(n => n.created_by).filter(Boolean) || [])];
    let creators: any[] = [];
    
    if (creatorIds.length > 0) {
      const { data: creatorsData } = await adminClient
        .from('mypage_profiles')
        .select('id, full_name')
        .in('id', creatorIds);
      
      creators = creatorsData || [];
    }

    // Merge notices with creator data
    const notices = (noticesData || []).map(notice => {
      const creator = creators.find(c => c.id === notice.created_by);
      
      return {
        id: notice.id,
        title_ja: notice.title_ja,
        title_en: notice.title_en,
        message_ja: notice.message_ja,
        message_en: notice.message_en,
        priority: notice.priority,
        status: notice.status,
        publish_at: notice.publish_at,
        expire_at: notice.expire_at,
        target_audience: notice.target_audience,
        created_by: notice.created_by,
        creator_name: creator?.full_name || 'Unknown User',
        created_at: notice.created_at,
        updated_at: notice.updated_at,
      };
    });

    // Get total count for pagination
    let countQuery = adminClient
      .from('notices')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`title_ja.ilike.%${search}%,title_en.ilike.%${search}%,message_ja.ilike.%${search}%,message_en.ilike.%${search}%`);
    }
    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      notices,
      totalCount: totalCount || 0,
      hasMore: (from + notices.length) < (totalCount || 0),
    });

  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const notice = await request.json();

    const adminClient = createSupabaseServerAdminClient();

    const { data, error } = await adminClient
      .from('notices')
      .insert(notice)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Failed to create notice: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { noticeId, ...updateData } = await request.json();

    if (!noticeId) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 });
    }

    const adminClient = createSupabaseServerAdminClient();

    const { error } = await adminClient
      .from('notices')
      .update(updateData)
      .eq('id', noticeId);

    if (error) {
      return NextResponse.json({ error: `Failed to update notice: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noticeId = searchParams.get('id');

    if (!noticeId) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 });
    }

    const adminClient = createSupabaseServerAdminClient();

    const { error } = await adminClient
      .from('notices')
      .delete()
      .eq('id', noticeId);

    if (error) {
      return NextResponse.json({ error: `Failed to delete notice: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}