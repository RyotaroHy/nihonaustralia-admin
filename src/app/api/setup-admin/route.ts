import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerAdminClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminClient = createSupabaseServerAdminClient();
    
    // Add admin_verified column if it doesn't exist
    try {
      await adminClient.rpc('exec_sql', {
        sql: `
          ALTER TABLE mypage_profiles 
          ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;
        `
      });
    } catch (error) {
      console.log('Column may already exist or RPC not available:', error);
    }

    // Try to update the user to be an admin
    const { data, error } = await adminClient
      .from('mypage_profiles')
      .update({ admin_verified: true })
      .eq('id', userId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}