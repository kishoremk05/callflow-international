# Conference Creation Fix - Contacts Support

## Problem

When creating a conference with contacts, the system was failing with error:

```
insert or update on table "conference_participants" violates foreign key constraint
"conference_participants_user_id_fkey"
```

**Root Cause**: The code was trying to insert contact IDs as `user_id` values, but contacts don't exist in the `auth.users` table. Only enterprise members have valid `user_id` entries.

## Solution

### 1. **Frontend Changes** (VoiceCall.tsx)

- **Separated contacts from enterprise members** before sending to API
- Contacts now send: `{name, phone_number, country_code}`
- Enterprise members send: `user_id`
- Both arrays sent separately in the request

### 2. **Backend Changes** (server-single.js)

- Accepts both `memberIds` (array of user IDs) and `contacts` (array of contact objects)
- Creates participants differently:
  - **Enterprise members**: `{user_id, conference_id, status}`
  - **Contacts**: `{phone_number, country_code, participant_name, conference_id, status, user_id: null}`

### 3. **Database Migration** (20251214000001_fix_conference_participants.sql)

- Ensures `user_id` column is nullable
- Adds check constraint: Either `user_id` OR `phone_number` must be present (not both)
- Updates RLS policies to handle NULL user_id

## How It Works Now

### Creating a Conference:

1. User selects team members (mix of contacts and enterprise members)
2. Frontend separates them:
   ```javascript
   enterpriseMembers = [{ user_id }];
   contactMembers = [{ name, phone_number, country_code }];
   ```
3. Backend creates conference and adds participants:
   - Enterprise members get `user_id` set
   - Contacts get `user_id: null` with phone_number

### Database Structure:

```sql
conference_participants {
  id
  conference_id
  user_id (nullable) -- for enterprise members
  phone_number (nullable) -- for contacts
  participant_name -- for contacts
  country_code -- for contacts
  status
}
```

## Required Steps to Fix

### 1. Apply Database Migration

Run this in Supabase SQL Editor:

```sql
-- From: supabase/migrations/20251214000001_fix_conference_participants.sql

ALTER TABLE conference_participants
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE conference_participants
  ADD CONSTRAINT participant_identifier_check
  CHECK (
    (user_id IS NOT NULL AND phone_number IS NULL) OR
    (user_id IS NULL AND phone_number IS NOT NULL)
  );
```

### 2. Restart Backend Server

```bash
cd backend
npm start
```

### 3. Test

1. Add some contacts in Dashboard
2. Go to Voice Call page → Inside Team tab
3. Select a mix of contacts and enterprise members
4. Create conference
5. Should work without errors!

## What This Fixes

✅ **Contacts can be added to conferences** without foreign key errors
✅ **Enterprise members still work** as before
✅ **Both types can be mixed** in the same conference
✅ **Database constraints ensure data integrity**
✅ **Better error handling** with console logs

## Error Messages Fixed

Before:

- ❌ `violates foreign key constraint "conference_participants_user_id_fkey"`
- ❌ 500 Internal Server Error

After:

- ✅ Conference created successfully
- ✅ Both contacts and members added
- ✅ Clear participant count returned

## Additional Improvements

- Added error handling for enterprise members fetch
- Better logging for debugging
- Cleaner separation of concerns
- More flexible participant handling
