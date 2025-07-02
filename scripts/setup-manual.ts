#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupManual() {
  console.log('🛠️  Manual Admin Setup Tool');
  console.log('📅 Started at:', new Date().toISOString());
  console.log('');

  try {
    // Test database connection
    const { data, error } = await supabase.from('mypage_profiles').select('count').limit(1);
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    console.log('✅ Database connection successful');
    console.log('');

    // Check if admin_verified column exists
    console.log('🔍 Checking if admin_verified column exists...');
    
    const { data: adminCheck, error: adminError } = await supabase
      .from('mypage_profiles')
      .select('admin_verified')
      .limit(1);

    if (adminError && adminError.message.includes('admin_verified')) {
      console.log('❌ admin_verified column does not exist');
      console.log('');
      console.log('📋 REQUIRED: Execute this SQL in Supabase Dashboard:');
      console.log('');
      console.log('```sql');
      console.log('-- Add admin verification fields');
      console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;');
      console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);');
      console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;');
      console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;');
      console.log('');
      console.log('-- Create indexes for performance');
      console.log('CREATE INDEX IF NOT EXISTS idx_mypage_profiles_admin_verified');
      console.log('ON mypage_profiles(admin_verified) WHERE admin_verified = true;');
      console.log('```');
      console.log('');
      console.log('📍 Steps:');
      console.log('   1. Open https://supabase.com/dashboard');
      console.log('   2. Select your nihonaustralia project');
      console.log('   3. Go to SQL Editor');
      console.log('   4. Paste and run the SQL above');
      console.log('   5. Run this script again: npm run setup:manual');
      return;
    }

    console.log('✅ admin_verified column exists');

    // Check if admin users exist and have admin privileges
    console.log('👥 Checking admin users...');
    
    const { data: adminUsers } = await supabase
      .from('mypage_profiles')
      .select('id, full_name, admin_verified')
      .eq('admin_verified', true);

    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No admin users found with admin_verified = true');
      console.log('🔄 Setting up admin users...');
      
      // Set admin privileges for existing admin accounts
      const adminEmails = ['admin@nihonaustralia.com', 'moderator@nihonaustralia.com', 'support@nihonaustralia.com'];
      
      for (const email of adminEmails) {
        // Get user ID from auth
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers.users?.find(u => u.email === email);
        
        if (authUser) {
          const { error: updateError } = await supabase
            .from('mypage_profiles')
            .update({
              admin_verified: true,
              verified_by: authUser.id,
              verified_at: new Date().toISOString(),
              verification_notes: 'Initial admin setup'
            })
            .eq('id', authUser.id);

          if (updateError) {
            console.log(`❌ Failed to update ${email}:`, updateError.message);
          } else {
            console.log(`✅ Updated admin privileges for ${email}`);
          }
        } else {
          console.log(`⚠️  User ${email} not found in auth.users`);
        }
      }
    } else {
      console.log(`✅ Found ${adminUsers.length} admin users with privileges`);
      adminUsers.forEach(user => {
        console.log(`   • ${user.full_name || 'Unknown'} (${user.id})`);
      });
    }

    console.log('');
    console.log('🎉 Manual setup completed!');
    console.log('');
    console.log('🔑 Admin Login Credentials:');
    console.log('   Email: admin@nihonaustralia.com');
    console.log('   Password: NihonAustralia2024!Admin');
    console.log('');
    console.log('🚀 Start the application:');
    console.log('   npm run dev');
    console.log('   http://localhost:3002/auth/signin');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your .env.local file');
    console.log('   2. Verify SUPABASE_SERVICE_ROLE_KEY permissions');
    console.log('   3. Ensure database is accessible');
  }
}

// Run the setup
setupManual();