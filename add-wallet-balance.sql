-- Add $10 balance to the wallet for testing
-- Replace 'YOUR_USER_ID' with your actual user ID from Supabase Auth

-- First, check if wallet exists, if not create it
INSERT INTO
    wallets (user_id, balance, currency)
SELECT id, 10.00, 'USD'
FROM auth.users
WHERE
    email = 'your-email@example.com' -- Replace with your email
ON CONFLICT (user_id) DO
UPDATE
SET
    balance = wallets.balance + 10.00;

-- Or if you know your user_id, use this:
-- UPDATE wallets SET balance = 10.00 WHERE user_id = 'YOUR_USER_ID';