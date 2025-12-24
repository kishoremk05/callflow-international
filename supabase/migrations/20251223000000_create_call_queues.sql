-- Call Queue Tables for Company Users

-- Call Queue Sessions
CREATE TABLE IF NOT EXISTS public.call_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Call Queue',
    total_contacts INTEGER DEFAULT 0,
    completed_contacts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now () + interval '1 day'),
    status TEXT DEFAULT 'active' CHECK (
        status IN (
            'active',
            'completed',
            'cancelled'
        )
    )
);

-- Call Queue Contacts
CREATE TABLE IF NOT EXISTS public.call_queue_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    queue_id UUID NOT NULL REFERENCES public.call_queues (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'calling',
            'answered',
            'skipped',
            'failed'
        )
    ),
    called_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

-- Enable RLS
ALTER TABLE public.call_queues ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.call_queue_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_queues
DROP POLICY IF EXISTS "Users can view their own queues" ON public.call_queues;

CREATE POLICY "Users can view their own queues" ON public.call_queues FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can create queues" ON public.call_queues;

CREATE POLICY "Users can create queues" ON public.call_queues FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can update their queues" ON public.call_queues;

CREATE POLICY "Users can update their queues" ON public.call_queues FOR
UPDATE USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can delete their queues" ON public.call_queues;

CREATE POLICY "Users can delete their queues" ON public.call_queues FOR DELETE USING (auth.uid () = user_id);

-- RLS Policies for call_queue_contacts
DROP POLICY IF EXISTS "Users can view their queue contacts" ON public.call_queue_contacts;

CREATE POLICY "Users can view their queue contacts" ON public.call_queue_contacts FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.call_queues
            WHERE
                id = queue_id
                AND user_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Users can create queue contacts" ON public.call_queue_contacts;

CREATE POLICY "Users can create queue contacts" ON public.call_queue_contacts FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.call_queues
            WHERE
                id = queue_id
                AND user_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Users can update queue contacts" ON public.call_queue_contacts;

CREATE POLICY "Users can update queue contacts" ON public.call_queue_contacts FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.call_queues
        WHERE
            id = queue_id
            AND user_id = auth.uid ()
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_call_queues_user ON public.call_queues (user_id);

CREATE INDEX IF NOT EXISTS idx_call_queues_expires ON public.call_queues (expires_at);

CREATE INDEX IF NOT EXISTS idx_call_queue_contacts_queue ON public.call_queue_contacts (queue_id);

CREATE INDEX IF NOT EXISTS idx_call_queue_contacts_status ON public.call_queue_contacts (status);

-- Function to auto-delete expired queues (runs daily)
CREATE OR REPLACE FUNCTION delete_expired_call_queues()
RETURNS void AS $$
BEGIN
  DELETE FROM public.call_queues
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Note: You can set up a cron job or scheduled task to run this function daily
-- For Supabase, you can use pg_cron extension (if available)