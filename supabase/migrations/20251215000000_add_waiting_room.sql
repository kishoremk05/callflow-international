-- Add waiting room functionality to internal calls
-- Update status field to support waiting room states
ALTER TABLE internal_call_participants
DROP CONSTRAINT IF EXISTS internal_call_participants_status_check;

-- Modify status to include new waiting room states
COMMENT ON COLUMN internal_call_participants.status IS 'Status can be: waiting, approved, joined, rejected, left';

-- Make user_id nullable to support non-enterprise users
ALTER TABLE internal_call_participants ALTER COLUMN user_id
DROP NOT NULL;

-- Add temporary_user_id for non-enterprise users
ALTER TABLE internal_call_participants
ADD COLUMN IF NOT EXISTS temporary_user_id VARCHAR(255);

-- Add approved_by to track who approved the participant
ALTER TABLE internal_call_participants
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users (id);

-- Add approved_at timestamp
ALTER TABLE internal_call_participants
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
WITH
    TIME ZONE;

-- Add constraint: either user_id or temporary_user_id must be present
ALTER TABLE internal_call_participants
ADD CONSTRAINT user_identification_check CHECK (
    user_id IS NOT NULL
    OR temporary_user_id IS NOT NULL
);

-- Update RLS policy to allow non-enterprise users to insert themselves with waiting status
DROP POLICY IF EXISTS "Users can join internal calls" ON internal_call_participants;

CREATE POLICY "Users can join internal calls" ON internal_call_participants FOR INSERT
WITH
    CHECK (
        user_id = auth.uid ()
        OR temporary_user_id IS NOT NULL
    );

-- Policy to allow hosts to see waiting participants
CREATE POLICY "Hosts can view all participants in their calls" ON internal_call_participants FOR
SELECT USING (
        call_id IN (
            SELECT id
            FROM internal_calls
            WHERE
                created_by = auth.uid ()
        )
        OR user_id = auth.uid ()
    );

-- Policy to allow hosts to update participant status (approve/reject)
CREATE POLICY "Hosts can approve or reject participants" ON internal_call_participants FOR
UPDATE USING (
    call_id IN (
        SELECT id
        FROM internal_calls
        WHERE
            created_by = auth.uid ()
    )
)
WITH
    CHECK (
        call_id IN (
            SELECT id
            FROM internal_calls
            WHERE
                created_by = auth.uid ()
        )
    );

-- Create index for faster waiting room queries
CREATE INDEX IF NOT EXISTS idx_participants_status ON internal_call_participants (status)
WHERE
    status = 'waiting';

-- Create index for temporary users
CREATE INDEX IF NOT EXISTS idx_participants_temp_user ON internal_call_participants (temporary_user_id)
WHERE
    temporary_user_id IS NOT NULL;