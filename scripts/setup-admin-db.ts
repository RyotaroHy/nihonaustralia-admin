#!/usr/bin/env tsx

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

interface SetupOptions {
  environment: 'local' | 'remote';
  skipSeed?: boolean;
}

async function setupAdminDatabase(options: SetupOptions = { environment: 'remote' }) {
  console.log('🚀 Setting up Admin Database...');
  console.log(`📍 Environment: ${options.environment}`);
  console.log('📅 Started at:', new Date().toISOString());
  console.log('');

  try {
    // Check if Supabase CLI is available
    await execAsync('npx supabase --version');
    console.log('✅ Supabase CLI is available');

    if (options.environment === 'remote') {
      await setupRemoteDatabase();
    } else {
      await setupLocalDatabase();
    }

    if (!options.skipSeed) {
      await runAdminSeeder();
    }

    console.log('');
    console.log('🎉 Admin database setup completed successfully!');
    console.log('');
    logAdminCredentials();

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('');
    console.log('🔧 Manual steps required:');
    console.log('   1. Check your .env.local file configuration');
    console.log('   2. Ensure Supabase CLI is properly installed');
    console.log('   3. Verify project permissions and credentials');
    process.exit(1);
  }
}

async function setupRemoteDatabase() {
  console.log('🌐 Setting up remote database...');

  if (!SUPABASE_PROJECT_REF) {
    throw new Error('SUPABASE_PROJECT_REF not found in environment variables');
  }

  // Check if already linked
  const configPath = path.join(__dirname, '..', 'supabase', 'config.toml');
  if (!fs.existsSync(configPath)) {
    console.log('🔗 Linking to Supabase project...');
    await execAsync(`npx supabase link --project-ref ${SUPABASE_PROJECT_REF}`, {
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Successfully linked to Supabase project');
  } else {
    console.log('✅ Already linked to Supabase project');
  }

  // Push migrations to remote
  console.log('📤 Pushing migrations to remote database...');
  try {
    const { stdout, stderr } = await execAsync('npx supabase db push --linked', {
      cwd: path.join(__dirname, '..')
    });
    
    if (stderr && !stderr.includes('warning')) {
      console.warn('⚠️  Migration warnings:', stderr);
    }
    
    console.log('✅ Migrations pushed successfully');
    if (stdout) {
      console.log('📋 Migration output:', stdout);
    }
  } catch (error: any) {
    if (error.message.includes('no migrations found')) {
      console.log('ℹ️  No new migrations to apply');
    } else {
      throw error;
    }
  }
}

async function setupLocalDatabase() {
  console.log('🏠 Setting up local database...');

  // Start local Supabase
  console.log('🔄 Starting local Supabase...');
  await execAsync('npx supabase start', {
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Local Supabase started');

  // Apply migrations
  console.log('📤 Applying migrations to local database...');
  await execAsync('npx supabase db reset', {
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Local migrations applied');
}

async function runAdminSeeder() {
  console.log('🌱 Running admin user seeder...');
  
  // Wait a moment for database to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await execAsync('npm run seed', {
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Admin users seeded successfully');
}

function logAdminCredentials() {
  console.log('🔑 Admin Login Credentials:');
  console.log('');
  console.log('   🔐 System Administrator:');
  console.log('      Email: admin@nihonaustralia.com');
  console.log('      Password: NihonAustralia2024!Admin');
  console.log('');
  console.log('   👤 Content Moderator:');
  console.log('      Email: moderator@nihonaustralia.com');
  console.log('      Password: NihonAustralia2024!Mod');
  console.log('');
  console.log('   💬 Support Staff:');
  console.log('      Email: support@nihonaustralia.com');
  console.log('      Password: NihonAustralia2024!Support');
  console.log('');
  console.log('⚠️  IMPORTANT: Change these passwords in production!');
}

// CLI interface
const args = process.argv.slice(2);
const environment = args.includes('--local') ? 'local' : 'remote';
const skipSeed = args.includes('--skip-seed');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🛠️  Admin Database Setup Tool

Usage:
  npm run setup:admin [options]

Options:
  --local          Setup local database instead of remote
  --skip-seed      Skip running the admin user seeder
  --help, -h       Show this help message

Examples:
  npm run setup:admin                    # Setup remote database
  npm run setup:admin --local            # Setup local database
  npm run setup:admin --skip-seed        # Setup without seeding

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL              # Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY             # Service role key for admin operations
  `);
  process.exit(0);
}

// Run the setup
setupAdminDatabase({ environment, skipSeed });