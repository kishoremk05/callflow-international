-- Internal Calls Table
CREATE TABLE IF NOT EXISTS internal_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    room_id VARCHAR(255) UNIQUE NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    enterprise_id UUID REFERENCES enterprise_accounts (id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    call_type VARCHAR(50) NOT NULL DEFAULT 'one-to-one', -- 'one-to-one' or 'group'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'ended'
    started_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        ended_at TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW ()
);

-- Internal Call Participants Table
CREATE TABLE IF NOT EXISTS internal_call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    call_id UUID NOT NULL REFERENCES internal_calls (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    participant_name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW (),
        left_at TIMESTAMP
    WITH
        TIME ZONE,
        status VARCHAR(50) NOT NULL DEFAULT 'joined', -- 'invited', 'joined', 'left'
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW ()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internal_calls_enterprise ON internal_calls (enterprise_id);

CREATE INDEX IF NOT EXISTS idx_internal_calls_created_by ON internal_calls (created_by);

CREATE INDEX IF NOT EXISTS idx_internal_calls_status ON internal_calls (status);

CREATE INDEX IF NOT EXISTS idx_internal_calls_room_id ON internal_calls (room_id);

CREATE INDEX IF NOT EXISTS idx_internal_call_participants_call_id ON internal_call_participants (call_id);

CREATE INDEX IF NOT EXISTS idx_internal_call_participants_user_id ON internal_call_participants (user_id);

-- RLS Policies for internal_calls
ALTER TABLE internal_calls ENABLE ROW LEVEL SECURITY;

-- Users can view internal calls from their enterprise
CREATE POLICY "Users can view internal calls from their enterprise" ON internal_calls FOR
SELECT USING (
        enterprise_id IN (
            SELECT enterprise_id
            FROM enterprise_members
            WHERE
                user_id = auth.uid ()
        )
        OR created_by = auth.uid ()
    );

-- Users can create internal calls
CREATE POLICY "Users can create internal calls" ON internal_calls FOR INSERT
WITH
    CHECK (created_by = auth.uid ());

-- Users can update their own internal calls
CREATE POLICY "Users can update their own internal calls" ON internal_calls FOR
UPDATE USING (created_by = auth.uid ())
WITH
    CHECK (created_by = auth.uid ());

-- RLS Policies for internal_call_participants
ALTER TABLE internal_call_participants ENABLE ROW LEVEL SECURITY;

-- Users can view participants in calls they're part of or created
CREATE POLICY "Users can view participants in their calls" ON internal_call_participants FOR
SELECT USING (
        call_id IN (
            SELECT id
            FROM internal_calls
            WHERE
                enterprise_id IN (
                    SELECT enterprise_id
                    FROM enterprise_members
                    WHERE
                        user_id = auth.uid ()
                )
                OR created_by = auth.uid ()
        )
    );

-- Users can insert themselves as participants
CREATE POLICY "Users can join internal calls" ON internal_call_participants FOR INSERT
WITH
    CHECK (user_id = auth.uid ());

-- Users can update their own participation records
CREATE POLICY "Users can update their participation" ON internal_call_participants FOR
UPDATE USING (user_id = auth.uid ())
WITH
    CHECK (user_id = auth.uid ());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_internal_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_internal_calls_timestamp
    BEFORE UPDATE ON internal_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_internal_calls_updated_at();