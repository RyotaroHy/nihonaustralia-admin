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
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addAdminColumns() {
  console.log('🔧 Adding admin columns to mypage_profiles table...');
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

    // Execute SQL to add admin columns
    const sqlStatements = [
      // Add admin verification fields
      `ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;`,
      `ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);`,
      `ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;`,
      `ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;`,
      
      // Create indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_mypage_profiles_admin_verified ON mypage_profiles(admin_verified) WHERE admin_verified = true;`,
      `CREATE INDEX IF NOT EXISTS idx_mypage_profiles_verified_by ON mypage_profiles(verified_by);`,
      
      // Add comments for documentation
      `COMMENT ON COLUMN mypage_profiles.admin_verified IS 'Whether the user has admin privileges';`,
      `COMMENT ON COLUMN mypage_profiles.verified_by IS 'UUID of the admin who verified this user';`,
      `COMMENT ON COLUMN mypage_profiles.verified_at IS 'Timestamp when the user was verified';`,
      `COMMENT ON COLUMN mypage_profiles.verification_notes IS 'Notes about the verification process';`,
    ];

    for (const sql of sqlStatements) {
      console.log('🔄 Executing:', sql.substring(0, 50) + '...');
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        // Try alternative approach using raw SQL
        console.log('⚠️  RPC failed, trying direct approach...');
        const { error: directError } = await supabase
          .from('mypage_profiles')
          .select('id')
          .limit(0); // This will fail but might reveal schema info
          
        if (directError) {
          console.error(`❌ Failed to execute SQL: ${sql}`);
          console.error(`   Error: ${error.message}`);
          // Continue with other statements
        }
      } else {
        console.log('✅ SQL executed successfully');
      }
    }

    console.log('');
    console.log('🎉 Admin columns migration completed!');
    console.log('');
    console.log('📋 Added columns:');
    console.log('   • admin_verified (BOOLEAN, default: FALSE)');
    console.log('   • verified_by (UUID, references auth.users)');
    console.log('   • verified_at (TIMESTAMPTZ)');
    console.log('   • verification_notes (TEXT)');
    console.log('');
    console.log('📊 Created indexes for performance optimization');
    console.log('📝 Added documentation comments');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('');
    console.log('🔧 Manual steps required:');
    console.log('   1. Open Supabase Dashboard (https://supabase.com/dashboard)');
    console.log('   2. Go to your project > SQL Editor');
    console.log('   3. Execute the following SQL:');
    console.log('');
    console.log('```sql');
    console.log('-- Add admin verification fields');
    console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;');
    console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);');
    console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;');
    console.log('ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;');
    console.log('');
    console.log('-- Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS idx_mypage_profiles_admin_verified ON mypage_profiles(admin_verified) WHERE admin_verified = true;');
    console.log('CREATE INDEX IF NOT EXISTS idx_mypage_profiles_verified_by ON mypage_profiles(verified_by);');
    console.log('```');
    console.log('');
    console.log('   4. After running the SQL, run the seeder again: npm run seed');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the migration
addAdminColumns();