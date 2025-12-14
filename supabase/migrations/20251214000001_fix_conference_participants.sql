-- Fix conference_participants to allow NULL user_id for contacts
-- This is needed when adding contacts (who don't have auth.users entries) to conferences

-- Drop the old foreign key constraint if it exists with NOT NULL
-- and recreate it to allow NULL values

-- First, check if there's an issue with the constraint
-- The user_id should already be nullable, but let's ensure the foreign key allows it

-- Alter the table to explicitly allow NULL (should already be the case)
ALTER TABLE conference_participants ALTER COLUMN user_id
DROP NOT NULL;

-- Add a check constraint to ensure either user_id OR phone_number is present
-- (Can't have both null)
ALTER TABLE conference_participants
ADD CONSTRAINT participant_identifier_check CHECK (
    (
        user_id IS NOT NULL
        AND phone_number IS NULL
    )
    OR (
        user_id IS NULL
        AND phone_number IS NOT NULL
    )
);

-- Update RLS policies to handle NULL user_id for contacts
DROP POLICY IF EXISTS "Users can view conference participants" ON conference_participants;

CREATE POLICY "Users can view conference participants" ON conference_participants FOR
SELECT USING (
        conference_id IN (
            SELECT id
            FROM conference_rooms
            WHERE
                created_by = auth.uid ()
                OR enterprise_id IN (
                    SELECT enterprise_id
                    FROM enterprise_members
                    WHERE
                        user_id = auth.uid ()
                )
        )
        OR user_id = auth.uid ()
    );