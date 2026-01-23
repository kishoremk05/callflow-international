-- Add country column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index for faster country queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles (country);