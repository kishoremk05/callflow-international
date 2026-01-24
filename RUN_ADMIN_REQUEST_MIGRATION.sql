-- ============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Admin Access Request System - Database Setup
-- ============================================================================

-- Create admin_access_requests table
CREATE TABLE IF NOT EXISTS public.admin_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT NOT NULL,
    company_email TEXT NOT NULL,
    company_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'approved',
            'rejected'
        )
    ),
    requested_at TIMESTAMPTZ DEFAULT now (),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users (id),
    rejection_reason TEXT,
    UNIQUE (user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_requests_user_id ON public.admin_access_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON public.admin_access_requests (status);

-- Enable RLS
ALTER TABLE public.admin_access_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view own requests" ON public.admin_access_requests;

DROP POLICY IF EXISTS "Users can create own requests" ON public.admin_access_requests;

DROP POLICY IF EXISTS "Users can update own pending requests" ON public.admin_access_requests;

-- RLS Policies

-- Users can view their own requests
CREATE POLICY "Users can view own requests" ON public.admin_access_requests FOR
SELECT USING (auth.uid () = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own requests" ON public.admin_access_requests FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests" ON public.admin_access_requests FOR
UPDATE USING (
    auth.uid () = user_id
    AND status = 'pending'
)
WITH
    CHECK (
        auth.uid () = user_id
        AND status = 'pending'
    );

-- Grant permissions
GRANT
SELECT, INSERT,
UPDATE ON public.admin_access_requests TO authenticated;

GRANT ALL ON public.admin_access_requests TO service_role;

-- Add comment
COMMENT ON TABLE public.admin_access_requests IS 'Stores requests from company users who want to become company admins';

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Restart your backend server: cd backend && node server-single.js
-- 2. Test the flow as a company user
-- 3. Approve requests in Super Admin Dashboard
-- ============================================================================