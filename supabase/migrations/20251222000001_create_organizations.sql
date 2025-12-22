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
    responded_at TIMESTAMPTZ,
    UNIQUE (
        organization_id,
        invited_email,
        status
    )
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they own or are members of" ON public.organizations FOR
SELECT USING (
        auth.uid () = owner_id
        OR EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE
                organization_id = organizations.id
                AND user_id = auth.uid ()
        )
    );

CREATE POLICY "Users can create their own organizations" ON public.organizations FOR INSERT
WITH
    CHECK (auth.uid () = owner_id);

CREATE POLICY "Owners can update their organizations" ON public.organizations FOR
UPDATE USING (auth.uid () = owner_id);

CREATE POLICY "Owners can delete their organizations" ON public.organizations FOR DELETE USING (auth.uid () = owner_id);

-- RLS Policies for organization_members
CREATE POLICY "Members can view their organization memberships" ON public.organization_members FOR
SELECT USING (
        auth.uid () = user_id
        OR EXISTS (
            SELECT 1
            FROM public.organizations
            WHERE
                id = organization_members.organization_id
                AND owner_id = auth.uid ()
        )
    );

CREATE POLICY "Organization owners can add members" ON public.organization_members FOR INSERT
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

CREATE POLICY "Members can delete their own membership" ON public.organization_members FOR DELETE USING (
    auth.uid () = user_id
    OR EXISTS (
        SELECT 1
        FROM public.organizations
        WHERE
            id = organization_members.organization_id
            AND owner_id = auth.uid ()
    )
);

-- RLS Policies for organization_invites
CREATE POLICY "Users can view invites sent to their email" ON public.organization_invites FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.email = invited_email
        )
        OR EXISTS (
            SELECT 1
            FROM public.organizations
            WHERE
                id = organization_invites.organization_id
                AND owner_id = auth.uid ()
        )
    );

CREATE POLICY "Organization owners can create invites" ON public.organization_invites FOR INSERT
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

CREATE POLICY "Invited users and owners can update invites" ON public.organization_invites FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.email = invited_email
    )
    OR EXISTS (
        SELECT 1
        FROM public.organizations
        WHERE
            id = organization_invites.organization_id
            AND owner_id = auth.uid ()
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations (owner_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_org ON public.organization_members (organization_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members (user_id);

CREATE INDEX IF NOT EXISTS idx_organization_invites_email ON public.organization_invites (invited_email);

CREATE INDEX IF NOT EXISTS idx_organization_invites_status ON public.organization_invites (status);