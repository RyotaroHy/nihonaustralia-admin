const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdmin() {
  try {
    const adminUserId = '7d13fc27-bf3c-455f-8936-9dca7296deb4'; // admin@nihonaustralia.com

    console.log('Setting admin privileges for admin@nihonaustralia.com...');
    
    // Update the profile to set admin_verified = true
    const { data, error } = await supabase
      .from('mypage_profiles')
      .update({ 
        admin_verified: true,
        verified_at: new Date().toISOString(),
        verification_notes: 'Admin account setup'
      })
      .eq('id', adminUserId)
      .select();

    if (error) {
      console.error('Error updating admin status:', error);
    } else {
      console.log('✅ Successfully set admin@nihonaustralia.com as admin');
      console.log('Data:', data);
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('mypage_profiles')
      .select('admin_verified, verified_at')
      .eq('id', adminUserId)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Verification:', verifyData);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

setAdmin();