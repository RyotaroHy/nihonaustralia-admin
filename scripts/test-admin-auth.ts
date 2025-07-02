#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';
import { isAdminUser } from '../src/lib/admin-auth';
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

async function testAdminAuth() {
  console.log('🧪 Testing Admin Authentication...');
  console.log('📅 Started at:', new Date().toISOString());
  console.log('');

  try {
    // Test database connection
    console.log('🔗 Testing database connection...');
    const { data, error } = await supabase.from('mypage_profiles').select('count').limit(1);
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    console.log('✅ Database connection successful');

    // Test admin user lookup
    console.log('');
    console.log('👤 Looking up admin user...');
    
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const adminUser = authUsers.users?.find(u => u.email === 'admin@nihonaustralia.com');
    
    if (!adminUser) {
      console.log('❌ Admin user not found in auth.users');
      console.log('📋 Available users:');
      authUsers.users?.forEach(user => {
        console.log(`   • ${user.email} (${user.id})`);
      });
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`);

    // Test admin privilege check
    console.log('');
    console.log('🔐 Testing admin privilege check...');
    
    const hasAdminPrivileges = await isAdminUser(supabase, adminUser.id);
    console.log(`   Result: ${hasAdminPrivileges ? '✅ HAS ADMIN PRIVILEGES' : '❌ NO ADMIN PRIVILEGES'}`);

    if (!hasAdminPrivileges) {
      console.log('');
      console.log('🔍 Debugging admin privilege check...');
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('mypage_profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();

      if (profileError) {
        console.log(`❌ Profile lookup error: ${profileError.message}`);
      } else if (!profile) {
        console.log('❌ No profile found for admin user');
      } else {
        console.log('✅ Profile found:');
        console.log(`   • Name: ${profile.full_name}`);
        console.log(`   • Phone: ${profile.phone}`);
        if ('admin_verified' in profile) {
          console.log(`   • Admin Verified: ${profile.admin_verified}`);
        } else {
          console.log('   • Admin Verified: Field not found (using fallback)');
        }
      }
    }

    // Test all admin emails
    console.log('');
    console.log('📧 Testing all admin emails...');
    const adminEmails = ['admin@nihonaustralia.com', 'moderator@nihonaustralia.com', 'support@nihonaustralia.com'];
    
    for (const email of adminEmails) {
      const user = authUsers.users?.find(u => u.email === email);
      if (user) {
        const hasPrivileges = await isAdminUser(supabase, user.id);
        console.log(`   • ${email}: ${hasPrivileges ? '✅' : '❌'}`);
      } else {
        console.log(`   • ${email}: ❌ User not found`);
      }
    }

    console.log('');
    console.log('🎯 Summary:');
    if (hasAdminPrivileges) {
      console.log('✅ Admin authentication is working correctly!');
      console.log('   You should be able to log in with admin@nihonaustralia.com');
    } else {
      console.log('❌ Admin authentication is not working');
      console.log('🔧 Recommended fixes:');
      console.log('   1. Run SQL in Supabase Dashboard (see SETUP_ADMIN.md)');
      console.log('   2. Or run: npm run setup:manual');
      console.log('   3. Check SUPABASE_SERVICE_ROLE_KEY permissions');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAdminAuth();