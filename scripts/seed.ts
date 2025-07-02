#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';
import { seedAdminUsers } from './seeds/seedAdminUsers';
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

async function runSeeds() {
  console.log('🌱 Starting NihonAustralia Admin Database Seeding...');
  console.log('📅 Started at:', new Date().toISOString());
  console.log('');

  const startTime = Date.now();

  try {
    // Test database connection
    const { data, error } = await supabase.from('mypage_profiles').select('count').limit(1);
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    console.log('✅ Database connection successful');
    console.log('');

    // Run seeders in order
    await seedAdminUsers(supabase);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('');
    console.log('🎉 All seeding completed successfully!');
    console.log(`⏱️  Total duration: ${duration.toFixed(2)} seconds`);
    console.log('📅 Completed at:', new Date().toISOString());

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the seeder
runSeeds();