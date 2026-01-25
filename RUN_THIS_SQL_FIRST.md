# IMPORTANT: Run This SQL Migration First!

## Issue

The wallet history is showing "Unknown User" and "No email" because the `company_admin_shares` table doesn't exist yet in the database.

## Fix

You need to create the `company_admin_shares` table in your Supabase database.

## Steps:

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run the SQL Migration:**
   - Open the file: `CREATE_COMPANY_ADMIN_SHARES_TABLE.sql`
   - Copy ALL the SQL content
   - Paste it into the Supabase SQL Editor
   - Click "Run" button

3. **Restart Backend Server:**

   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   cd backend
   node server-single.js
   ```

4. **Test:**
   - Refresh your company admin dashboard
   - Share some credits with a teammate
   - Click on the wallet balance card
   - You should now see the teammate's name and email instead of "Unknown User"

## What This Does:

- Creates the `company_admin_shares` table to track individual credit shares
- Sets up proper foreign key relationships with profiles table
- Adds indexes for better performance
- Configures Row Level Security policies

## After Running:

- Wallet history will show actual teammate names and emails
- Team member cards will show correct available balance for owners
- All previous shares will need to be done again (old data won't appear)
