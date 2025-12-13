-- Create conference_rooms table
CREATE TABLE IF NOT EXISTS conference_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    enterprise_id UUID REFERENCES enterprise_accounts (id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    conference_sid TEXT, -- Twilio Conference SID
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    started_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now (),
        ended_at TIMESTAMP
    WITH
        TIME ZONE,
        is_internal BOOLEAN DEFAULT true, -- true for internal team, false for external
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now (),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now ()
);

-- Create conference_participants table
CREATE TABLE IF NOT EXISTS conference_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    conference_id UUID REFERENCES conference_rooms (id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL, -- For internal team members
    phone_number TEXT, -- For external participants
    participant_name TEXT,
    country_code TEXT,
    call_sid TEXT, -- Twilio Call SID
    status TEXT DEFAULT 'invited' CHECK (
        status IN (
            'invited',
            'joined',
            'left',
            'failed'
        )
    ),
    joined_at TIMESTAMP
    WITH
        TIME ZONE,
        left_at TIMESTAMP
    WITH
        TIME ZONE,
        duration_seconds INTEGER DEFAULT 0,
        is_muted BOOLEAN DEFAULT false,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now (),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT now ()
);

-- Create indexes for better performance
CREATE INDEX idx_conference_rooms_enterprise ON conference_rooms (enterprise_id);

CREATE INDEX idx_conference_rooms_created_by ON conference_rooms (created_by);

CREATE INDEX idx_conference_rooms_status ON conference_rooms (status);

CREATE INDEX idx_conference_participants_conference ON conference_participants (conference_id);

CREATE INDEX idx_conference_participants_user ON conference_participants (user_id);

CREATE INDEX idx_conference_participants_status ON conference_participants (status);

-- Enable Row Level Security
ALTER TABLE conference_rooms ENABLE ROW LEVEL SECURITY;

ALTER TABLE conference_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conference_rooms
-- Users can view conferences they created or are part of their enterprise
CREATE POLICY "Users can view their own conference rooms" ON conference_rooms FOR
SELECT USING (
        auth.uid () = created_by
        OR enterprise_id IN (
            SELECT enterprise_id
            FROM enterprise_members
            WHERE
                user_id = auth.uid ()
        )
    );

-- Users can create conference rooms if they're in an enterprise
CREATE POLICY "Users can create conference rooms" ON conference_rooms FOR INSERT
WITH
    CHECK (
        auth.uid () = created_by
        AND (
            enterprise_id IN (
                SELECT enterprise_id
                FROM enterprise_members
                WHERE
                    user_id = auth.uid ()
            )
            OR enterprise_id IS NULL -- Allow individual users to create external conferences
        )
    );

-- Users can update their own conference rooms
CREATE POLICY "Users can update their conference rooms" ON conference_rooms FOR
UPDATE USING (auth.uid () = created_by);

-- Users can delete their own conference rooms
CREATE POLICY "Users can delete their conference rooms" ON conference_rooms FOR DELETE USING (auth.uid () = created_by);

-- RLS Policies for conference_participants
-- Users can view participants in conferences they have access to
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
    );

-- Users can add participants to conferences they created
CREATE POLICY "Users can add conference participants" ON conference_participants FOR INSERT
WITH
    CHECK (
        conference_id IN (
            SELECT id
            FROM conference_rooms
            WHERE
                created_by = auth.uid ()
        )
    );

-- Users can update participants in their conferences
CREATE POLICY "Users can update conference participants" ON conference_participants FOR
UPDATE USING (
    conference_id IN (
        SELECT id
        FROM conference_rooms
        WHERE
            created_by = auth.uid ()
    )
);

-- Users can delete participants from their conferences
CREATE POLICY "Users can delete conference participants" ON conference_participants FOR DELETE USING (
    conference_id IN (
        SELECT id
        FROM conference_rooms
        WHERE
            created_by = auth.uid ()
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conference_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_conference_rooms_updated_at
  BEFORE UPDATE ON conference_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_conference_updated_at();

CREATE TRIGGER update_conference_participants_updated_at
  BEFORE UPDATE ON conference_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_conference_updated_at();