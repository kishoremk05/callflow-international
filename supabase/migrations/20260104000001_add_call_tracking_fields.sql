-- Add additional fields for better call state tracking
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS call_sid TEXT;

ALTER TABLE public.call_logs
ADD COLUMN IF NOT EXISTS call_status TEXT;

ALTER TABLE public.call_logs
ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ;

ALTER TABLE public.call_logs
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now ();

-- Update existing rows to have proper call_sid field
UPDATE public.call_logs
SET
    call_sid = twilio_call_sid
WHERE
    call_sid IS NULL
    AND twilio_call_sid IS NOT NULL;