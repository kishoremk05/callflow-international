-- Add support for joining existing companies as co-admin
-- This migration adds fields to track whether user wants to create new company or join existing one

-- Make company_name and company_email nullable (not needed for join_existing requests)
ALTER TABLE public.admin_access_requests ALTER COLUMN company_name
DROP NOT NULL,
ALTER COLUMN company_email
DROP NOT NULL;

-- Add company_id column to track which company they want to join (NULL = create new company)
ALTER TABLE public.admin_access_requests
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_admins (id) ON DELETE CASCADE;

-- Add request_type to make it explicit
ALTER TABLE public.admin_access_requests
ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'create_new' CHECK (
    request_type IN ('create_new', 'join_existing')
);

-- Create index for company_id lookups
CREATE INDEX IF NOT EXISTS idx_admin_requests_company_id ON public.admin_access_requests (company_id);

-- Add comments
COMMENT ON COLUMN public.admin_access_requests.company_id IS 'The company ID user wants to join (NULL for creating new company)';

COMMENT ON COLUMN public.admin_access_requests.request_type IS 'Type of request: create_new or join_existing';

COMMENT ON COLUMN public.admin_access_requests.company_name IS 'Company name (required for create_new, NULL for join_existing)';

COMMENT ON COLUMN public.admin_access_requests.company_email IS 'Company email (required for create_new, NULL for join_existing)';