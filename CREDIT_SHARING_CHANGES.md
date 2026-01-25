# Company Admin Credit Sharing System - Changes Summary

## Overview

Updated the system to track individual teammate credit shares instead of team-level wallet sharing. Company admins now share credits directly to individual teammates using the "Share Credit" button in the team member management modal.

## Changes Made

### 1. Frontend Changes (CompanyAdminDashboard.tsx)

#### Removed:

- ✅ "Shared Wallet" display section from team cards
- ✅ "Share Wallet" button from team cards
- ✅ Team-level wallet sharing dialog and functionality

#### Updated:

- ✅ `WalletShare` interface to show individual recipients instead of organization names
- ✅ Wallet history UI to display individual teammates with:
  - Teammate name and email
  - Profile avatar with initials
  - Share amount
  - Share date/time

### 2. Backend Changes (server-single.js)

#### Modified `/api/wallet/share-credit` endpoint:

- ✅ Added check for company admin status
- ✅ Tracks shares in new `company_admin_shares` table when sender is a company admin
- ✅ Maintains existing wallet transfer functionality

#### Modified `/api/company-admin/wallet/history` endpoint:

- ✅ Now fetches from `company_admin_shares` table instead of `wallet_shares`
- ✅ Returns individual teammate information (name, email) instead of team names
- ✅ Includes error handling for when table doesn't exist yet

### 3. Database Changes

#### New Table: `company_admin_shares`

```sql
- id: UUID (Primary Key)
- company_admin_id: UUID (Foreign Key to company_admins)
- recipient_user_id: UUID (Foreign Key to profiles)
- shared_amount: DECIMAL(10, 2)
- shared_by: UUID (Foreign Key to profiles)
- shared_at: TIMESTAMPTZ
- notes: TEXT (optional)
```

#### Features:

- ✅ Row Level Security enabled
- ✅ Policies for company admins to view and insert their shares
- ✅ Indexes for performance optimization
- ✅ Cascade delete on company admin or profile deletion

## How It Works Now

### Sharing Credits (Company Admin)

1. Company admin opens team management modal (click + button on team card)
2. Clicks "Share Credit" button next to a team member
3. Enters amount and confirms
4. Credit is deducted from company admin wallet
5. Credit is added to teammate wallet
6. Share is recorded in `company_admin_shares` table

### Viewing History (Company Admin)

1. Click on "Available Balance" card on dashboard
2. Wallet Details modal opens showing:
   - Current Balance (total wallet balance)
   - Total Shared (sum of all shares to teammates)
   - Available (current balance - total shared)
   - Shared to Teammates section with list of all shares

### For Normal Users

- See their current wallet balance on their dashboard
- Balance increases when company admin shares credits with them
- Can use balance for making calls

## Migration Instructions

1. **Run SQL Migration:**

   ```bash
   # In Supabase SQL Editor, run:
   CREATE_COMPANY_ADMIN_SHARES_TABLE.sql
   ```

2. **Restart Backend Server:**

   ```bash
   cd backend
   node server-single.js
   ```

3. **Test the Flow:**
   - Login as company admin
   - Open a team in team management
   - Share credit with a teammate using "Share Credit" button
   - Click wallet balance card to view history
   - Verify teammate shows in "Shared to Teammates" section

## API Changes

### `/api/wallet/share-credit` (POST)

- **Input:** `{ recipient_user_id, amount }`
- **New Behavior:** Tracks share in `company_admin_shares` if sender is company admin
- **Output:** `{ success, message, new_balance }`

### `/api/company-admin/wallet/history` (GET)

- **New Response:**

```json
{
  "success": true,
  "history": {
    "shares": [
      {
        "id": "uuid",
        "shared_amount": 20.0,
        "shared_at": "2026-01-26T12:30:00Z",
        "recipient": {
          "id": "uuid",
          "email": "teammate@example.com",
          "full_name": "Teammate Name"
        }
      }
    ],
    "totalShared": 40.0,
    "totalUsage": 0
  }
}
```

## Benefits

1. **Clearer Tracking:** Shows exactly which teammates received credits
2. **Better Accountability:** Individual share records instead of team-level
3. **Accurate Available Balance:** Shows what company admin can still share
4. **Simplified UI:** Removed confusing team-level wallet display
5. **Flexible Sharing:** Company admin can share different amounts to different teammates

## Notes

- Old `wallet_shares` table for organization-level sharing is still in database but no longer used
- Can be removed in future cleanup if confirmed not needed
- All new shares will use the `company_admin_shares` table
