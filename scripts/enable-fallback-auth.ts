#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

const adminAuthPath = path.join(__dirname, '..', 'src', 'lib', 'admin-auth.ts');

console.log('🔓 Enabling Fallback Authentication Mode...');
console.log('📅 Started at:', new Date().toISOString());
console.log('');

try {
  // Read the current admin-auth.ts file
  const content = fs.readFileSync(adminAuthPath, 'utf8');

  // Enable fallback mode by forcing email-based authentication
  const updatedContent = content.replace(
    /if \(error\) \{[\s\S]*?\}/m,
    `if (error) {
      // Force fallback mode: check if user is in admin list
      console.log('⚠️  admin_verified field not found, using fallback authentication');
      
      // Create admin client to get user email
      const adminSupabase = supabase;
      try {
        const { data: authData, error: authError } = await adminSupabase.auth.admin.getUserById(userId);
        if (authError || !authData.user?.email) return false;
        
        // Check if email is in our admin list
        const adminEmails = ['admin@nihonaustralia.com', 'moderator@nihonaustralia.com', 'support@nihonaustralia.com'];
        return adminEmails.includes(authData.user.email);
      } catch {
        return false;
      }
    }`
  );

  // Write the updated content
  fs.writeFileSync(adminAuthPath, updatedContent);

  console.log('✅ Fallback authentication enabled successfully!');
  console.log('');
  console.log('🔑 Admin emails that will have access:');
  console.log('   • admin@nihonaustralia.com');
  console.log('   • moderator@nihonaustralia.com');
  console.log('   • support@nihonaustralia.com');
  console.log('');
  console.log('🚀 Now you can test the admin login:');
  console.log('   npm run dev');
  console.log('   http://localhost:3002/auth/signin');
  console.log('');
  console.log('📝 Note: This is a temporary fallback. For production, please:');
  console.log('   1. Run the SQL in Supabase Dashboard (see SETUP_ADMIN.md)');
  console.log('   2. Run: npm run setup:manual');

} catch (error) {
  console.error('❌ Failed to enable fallback authentication:', error);
  process.exit(1);
}