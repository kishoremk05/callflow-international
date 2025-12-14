# Quick Test Guide - Contacts Feature

## Issue: "Failed to save contact"

### Steps to Fix:

1. **Apply Database Migration**

   - Open Supabase Dashboard: https://supabase.com/dashboard
   - Go to your project → SQL Editor
   - Run the migration file: `supabase/migrations/20251214000000_create_contacts_table.sql`
   - Click "Run" to create the contacts table

2. **Verify Backend is Running**

   ```bash
   cd backend
   npm start
   # or
   node server-single.js
   ```

   Should see: "Server running on http://localhost:5000"

3. **Check Environment Variables**

   - Make sure `.env` has: `VITE_API_URL=http://localhost:5000`
   - Backend `.env` has Supabase credentials

4. **Test the Feature**
   - Enter a phone number in the dialer
   - Click "Save as Contact" button
   - A popup modal will appear
   - Fill in the contact name (required)
   - Click "Save Contact"
   - Contact should save successfully

## What Was Fixed:

✅ **Popup Modal** - Contact form now shows in a popup dialog instead of inline
✅ **Better Error Handling** - Shows specific error messages
✅ **Input Validation** - Checks for required fields before saving
✅ **Improved UX** - Cancel and Save buttons, auto-focus on name field

## Common Issues:

### "Failed to save contact"

- **Solution**: Apply the database migration first
- The `contacts` table needs to be created in Supabase

### "Network error"

- **Solution**: Make sure backend server is running on port 5000
- Check VITE_API_URL in .env file

### "Please log in"

- **Solution**: User needs to be authenticated
- Log out and log back in to refresh session

## Database Migration SQL:

The migration file is located at:
`supabase/migrations/20251214000000_create_contacts_table.sql`

You can also run it directly in Supabase SQL Editor.
