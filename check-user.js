const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  try {
    console.log('Checking for admin@nihonaustralia.com...');
    
    // List all users to see what exists
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return;
    }

    console.log('\nAll users in database:');
    users.users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id}, Created: ${user.created_at})`);
    });

    // Check specifically for admin@nihonaustralia.com
    const adminUser = users.users.find(u => u.email === 'admin@nihonaustralia.com');
    
    if (adminUser) {
      console.log('\n✅ Found admin@nihonaustralia.com:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email confirmed: ${adminUser.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Last sign in: ${adminUser.last_sign_in_at || 'Never'}`);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('mypage_profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();

      if (profileError) {
        console.log('   Profile: Not found');
      } else {
        console.log('   Profile: Found');
        console.log(`   Admin verified: ${profile.admin_verified || false}`);
      }
    } else {
      console.log('\n❌ admin@nihonaustralia.com not found');
      console.log('\nTo create this user, you can:');
      console.log('1. Sign up normally through the auth system');
      console.log('2. Or create via admin API');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();