-- Create call pricing table
CREATE TABLE IF NOT EXISTS call_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    iso_country_code TEXT NOT NULL,
    country_name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_per_minute DECIMAL(10, 6) NOT NULL,
    destination_prefixes TEXT [],
    phone_number_type TEXT, -- 'landline', 'mobile', or specific type
    currency TEXT DEFAULT 'USD',
    markup_percentage DECIMAL(5, 2) DEFAULT 15.00,
    last_updated TIMESTAMP DEFAULT NOW (),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW ()
);

-- Create indexes for fast lookup
CREATE INDEX idx_pricing_country ON call_pricing (iso_country_code);

CREATE INDEX idx_pricing_type ON call_pricing (phone_number_type);

CREATE INDEX idx_pricing_active ON call_pricing (is_active);

CREATE INDEX idx_pricing_prefixes ON call_pricing USING GIN (destination_prefixes);

-- Create wallet transactions table with reserve/settle support
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations (id),
    transaction_type TEXT NOT NULL, -- 'reserve', 'settle', 'refund', 'purchase', 'transfer'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    amount DECIMAL(10, 4) NOT NULL,
    currency TEXT DEFAULT 'USD',
    balance_before DECIMAL(10, 4),
    balance_after DECIMAL(10, 4),
    related_call_sid TEXT,
    related_transaction_id UUID REFERENCES wallet_transactions (id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW (),
    completed_at TIMESTAMP
);

-- Create indexes for wallet transactions
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions (user_id);

CREATE INDEX idx_wallet_transactions_org ON wallet_transactions (organization_id);

CREATE INDEX idx_wallet_transactions_call ON wallet_transactions (related_call_sid);

CREATE INDEX idx_wallet_transactions_status ON wallet_transactions (status);

CREATE INDEX idx_wallet_transactions_type ON wallet_transactions (transaction_type);

-- Create call cost tracking table
CREATE TABLE IF NOT EXISTS call_cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  destination_country_code TEXT,
  destination_prefix TEXT,
  phone_number_type TEXT,

-- Pricing info
pricing_id UUID REFERENCES call_pricing (id),
rate_per_minute DECIMAL(10, 6),
markup_percentage DECIMAL(5, 2),
final_rate_per_minute DECIMAL(10, 6),

-- Call details
call_duration INTEGER, -- in seconds
call_status TEXT,

-- Cost calculation
estimated_cost DECIMAL(10, 4), actual_cost DECIMAL(10, 4),

-- Transaction tracking
reserve_transaction_id UUID REFERENCES wallet_transactions (id),
settle_transaction_id UUID REFERENCES wallet_transactions (id),

-- Timestamps
call_started_at TIMESTAMP,
  call_ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for call cost records
CREATE INDEX idx_call_cost_sid ON call_cost_records (call_sid);

CREATE INDEX idx_call_cost_user ON call_cost_records (user_id);

CREATE INDEX idx_call_cost_org ON call_cost_records (organization_id);

CREATE INDEX idx_call_cost_created ON call_cost_records (created_at DESC);

-- Function to get pricing for a destination
CREATE OR REPLACE FUNCTION get_call_pricing(destination_number TEXT)
RETURNS TABLE (
  pricing_id UUID,
  rate_per_minute DECIMAL(10, 6),
  markup_percentage DECIMAL(5, 2),
  final_rate DECIMAL(10, 6),
  country_name TEXT,
  phone_type TEXT
) AS $$
DECLARE
  matched_pricing RECORD;
