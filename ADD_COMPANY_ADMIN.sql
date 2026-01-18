-- Add "outlaws" as a company admin
-- First, find the user ID for the "outlaws" account
-- Replace 'outlaws@email.com' with the actual email used by outlaws user

-- Step 1: Find the user_id (Run this first to get the user_id)
SELECT id, email, full_name
FROM profiles
WHERE
    email ILIKE '%outlaws%'
    OR full_name ILIKE '%outlaws%';

-- Step 2: Once you have the user_id from Step 1, insert into company_admins
-- Replace 'USER_ID_FROM_STEP_1' with the actual UUID from the query above
INSERT INTO
    company_admins (
        user_id,
        company_name,
        company_email,
        company_phone,
        is_active
    )
VALUES (
        'USER_ID_FROM_STEP_1', -- Replace with actual user_id
        'Outlaws Corporation', -- Company name
        'admin@outlaws.com', -- Company email (update as needed)
        NULL, -- Phone number (optional)
        true -- Is active
    )
ON CONFLICT (user_id) DO NOTHING;

-- Alternative: If you know the exact email, use this one-step query instead:
-- Replace 'outlaws@actual-email.com' with the real email
INSERT INTO
    company_admins (
        user_id,
        company_name,
        company_email,
        is_active
    )
SELECT id, 'Outlaws Corporation', email, true
FROM profiles
WHERE
    email = 'company2026@gmail.com' -- UPDATE THIS EMAIL
ON CONFLICT (user_id) DO NOTHING;