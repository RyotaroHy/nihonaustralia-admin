const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAdminColumn() {
  try {
    console.log('Adding admin_verified column to mypage_profiles...');
    
    // Add the column using raw SQL
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE mypage_profiles 
        ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;
        
        ALTER TABLE mypage_profiles 
        ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
        
        ALTER TABLE mypage_profiles 
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
        
        ALTER TABLE mypage_profiles 
        ADD COLUMN IF NOT EXISTS verification_notes TEXT;
      `
    });

    if (error) {
      console.error('Error adding columns via RPC:', error);
      console.log('RPC might not be available. You may need to run the migration manually.');
    } else {
      console.log('✅ Columns added successfully');
    }

    // Now set admin privileges
    const adminUserId = '7d13fc27-bf3c-455f-8936-9dca7296deb4';
    
    const { data: updateData, error: updateError } = await supabase
      .from('mypage_profiles')
      .update({ 
        admin_verified: true,
        verified_at: new Date().toISOString(),
        verification_notes: 'Admin account setup'
      })
      .eq('id', adminUserId);

    if (updateError) {
      console.error('Error updating admin status:', updateError);
    } else {
      console.log('✅ Successfully set admin@nihonaustralia.com as admin');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

addAdminColumn();