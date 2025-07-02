import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerAdminClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminClient = createSupabaseServerAdminClient();
    
    // Check admin status directly on server-side
    let isAdmin = false;

    try {
      // Try to check admin_verified column
      const { data, error } = await adminClient
        .from('mypage_profiles')
        .select('admin_verified')
        .eq('id', userId)
        .single();

      if (error) {
        // If admin_verified column doesn't exist, check email fallback
        if (error.message.includes('admin_verified') || error.message.includes('column')) {
          console.log('admin_verified field not found, using email fallback');
          
          // Get user email from auth.users
          const { data: authData, error: authError } = await adminClient.auth.admin.getUserById(userId);
          
          if (!authError && authData.user?.email) {
            const adminEmails = [
              'admin@nihonaustralia.com',
              'moderator@nihonaustralia.com',
              'support@nihonaustralia.com',
              'ryotaro.ueda@outlook.com'
            ];
            
            isAdmin = adminEmails.includes(authData.user.email);
          }
        }
      } else {
        isAdmin = data?.admin_verified === true;
      }
    } catch (checkError) {
      console.error('Error checking admin status:', checkError);
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error in check-admin API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}