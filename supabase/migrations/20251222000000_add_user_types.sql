-- Add user_type enum
CREATE TYPE public.user_type AS ENUM ('normal', 'company');

-- Add user_type column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type public.user_type NOT NULL DEFAULT 'normal';

-- Create index for user_type for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles (user_type);

-- Update existing users to be normal users by default
UPDATE public.profiles
SET
    user_type = 'normal'
WHERE
    user_type IS NULL;