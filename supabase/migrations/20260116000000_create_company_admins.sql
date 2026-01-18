-- Create company admins table
CREATE TABLE IF NOT EXISTS public.company_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_email TEXT NOT NULL,
    company_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now (),
    updated_at TIMESTAMPTZ DEFAULT now ()
);

-- Add company_admin_id to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS company_admin_id UUID REFERENCES public.company_admins (id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_company_admin ON public.organizations (company_admin_id);

-- Create wallet shares table
CREATE TABLE IF NOT EXISTS public.wallet_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    company_admin_id UUID NOT NULL REFERENCES public.company_admins (id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    shared_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    shared_at TIMESTAMPTZ DEFAULT now (),
    shared_by UUID NOT NULL REFERENCES auth.users (id),
    notes TEXT,
    UNIQUE (
        company_admin_id,
        organization_id
    )
);

-- Add shared_balance to organizations for tracking
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS shared_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Update user_type enum to include company_admin
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                   JOIN pg_enum e ON t.oid = e.enumtypid  
                   WHERE t.typname = 'user_type' 
                   AND e.enumlabel = 'company_admin') THEN
        ALTER TYPE public.user_type ADD VALUE 'company_admin';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.wallet_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_admins
CREATE POLICY "Company admins can view their own data" ON public.company_admins FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create company admin profile" ON public.company_admins FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Company admins can update their own data" ON public.company_admins FOR
UPDATE USING (auth.uid () = user_id);

-- RLS Policies for wallet_shares
CREATE POLICY "Company admins can view their wallet shares" ON public.wallet_shares FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.company_admins
            WHERE
                id = wallet_shares.company_admin_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Company admins can create wallet shares" ON public.wallet_shares FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.company_admins
            WHERE
                id = company_admin_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Company admins can update their wallet shares" ON public.wallet_shares FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.company_admins
        WHERE
            id = wallet_shares.company_admin_id
            AND user_id = auth.uid ()
    )
);

CREATE POLICY "Company admins can delete their wallet shares" ON public.wallet_shares FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.company_admins
        WHERE
            id = wallet_shares.company_admin_id
            AND user_id = auth.uid ()
    )
);

-- Update organizations RLS to allow company admins to view their organizations
CREATE POLICY "Company admins can view their organizations" ON public.organizations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.company_admins
            WHERE
                id = organizations.company_admin_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Company admins can create organizations" ON public.organizations FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.company_admins
            WHERE
                id = company_admin_id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Company admins can update their organizations" ON public.organizations FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.company_admins
        WHERE
            id = organizations.company_admin_id
            AND user_id = auth.uid ()
    )
);

CREATE POLICY "Company admins can delete their organizations" ON public.organizations FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.company_admins
        WHERE
            id = organizations.company_admin_id
            AND user_id = auth.uid ()
    )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_company_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_admins_updated_at
    BEFORE UPDATE ON public.company_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_company_admins_updated_at();