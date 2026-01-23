-- Run this SQL in Supabase SQL Editor to add country column
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor

-- Add country column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index for faster country queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles (country);

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE
    table_name = 'profiles'
    AND column_name = 'country';