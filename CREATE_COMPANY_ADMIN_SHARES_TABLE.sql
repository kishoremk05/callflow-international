-- Create company_admin_shares table to track individual credit shares from company admins to teammates
CREATE TABLE IF NOT EXISTS company_admin_shares (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    company_admin_id UUID NOT NULL REFERENCES company_admins (id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    shared_amount DECIMAL(10, 2) NOT NULL CHECK (shared_amount > 0),
    shared_by UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    shared_at TIMESTAMPTZ DEFAULT NOW (),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW ()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_company_admin_shares_company_admin ON company_admin_shares (company_admin_id);

CREATE INDEX IF NOT EXISTS idx_company_admin_shares_recipient ON company_admin_shares (recipient_user_id);

CREATE INDEX IF NOT EXISTS idx_company_admin_shares_shared_at ON company_admin_shares (shared_at DESC);

-- Enable Row Level Security
ALTER TABLE company_admin_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Company admins can view their own shares
CREATE POLICY "Company admins can view their shares" ON company_admin_shares FOR
SELECT USING (
        company_admin_id IN (
            SELECT id
            FROM company_admins
            WHERE
                user_id = auth.uid ()
        )
    );

-- Policy: Company admins can insert their own shares
CREATE POLICY "Company admins can insert shares" ON company_admin_shares FOR INSERT
WITH
    CHECK (
        shared_by = auth.uid ()
        AND company_admin_id IN (
            SELECT id
            FROM company_admins
            WHERE
                user_id = auth.uid ()
        )
    );

COMMENT ON TABLE company_admin_shares IS 'Tracks individual credit shares from company admins to their teammates';

COMMENT ON COLUMN company_admin_shares.company_admin_id IS 'ID of the company admin who shared the credit';

COMMENT ON COLUMN company_admin_shares.recipient_user_id IS 'ID of the teammate who received the credit';

COMMENT ON COLUMN company_admin_shares.shared_amount IS 'Amount of credit shared';

COMMENT ON COLUMN company_admin_shares.shared_by IS 'ID of the user who initiated the share (should match company admin user_id)';

COMMENT ON COLUMN company_admin_shares.shared_at IS 'Timestamp when the credit was shared';