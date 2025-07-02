-- Add admin-related fields to mypage_profiles table
-- This migration adds the necessary columns for admin user management

-- Add admin verification fields
ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE mypage_profiles 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create index for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_mypage_profiles_admin_verified 
ON mypage_profiles(admin_verified) WHERE admin_verified = true;

-- Create index for verified_by foreign key
CREATE INDEX IF NOT EXISTS idx_mypage_profiles_verified_by 
ON mypage_profiles(verified_by);

-- Add comments for documentation
COMMENT ON COLUMN mypage_profiles.admin_verified IS 'Whether the user has admin privileges';
COMMENT ON COLUMN mypage_profiles.verified_by IS 'UUID of the admin who verified this user';
COMMENT ON COLUMN mypage_profiles.verified_at IS 'Timestamp when the user was verified';
COMMENT ON COLUMN mypage_profiles.verification_notes IS 'Notes about the verification process';

-- Create a view for easy admin user queries (optional)
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.admin_verified,
  p.verified_by,
  p.verified_at,
  p.verification_notes,
  p.created_at,
  p.updated_at
FROM mypage_profiles p
WHERE p.admin_verified = true;