BEGIN
  -- Try to find exact prefix match
  SELECT * INTO matched_pricing
  FROM call_pricing
  WHERE is_active = TRUE
    AND destination_number LIKE ANY(
      SELECT prefix || '%'
      FROM unnest(destination_prefixes) AS prefix
    )
  ORDER BY array_length(destination_prefixes, 1) DESC
  LIMIT 1;
  
  -- If no match found, try country code match
  IF matched_pricing IS NULL THEN
    SELECT * INTO matched_pricing
    FROM call_pricing
    WHERE is_active = TRUE
      AND destination_number LIKE iso_country_code || '%'
      AND destination_prefixes IS NULL
    ORDER BY length(iso_country_code) DESC
    LIMIT 1;
  END IF;
  
  IF matched_pricing IS NOT NULL THEN
    RETURN QUERY SELECT
      matched_pricing.id,
      matched_pricing.price_per_minute,
      matched_pricing.markup_percentage,
      matched_pricing.price_per_minute * (1 + matched_pricing.markup_percentage / 100),
      matched_pricing.country_name,
      matched_pricing.phone_number_type;
  ELSE
    -- Return default fallback pricing
    RETURN QUERY SELECT
      NULL::UUID,
      0.50::DECIMAL(10, 6), -- fallback rate
      15.00::DECIMAL(5, 2), -- default markup
      0.575::DECIMAL(10, 6), -- fallback with markup
      'Unknown'::TEXT,
      'unknown'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to reserve funds for a call
