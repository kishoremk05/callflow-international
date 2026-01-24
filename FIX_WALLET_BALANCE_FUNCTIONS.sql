-- Fix wallet_balance to balance in reserve_call_funds function
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
  -- Get current wallet balance (wallets table only has user_id, no organization_id)
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

-- Fix wallet_balance to balance in settle_call_cost function
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