-- Migration: Add admin verification fields to mypage_profiles
-- Created: 2025-07-02
-- Description: Adds admin authentication and verification columns to support admin user management

-- Add admin verification fields to mypage_profiles table
ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create indexes for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_mypage_profiles_admin_verified 
ON mypage_profiles(admin_verified) WHERE admin_verified = true;

CREATE INDEX IF NOT EXISTS idx_mypage_profiles_verified_by 
ON mypage_profiles(verified_by);

-- Add comments for documentation
COMMENT ON COLUMN mypage_profiles.admin_verified IS 'Whether the user has admin privileges';
COMMENT ON COLUMN mypage_profiles.verified_by IS 'UUID of the admin who verified this user';
COMMENT ON COLUMN mypage_profiles.verified_at IS 'Timestamp when the user was verified';
COMMENT ON COLUMN mypage_profiles.verification_notes IS 'Notes about the verification process';

-- Create a view for easy admin user queries
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.gender,
  p.au_state,
  p.bio,
  p.admin_verified,
  p.verified_by,
  p.verified_at,
  p.verification_notes,
  p.created_at,
  p.updated_at,
  u.email,
  u.last_sign_in_at,
  u.email_confirmed_at
FROM mypage_profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.admin_verified = true;

-- Grant necessary permissions for the admin view
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT ON admin_users TO service_role;