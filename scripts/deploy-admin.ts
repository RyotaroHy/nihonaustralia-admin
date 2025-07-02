#!/usr/bin/env tsx

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

async function deployToProduction() {
  console.log('🚀 Deploying Admin System to Production...');
  console.log('📅 Started at:', new Date().toISOString());
  console.log('');

  try {
    // Verify environment
    await verifyEnvironment();

    // Build and test locally
    await buildAndTest();

    // Deploy database changes
    await deployDatabase();

    // Deploy admin users
    await deployAdminUsers();

    console.log('');
    console.log('🎉 Production deployment completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Test admin login at your production URL');
    console.log('   2. Change default admin passwords');
    console.log('   3. Configure production environment variables');
    console.log('   4. Set up monitoring and backup procedures');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your .env.local configuration');
    console.log('   2. Verify Supabase project permissions');
    console.log('   3. Ensure database is accessible');
    console.log('   4. Check network connectivity');
    process.exit(1);
  }
}

async function verifyEnvironment() {
  console.log('🔍 Verifying environment...');

  // Check required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  // Check Supabase CLI
  await execAsync('npx supabase --version');

  // Check project reference
  if (!SUPABASE_PROJECT_REF) {
    throw new Error('Could not extract project reference from SUPABASE_URL');
  }

  console.log('✅ Environment verification passed');
  console.log(`   Project Ref: ${SUPABASE_PROJECT_REF}`);
}

async function buildAndTest() {
  console.log('🏗️  Building and testing...');

  // Run TypeScript checks
  console.log('🔍 Running TypeScript checks...');
  await execAsync('npm run typecheck', {
    cwd: path.join(__dirname, '..')
  });

  // Build the application
  console.log('📦 Building application...');
  await execAsync('npm run build', {
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Build and tests passed');
}

async function deployDatabase() {
  console.log('🗄️  Deploying database changes...');

  // Link to production project if not already linked
  try {
    await execAsync(`npx supabase link --project-ref ${SUPABASE_PROJECT_REF}`, {
      cwd: path.join(__dirname, '..')
    });
  } catch (error: any) {
    if (error.message.includes('already linked')) {
      console.log('✅ Already linked to production project');
    } else {
      throw error;
    }
  }

  // Generate migration diff
  console.log('📋 Generating migration diff...');
  try {
    const { stdout } = await execAsync('npx supabase db diff --linked', {
      cwd: path.join(__dirname, '..')
    });
    
    if (stdout.trim()) {
      console.log('📤 Found pending migrations:');
      console.log(stdout);
    } else {
      console.log('ℹ️  No pending migrations found');
    }
  } catch (error: any) {
    if (!error.message.includes('no changes found')) {
      throw error;
    }
  }

  // Push migrations to production
  console.log('📤 Pushing migrations to production...');
  await execAsync('npx supabase db push --linked', {
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Database deployment completed');
}

async function deployAdminUsers() {
  console.log('👥 Deploying admin users...');

  // Set NODE_ENV to production for the seeder
  const env = { ...process.env, NODE_ENV: 'production' };

  await execAsync('npm run seed', {
    cwd: path.join(__dirname, '..'),
    env
  });

  console.log('✅ Admin users deployed');
  console.log('');
  console.log('⚠️  SECURITY WARNING:');
  console.log('   Default passwords have been set for admin users.');
  console.log('   Please change them immediately after first login!');
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Admin System Production Deployment Tool

Usage:
  npm run deploy:admin [options]

Options:
  --help, -h       Show this help message

This script will:
  1. Verify environment and dependencies
  2. Build and test the application
  3. Deploy database migrations to production
  4. Create admin users in production database

Prerequisites:
  - Supabase CLI installed and configured
  - Production environment variables in .env.local
  - Appropriate permissions for production deployment

Security Notes:
  - Default admin passwords will be set
  - Change passwords immediately after deployment
  - Review and update environment variables for production
  `);
  process.exit(0);
}

// Run the deployment
deployToProduction();