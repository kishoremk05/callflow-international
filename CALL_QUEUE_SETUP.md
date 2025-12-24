# Call Queue System Setup Guide

## Overview

The Call Queue system allows company users to upload XLSX (Excel) files with contact numbers and automatically call them one by one. Features include:

- **XLSX Upload**: Upload an Excel file with Name and Number columns
- **Auto-Queue Calling**: Numbers are called automatically one by one
- **Auto-Skip**: If call is not picked (busy/no answer), automatically skip to next number
- **Manual Skip**: User can skip any number without calling
- **Progress Tracking**: Shows current progress (e.g., "5 of 20 contacts")
- **1-Day Records**: Call records are automatically deleted after 1 day

## Database Migration

**IMPORTANT**: You must run the database migration before using the call queue feature.

### Steps to Run Migration:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **+ New query**
5. Copy the entire contents of: `supabase/migrations/20251223000000_create_call_queues.sql`
6. Paste it into the SQL editor
7. Click **Run** button

This will create:

- `call_queues` table - Stores queue sessions
- `call_queue_contacts` table - Stores individual contacts in each queue
- Row Level Security (RLS) policies - Ensures users can only access their own queues
- Indexes for performance
- Auto-delete function for expired queues

## XLSX File Format

Your Excel file should have exactly 2 columns in the first sheet: **Name** and **Number**

### Example XLSX:

```
| Name          | Number          |
|---------------|----------------|
| John Doe      | +916381179491  |
| Jane Smith    | +919876543210  |
| Bob Johnson   | +918765432109  |
```

### Important Notes:

- **Header Row**: First row should contain "Name" and "Number" (Column A and B)
- **Phone Format**: Include country code (e.g., +91 for India)
- **Phone Validation**: Numbers must be 10-15 digits (excluding +)
- **No Empty Values**: Both name and number are required for each row
- **File Format**: Must be .xlsx (Excel format)

## How to Use

### For Company Users:

1. **Upload Queue**:

   - Click "Upload Call Queue" button in Quick Actions
   - Select your CSV file
   - Preview will show first 5 contacts
   - Click "Create Queue" to upload

2. **Call Queue Manager Opens**:

   - Shows current contact to call
   - Displays progress stats (Total, Completed, Answered, Skipped)
   - Shows next contact in queue

3. **Making Calls**:

   - Click "Call Now" to dial the current number
   - Call status will update automatically
   - If busy or no answer: Auto-skips after 2 seconds
   - Manual skip: Click "Skip Contact" button anytime

4. **Queue Completion**:
   - When all contacts are processed, queue completes
   - Success message appears
   - Queue manager closes

## Call Status Flow

```
pending → calling → answered ✓
                 → busy/no-answer → skipped (auto)
                 → failed
```

- **Pending**: Contact not yet called
- **Calling**: Currently ringing
- **Answered**: Call connected successfully
- **Skipped**: Auto-skipped (busy/no-answer) or manually skipped
- **Failed**: Call failed due to error

## Backend API Endpoints

The following endpoints are available:

- `POST /api/call-queue/upload` - Create queue from CSV contacts
- `GET /api/call-queue/:queueId` - Get queue details and contacts
- `POST /api/call-queue/:queueId/update` - Update contact status
- `GET /api/call-queue/active` - Get user's active queues

## Automatic Cleanup

- Queues automatically expire after **1 day** (24 hours)
- Set via `expires_at` field in database
- Can run `delete_expired_call_queues()` function manually or via cron

## Testing Checklist

- [ ] Database migration executed successfully
- [ ] Backend server running on port 5000
- [ ] CSV upload shows preview correctly
- [ ] Queue creation succeeds
- [ ] First contact appears in queue manager
- [ ] "Call Now" button dials number correctly
- [ ] Auto-skip works on busy/no-answer (after 2 seconds)
- [ ] Manual skip button works
- [ ] Progress stats update correctly
- [ ] Next contact loads after skip/completion
- [ ] Queue completes when all contacts processed
- [ ] Success message appears on completion

## Troubleshooting

### Queue Not Creating

- Check backend server is running
- Check browser console for errors
- Verify CSV format is correct (Name,Number)
- Ensure all phone numbers are valid

### Auto-Skip Not Working

- Check callStatus is being updated correctly
- Verify useEffect in CallQueueManager is running
- Check backend is sending correct call status

### Numbers Not Dialing

- Verify Twilio credentials are configured
- Check phone numbers include country code
- Ensure wallet has sufficient balance

### Queue Not Appearing

- Verify user type is "company"
- Check if activeQueueId is set correctly
- Look for errors in browser console

## File Structure

```
src/components/dashboard/
├── CallQueueUpload.tsx      # CSV upload modal
└── CallQueueManager.tsx     # Queue display and control

backend/
└── server-single.js         # Call queue API endpoints (lines 393-550)

supabase/migrations/
└── 20251223000000_create_call_queues.sql  # Database schema

src/pages/
└── Dashboard.tsx           # Main integration
```

## Future Enhancements (Optional)

- Pause/resume queue functionality
- Export call results to CSV
- Queue templates for recurring campaigns
- Multi-queue management
- Scheduled queue execution
- Call recording integration
- SMS fallback for missed calls
