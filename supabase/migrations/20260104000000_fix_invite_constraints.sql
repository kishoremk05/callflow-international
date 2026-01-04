-- Fix organization invites constraint to allow state-based invite system
-- Remove old constraint and add new one

-- First, clean up duplicate invites by keeping only the most recent one for each (organization_id, invited_email)
DELETE FROM public.organization_invites
WHERE
    id NOT IN (
        SELECT DISTINCT
            ON (
                organization_id,
                invited_email
            ) id
        FROM public.organization_invites
        ORDER BY
            organization_id,
            invited_email,
            invited_at DESC
    );

-- Drop existing unique constraint that includes status
ALTER TABLE public.organization_invites
DROP CONSTRAINT IF EXISTS organization_invites_organization_id_invited_email_status_key;

-- Add new unique constraint without status
ALTER TABLE public.organization_invites
ADD CONSTRAINT organization_invites_organization_id_invited_email_key UNIQUE (
    organization_id,
    invited_email
);

-- Add new status 'revoked' to check constraint
ALTER TABLE public.organization_invites
DROP CONSTRAINT IF EXISTS organization_invites_status_check;

ALTER TABLE public.organization_invites
ADD CONSTRAINT organization_invites_status_check CHECK (
    status IN (
        'pending',
        'accepted',
        'rejected',
        'cancelled',
        'revoked'
    )
);

-- Update any existing 'cancelled' invites to 'revoked' for consistency
UPDATE public.organization_invites
SET
    status = 'revoked'
WHERE
    status = 'cancelled';