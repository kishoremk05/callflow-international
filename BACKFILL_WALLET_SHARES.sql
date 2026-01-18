-- Backfill historical wallet shares to owner wallets
-- This script credits organization owners with all previously shared amounts that weren't added to their wallets

-- Step 1: View current state (optional - run this first to see what will be updated)
SELECT
    o.id as organization_id,
    o.name as organization_name,
    o.shared_balance,
    o.owner_id,
    p.full_name as owner_name,
    p.email as owner_email,
    w.balance as current_wallet_balance,
    w.balance + o.shared_balance as new_wallet_balance
FROM
    organizations o
    JOIN profiles p ON p.id = o.owner_id
    JOIN wallets w ON w.user_id = o.owner_id
WHERE
    o.shared_balance > 0
ORDER BY o.name;

-- Step 2: Update owner wallets with shared amounts
-- This adds the organization's shared_balance to each owner's wallet
UPDATE wallets
SET
    balance = balance + (
        SELECT COALESCE(shared_balance, 0)
        FROM organizations
        WHERE
            organizations.owner_id = wallets.user_id
            AND organizations.shared_balance > 0
    )
WHERE
    user_id IN (
        SELECT owner_id
        FROM organizations
        WHERE
            shared_balance > 0
    );

-- Step 3: Verify the update (run this after Step 2)
SELECT
    o.id as organization_id,
    o.name as organization_name,
    o.shared_balance,
    p.full_name as owner_name,
    p.email as owner_email,
    w.balance as updated_wallet_balance
FROM
    organizations o
    JOIN profiles p ON p.id = o.owner_id
    JOIN wallets w ON w.user_id = o.owner_id
WHERE
    o.shared_balance > 0
ORDER BY o.name;