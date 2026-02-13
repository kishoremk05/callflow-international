# Google OAuth Account Type Selection - Implementation Guide

## Overview

This feature allows users signing in with Google to choose their account type (Normal User or Company User) on their **first login only**. Returning users are automatically redirected to their dashboard.

---

## How It Works

### First-Time Google Users Flow

1. **User clicks "Continue with Google"** on the signup/login page
2. **Google authentication** happens in a popup/redirect
3. **User is redirected** to `/auth/callback` after successful Google login
4. **System checks** if the user has a `user_type` set in their profile:
   - ✅ **If NO** (new user): Redirect to `/account-type-selection`
   - ✅ **If YES** (returning user): Redirect to `/dashboard`

5. **Account Type Selection Page** (`/account-type-selection`):
   - Beautiful UI with two cards: **Normal User** and **Company User**
   - User selects their preferred account type
   - Selection is saved to the `profiles.user_type` column in database
   - User is redirected to dashboard

### Returning Google Users Flow

1. **User clicks "Continue with Google"**
2. **Google authentication** completes
3. **User is redirected** to `/auth/callback`
4. **System detects** user already has a `user_type`
5. **Immediate redirect** to `/dashboard` (no account selection needed)

---

## Files Created/Modified

### 1. **New Files Created**

#### `src/pages/AccountTypeSelection.tsx`

- Beautiful account type selection UI
- Two cards: Normal User vs Company User
- Features list for each type
- Saves selection to database
- Redirects to dashboard after selection

#### `src/pages/AuthCallback.tsx`

- Handles OAuth callback
- Checks if user is new or returning
- Routes to appropriate destination

### 2. **Modified Files**

#### `src/App.tsx`

- Added route: `/auth/callback` → `<AuthCallback />`
- Added route: `/account-type-selection` → `<AccountTypeSelection />`

#### `src/components/auth/AuthForm.tsx`

- Changed Google OAuth redirect URL from `window.location.origin` to `${window.location.origin}/auth/callback`

#### `SOCIAL_AUTH_SETUP.md`

- Updated redirect URL for local development from `http://localhost:8080/auth/v1/callback` to `http://localhost:8080/auth/callback`

---

## Database Structure

The `profiles` table already has a `user_type` column:

```sql
user_type: ENUM('normal', 'company', 'company_admin')
DEFAULT: 'normal'
```

### Account Type Meanings:

- **normal**: Personal calling users (simplified dashboard)
- **company**: Business users (team features visible)
- **company_admin**: Special admin accounts (separate flow)

---

## Testing Instructions

### Test Case 1: First-Time Google User

1. **Start the app**: `npm run dev`
2. Go to `http://localhost:8080/signup`
3. Click **"Continue with Google"**
4. Complete Google authentication
5. **Expected**: You should be redirected to `/account-type-selection`
6. **Select** Normal User or Company User
7. Click **"Continue"**
8. **Expected**: Redirected to `/dashboard`

### Test Case 2: Returning Google User

1. Sign out from the app
2. Go to `http://localhost:8080/signup`
3. Click **"Continue with Google"**
4. Complete Google authentication
5. **Expected**: Automatically redirected to `/dashboard` (NO account selection page)

### Test Case 3: Manual Profile Check

```sql
-- Check user profile in Supabase dashboard
SELECT id, email, user_type, created_at
FROM profiles
WHERE email = 'your-google-email@gmail.com';
```

- First-time users will have `user_type = NULL` initially
- After selection, `user_type = 'normal'` or `'company'`
- Returning users will show their previously selected type

---

## Google Cloud Console Setup

### Important: Update Redirect URI

You need to add the new callback URL to Google Cloud Console:

1. Go to: https://console.cloud.google.com/
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your **OAuth 2.0 Client ID**
4. Under **Authorized redirect URIs**, add:
   ```
   https://tfeuximanivyhdsqfiby.supabase.co/auth/v1/callback
   http://localhost:8080/auth/callback
   ```
5. Click **Save**

### Supabase Redirect URLs

Ensure these URLs are added in Supabase:

1. Go to: https://supabase.com/dashboard/project/tfeuximanivyhdsqfiby/auth/url-configuration
2. Add to **Redirect URLs**:
   ```
   http://localhost:8080/**
   http://localhost:8080/auth/callback
   https://your-production-url.vercel.app/**
   https://your-production-url.vercel.app/auth/callback
   ```

---

## User Experience

### Normal User Account Features

✅ Voice calling worldwide  
✅ Conference calling  
✅ Contact management  
✅ Call history  
❌ Team management  
❌ Team activity tracking  
❌ Advanced analytics

### Company User Account Features

✅ All Normal User features  
✅ Team management  
✅ Team activity tracking  
✅ Advanced analytics  
✅ Organization management  
✅ Credit sharing with team

---

## Troubleshooting

### Issue: User stuck on loading screen after Google login

**Solution**: Check browser console for errors. Verify:

- Supabase redirect URLs are correct
- Google OAuth redirect URI includes `/auth/callback`
- User has internet connection

### Issue: Account selection page doesn't save user type

**Solution**:

1. Check browser console for errors
2. Verify `profiles` table has `user_type` column
3. Check Supabase RLS policies allow users to update their own profile

### Issue: Returning user sees account selection again

**Solution**:

- User's `user_type` might be NULL in database
- Manually set it:
  ```sql
  UPDATE profiles
  SET user_type = 'normal'
  WHERE email = 'user@example.com';
  ```

### Issue: "Invalid redirect URI" error from Google

**Solution**:

- Go to Google Cloud Console
- Verify redirect URI exactly matches: `https://tfeuximanivyhdsqfiby.supabase.co/auth/v1/callback`
- Add local development URI: `http://localhost:8080/auth/callback`

---

## Security Considerations

1. ✅ **User can only set their type once via Google OAuth** (first-time login)
2. ✅ **Returning users cannot change type via OAuth** (need settings page)
3. ✅ **Profile updates use Supabase RLS policies** (users can only update their own profile)
4. ✅ **OAuth state parameter prevents CSRF attacks** (handled by Supabase Auth)

---

## Future Enhancements

1. **Allow users to change account type** in settings
2. **Add account type upgrade flow** (Normal → Company)
3. **Show different onboarding** based on account type
4. **Track analytics** on account type selection

---

## Summary

✅ **First-time Google users**: See account type selection  
✅ **Returning Google users**: Auto-redirect to dashboard  
✅ **User type saved**: In `profiles.user_type` column  
✅ **Different dashboards**: Based on selected type

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Check for TypeScript errors
npm run build
```

---

## Support

If you encounter any issues:

1. Check browser console for errors
2. Verify Supabase dashboard for user profile data
3. Review Google Cloud Console OAuth settings
4. Check Supabase redirect URL configuration

---

**Implementation Date**: February 12, 2026  
**Status**: ✅ Complete and Ready for Testing
