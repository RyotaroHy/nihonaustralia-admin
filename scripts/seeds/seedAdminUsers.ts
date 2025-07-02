import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../src/types/supabase';
import { adminUsers, AdminUser } from './data/adminUsers';

export async function seedAdminUsers(supabase: SupabaseClient<Database>) {
  console.log('🔐 Starting admin users seeding...');

  let successCount = 0;
  let existingCount = 0;

  for (const adminUser of adminUsers) {
    try {
      console.log(`📧 Processing admin user: ${adminUser.email}`);

      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });

      const existingUser = existingUsers?.users?.find(u => u.email === adminUser.email);

      let userId: string;

      if (existingUser) {
        console.log(`✅ Admin user ${adminUser.email} already exists`);
        userId = existingUser.id;
        existingCount++;
      } else {
        // Create new admin user in auth.users
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: adminUser.email,
          password: adminUser.password,
          email_confirm: true, // Auto-confirm email
        });

        if (createError) {
          console.error(`❌ Failed to create admin user ${adminUser.email}:`, createError.message);
          continue;
        }

        if (!newUser.user) {
          console.error(`❌ No user data returned for ${adminUser.email}`);
          continue;
        }

        userId = newUser.user.id;
        console.log(`✅ Created admin user: ${adminUser.email}`);
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('mypage_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log(`✅ Profile already exists for ${adminUser.email}`);
        
        // Update admin verification status if needed
        const { error: updateError } = await supabase
          .from('mypage_profiles')
          .update({
            admin_verified: adminUser.admin_verified,
            verified_by: userId, // Self-verified by admin
            verified_at: new Date().toISOString(),
            verification_notes: adminUser.verification_notes,
          })
          .eq('id', userId);

        if (updateError) {
          console.error(`❌ Failed to update profile for ${adminUser.email}:`, updateError.message);
        } else {
          console.log(`✅ Updated admin verification for ${adminUser.email}`);
        }
      } else {
        // Create profile for the admin user
        // Try with admin fields first, fall back to basic profile if needed
        let profileData: any = {
          id: userId,
          full_name: adminUser.full_name,
          phone: adminUser.phone,
          gender: adminUser.gender,
          au_state: adminUser.au_state,
          bio: adminUser.bio,
        };

        // Try to add admin fields if they exist in the schema
        try {
          profileData.admin_verified = adminUser.admin_verified;
          profileData.verified_by = userId;
          profileData.verified_at = new Date().toISOString();
          profileData.verification_notes = adminUser.verification_notes;
        } catch {
          // Admin fields not available, will create basic profile
          console.log(`⚠️  Admin fields not available for ${adminUser.email}, creating basic profile`);
        }

        const { error: profileError } = await supabase
          .from('mypage_profiles')
          .insert(profileData);

        if (profileError) {
          // If admin fields caused the error, try again with basic profile
          if (profileError.message.includes('admin_verified') || profileError.message.includes('verified_by')) {
            console.log(`⚠️  Admin fields not supported, creating basic profile for ${adminUser.email}`);
            
            const basicProfile = {
              id: userId,
              full_name: adminUser.full_name,
              phone: adminUser.phone,
              gender: adminUser.gender,
              au_state: adminUser.au_state,
              bio: adminUser.bio,
            };

            const { error: basicError } = await supabase
              .from('mypage_profiles')
              .insert(basicProfile);

            if (basicError) {
              console.error(`❌ Failed to create basic profile for ${adminUser.email}:`, basicError.message);
              continue;
            }

            console.log(`✅ Created basic profile for: ${adminUser.email} (admin fields will be added later)`);
          } else {
            console.error(`❌ Failed to create profile for ${adminUser.email}:`, profileError.message);
            continue;
          }
        } else {
          console.log(`✅ Created admin profile for: ${adminUser.email}`);
        }
      }

      successCount++;

    } catch (error) {
      console.error(`❌ Unexpected error processing ${adminUser.email}:`, error);
    }
  }

  console.log(`\n🔐 Admin users seeding completed!`);
  console.log(`   ✅ Successfully processed: ${successCount} users`);
  console.log(`   📋 Already existed: ${existingCount} users`);
  console.log(`   📊 Total admin users: ${adminUsers.length}`);

  // Log admin credentials for development
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔑 Admin Login Credentials (Development Only):');
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} / ${admin.password} (${admin.full_name})`);
    });
    console.log('   ⚠️  Please change these passwords in production!');
  }
}

export async function isAdminUser(supabase: SupabaseClient<Database>, userId: string): Promise<boolean> {
  try {
    // First try with admin_verified field
    const { data, error } = await supabase
      .from('mypage_profiles')
      .select('admin_verified')
      .eq('id', userId)
      .single();

    if (error) {
      // If admin_verified field doesn't exist, check if user is in admin list
      if (error.message.includes('admin_verified')) {
        console.log(`⚠️  admin_verified field not found, checking against admin user list`);
        
        // Get user email from auth
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError || !authData.user?.email) return false;
        
        // Check if email is in our admin list
        const adminEmails = ['admin@nihonaustralia.com', 'moderator@nihonaustralia.com', 'support@nihonaustralia.com'];
        return adminEmails.includes(authData.user.email);
      }
      return false;
    }

    if (!data) {
      return false;
    }

    return data.admin_verified === true;
  } catch {
    return false;
  }
}

export async function getAdminUser(supabase: SupabaseClient<Database>, userId: string) {
  try {
    const { data, error } = await supabase
      .from('mypage_profiles')
      .select('*')
      .eq('id', userId)
      .eq('admin_verified', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}