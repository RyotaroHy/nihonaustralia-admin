import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerAdminClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const verificationStatus = searchParams.get('verificationStatus') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const adminClient = createSupabaseServerAdminClient();
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get profiles data
    let query = adminClient
      .from('mypage_profiles')
      .select(`
        id,
        full_name,
        phone,
        gender,
        au_state,
        visa,
        origin_country,
        admin_verified,
        verified_by,
        verified_at,
        verification_notes,
        created_at
      `)
      .range(from, to);

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Apply verification status filter - fallback to false if column doesn't exist
    if (verificationStatus === 'verified') {
      query = query.eq('admin_verified', true);
    } else if (verificationStatus === 'unverified') {
      query = query.or('admin_verified.eq.false,admin_verified.is.null');
    }

    // Apply sorting
    if (sortBy === 'full_name') {
      query = query.order('full_name', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    const { data: profilesData, error: profilesError } = await query;

    if (profilesError) {
      return NextResponse.json({ error: `Failed to fetch users: ${profilesError.message}` }, { status: 500 });
    }

    // Get auth user data for emails and last sign in
    const userIds = profilesData?.map(p => p.id) || [];
    let authUsers: any = { users: [] };
    
    try {
      const { data, error: authError } = await adminClient.auth.admin.listUsers({
        perPage: 1000,
      });
      if (!authError) {
        authUsers = data;
      }
    } catch (error) {
      console.warn('Failed to fetch auth users:', error);
    }

    // Merge profile and auth data
    const users = (profilesData || []).map(profile => {
      const authUser = authUsers?.users?.find((u: any) => u.id === profile.id);
      
      return {
        id: profile.id,
        email: authUser?.email || '',
        full_name: profile.full_name,
        phone: profile.phone,
        gender: profile.gender,
        au_state: profile.au_state,
        visa: profile.visa ? String(profile.visa) : null,
        origin_country: profile.origin_country ? String(profile.origin_country) : null,
        admin_verified: profile.admin_verified || false,
        verified_by: profile.verified_by,
        verified_at: profile.verified_at,
        verification_notes: profile.verification_notes,
        trust_score: 0,
        post_count: 0,
        created_at: profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        email_confirmed_at: authUser?.email_confirmed_at || null,
      };
    });

    // Get total count for pagination
    const { count: totalCount } = await adminClient
      .from('mypage_profiles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      users,
      totalCount: totalCount || 0,
      hasMore: (from + users.length) < (totalCount || 0),
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, verified, notes } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminClient = createSupabaseServerAdminClient();

    const { error } = await adminClient
      .from('mypage_profiles')
      .update({
        admin_verified: verified,
        verified_at: verified ? new Date().toISOString() : null,
        verification_notes: notes || null,
      })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: `Failed to update verification: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating user verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}