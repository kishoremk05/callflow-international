-- RUN THIS IN SUPABASE SQL EDITOR
-- This will create the organization tables

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    is_active BOOLEAN DEFAULT true
);

-- Create organization members table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (
        role IN ('owner', 'admin', 'member')
    ),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    UNIQUE (organization_id, user_id)
);

-- Create organization invites table
CREATE TABLE IF NOT EXISTS public.organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'accepted',
            'rejected',
            'cancelled'
        )
    ),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    responded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

CREATE POLICY "Users can view their organizations" ON public.organizations FOR
SELECT USING (auth.uid () = owner_id);

DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

CREATE POLICY "Users can create organizations" ON public.organizations FOR INSERT
WITH
    CHECK (auth.uid () = owner_id);

DROP POLICY IF EXISTS "Owners can update organizations" ON public.organizations;

CREATE POLICY "Owners can update organizations" ON public.organizations FOR
UPDATE USING (auth.uid () = owner_id);

DROP POLICY IF EXISTS "Owners can delete organizations" ON public.organizations;

CREATE POLICY "Owners can delete organizations" ON public.organizations FOR DELETE USING (auth.uid () = owner_id);

-- RLS Policies for organization_members
DROP POLICY IF EXISTS "Members can view memberships" ON public.organization_members;

CREATE POLICY "Members can view memberships" ON public.organization_members FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Owners can add members" ON public.organization_members;

CREATE POLICY "Owners can add members" ON public.organization_members FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.organizations
            WHERE
                id = organization_id
                AND owner_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Members can leave" ON public.organization_members;

CREATE POLICY "Members can leave" ON public.organization_members FOR DELETE USING (auth.uid () = user_id);

-- RLS Policies for organization_invites
DROP POLICY IF EXISTS "Users can view their invites" ON public.organization_invites;

CREATE POLICY "Users can view their invites" ON public.organization_invites FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.email = invited_email
        )
    );

DROP POLICY IF EXISTS "Owners can create invites" ON public.organization_invites;

CREATE POLICY "Owners can create invites" ON public.organization_invites FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.organizations
            WHERE
                id = organization_id
                AND owner_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Users can update their invites" ON public.organization_invites;

CREATE POLICY "Users can update their invites" ON public.organization_invites FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.email = invited_email
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations (owner_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_org ON public.organization_members (organization_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members (user_id);

CREATE INDEX IF NOT EXISTS idx_organization_invites_email ON public.organization_invites (invited_email);

CREATE INDEX IF NOT EXISTS idx_organization_invites_status ON public.organization_invites (status);