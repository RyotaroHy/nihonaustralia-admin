const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminDB() {
  try {
    console.log('Setting up admin for ryotaro.ueda@outlook.com...');
    
    // Get your user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const adminUser = users.users.find(u => u.email === 'ryotaro.ueda@outlook.com');
    
    if (adminUser) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('mypage_profiles')
        .select('id')
        .eq('id', adminUser.id)
        .single();

      if (profile) {
        // Try to update with admin_verified column
        const { error: updateError } = await supabase
          .from('mypage_profiles')
          .update({ admin_verified: true })
          .eq('id', adminUser.id);

        if (updateError) {
          console.log('Could not update admin_verified column, it may not exist yet');
          console.log('Using fallback email check for now');
        } else {
          console.log('✅ Successfully set ryotaro.ueda@outlook.com as admin');
        }
      } else {
        console.log('❌ Profile not found for user');
      }
    } else {
      console.log('❌ User with email ryotaro.ueda@outlook.com not found');
      console.log('Available users:');
      users.users.forEach(u => console.log(` - ${u.email}`));
    }

  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

setupAdminDB();