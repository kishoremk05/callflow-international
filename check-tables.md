# Check Call Queue Tables

Run this SQL query in your Supabase SQL Editor to check if the tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('call_queues', 'call_queue_contacts');
```

If the tables DON'T exist, you need to run the migration:

## Run Migration in Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New query**
5. Copy the entire contents of `supabase/migrations/20251223000000_create_call_queues.sql`
6. Paste and click **Run**

## Check if migration was successful:

```sql
-- Check call_queues table
SELECT * FROM call_queues LIMIT 5;

-- Check call_queue_contacts table
SELECT * FROM call_queue_contacts LIMIT 5;
```

If you get errors about tables not existing, the migration needs to be run.

## Troubleshooting

If you're getting errors when clicking "Create Queue":

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Go to Network tab
5. Click "Create Queue" button
6. Look for the `/api/call-queue/upload` request
7. Check the Response tab for error details

The most common issue is that the database tables haven't been created yet.