CREATE OR REPLACE FUNCTION reserve_call_funds(
  p_user_id UUID,
  p_organization_id UUID,
  p_call_sid TEXT,
  p_estimated_cost DECIMAL(10, 4)
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance DECIMAL(10, 4);
  v_new_balance DECIMAL(10, 4);
BEGIN
  -- Get current wallet balance (wallets table only has user_id)
  SELECT COALESCE(balance, 0) INTO v_current_balance
  FROM wallets
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Check if sufficient balance
  IF v_current_balance < p_estimated_cost THEN
    RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', p_estimated_cost, v_current_balance;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance - p_estimated_cost;
  
  -- Create reserve transaction
  INSERT INTO wallet_transactions (
    user_id,
    organization_id,
    transaction_type,
    status,
    amount,
    balance_before,
    balance_after,
    related_call_sid,
    metadata,
    completed_at
  ) VALUES (
    p_user_id,
    p_organization_id,
    'reserve',
    'completed',
    -p_estimated_cost,
    v_current_balance,
    v_new_balance,
    p_call_sid,
    jsonb_build_object('estimated_cost', p_estimated_cost),
    NOW()
  ) RETURNING id INTO v_transaction_id;
  
  -- Update wallet balance (only by user_id)
  UPDATE wallets
  SET balance = v_new_balance,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to settle actual call cost
CREATE OR REPLACE FUNCTION settle_call_cost(
  p_call_sid TEXT,
  p_actual_cost DECIMAL(10, 4)
)
RETURNS UUID AS $$
DECLARE
  v_reserve_transaction RECORD;
  v_settle_transaction_id UUID;
  v_refund_amount DECIMAL(10, 4);
  v_current_balance DECIMAL(10, 4);
  v_new_balance DECIMAL(10, 4);
BEGIN
  -- Get reserve transaction
  SELECT * INTO v_reserve_transaction
  FROM wallet_transactions
  WHERE related_call_sid = p_call_sid
    AND transaction_type = 'reserve'
    AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_reserve_transaction IS NULL THEN
    RAISE EXCEPTION 'No reserve transaction found for call %', p_call_sid;
  END IF;
  
  -- Calculate refund if reserved more than actual
  v_refund_amount := ABS(v_reserve_transaction.amount) - p_actual_cost;
  
  -- Get current balance (wallets table only has user_id)
  SELECT COALESCE(balance, 0) INTO v_current_balance
  FROM wallets
  WHERE user_id = v_reserve_transaction.user_id
  LIMIT 1;
  
  IF v_refund_amount > 0 THEN
    -- Refund excess amount
    v_new_balance := v_current_balance + v_refund_amount;
    
    INSERT INTO wallet_transactions (
      user_id,
      organization_id,
      transaction_type,
      status,
      amount,
      balance_before,
      balance_after,
      related_call_sid,
      related_transaction_id,
      metadata,
      completed_at
    ) VALUES (
      v_reserve_transaction.user_id,
      v_reserve_transaction.organization_id,
      'refund',
      'completed',
      v_refund_amount,
      v_current_balance,
      v_new_balance,
      p_call_sid,
      v_reserve_transaction.id,
      jsonb_build_object('actual_cost', p_actual_cost, 'reserved_cost', ABS(v_reserve_transaction.amount)),
      NOW()
    ) RETURNING id INTO v_settle_transaction_id;
    
    -- Update wallet balance (only by user_id)
    UPDATE wallets
    SET balance = v_new_balance,
        updated_at = NOW()
    WHERE user_id = v_reserve_transaction.user_id;
    
  ELSIF v_refund_amount < 0 THEN
    -- Charge additional amount (rare case where actual > estimate)
    v_new_balance := v_current_balance + v_refund_amount; -- negative refund = charge
    
    INSERT INTO wallet_transactions (
      user_id,
      organization_id,
      transaction_type,
      status,
      amount,
      balance_before,
      balance_after,
      related_call_sid,
      related_transaction_id,
      metadata,
      completed_at
    ) VALUES (
      v_reserve_transaction.user_id,
      v_reserve_transaction.organization_id,
      'settle',
      'completed',
      v_refund_amount, -- negative amount
      v_current_balance,
      v_new_balance,
      p_call_sid,
      v_reserve_transaction.id,
      jsonb_build_object('actual_cost', p_actual_cost, 'reserved_cost', ABS(v_reserve_transaction.amount)),
      NOW()
    ) RETURNING id INTO v_settle_transaction_id;
    
    -- Update wallet balance (only by user_id)
    UPDATE wallets
    SET balance = v_new_balance,
        updated_at = NOW()
    WHERE user_id = v_reserve_transaction.user_id;
  ELSE
    -- Exact match, just record settlement
    INSERT INTO wallet_transactions (
      user_id,
      organization_id,
      transaction_type,
      status,
      amount,
      balance_before,
      balance_after,
      related_call_sid,
      related_transaction_id,
      metadata,
      completed_at
    ) VALUES (
      v_reserve_transaction.user_id,
      v_reserve_transaction.organization_id,
      'settle',
      'completed',
      0,
      v_current_balance,
      v_current_balance,
      p_call_sid,
      v_reserve_transaction.id,
      jsonb_build_object('actual_cost', p_actual_cost, 'reserved_cost', ABS(v_reserve_transaction.amount)),
      NOW()
    ) RETURNING id INTO v_settle_transaction_id;
  END IF;
  
  RETURN v_settle_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE call_pricing ENABLE ROW LEVEL SECURITY;

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE call_cost_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_pricing (read-only for all authenticated users)
CREATE POLICY "Anyone can view pricing" ON call_pricing FOR
SELECT TO authenticated USING (is_active = true);

-- Allow service role and anon to insert pricing data (for imports)
CREATE POLICY "Allow pricing imports" ON call_pricing FOR INSERT TO anon,
authenticated,
service_role
WITH
    CHECK (true);

-- Allow updates to pricing data
CREATE POLICY "Allow pricing updates" ON call_pricing FOR
UPDATE TO anon,
authenticated,
service_role USING (true)
WITH
    CHECK (true);

-- RLS Policies for wallet_transactions (users can only see their own)
CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR
SELECT TO authenticated USING (
        user_id = auth.uid ()
        OR organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE
                user_id = auth.uid ()
        )
    );

-- RLS Policies for call_cost_records (users can only see their own)
CREATE POLICY "Users can view own call costs" ON call_cost_records FOR
SELECT TO authenticated USING (
        user_id = auth.uid ()
        OR organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE
                user_id = auth.uid ()
        )
    );

-- Grant permissions
GRANT SELECT ON call_pricing TO authenticated;

GRANT SELECT ON wallet_transactions TO authenticated;

GRANT SELECT ON call_cost_records TO authenticated;