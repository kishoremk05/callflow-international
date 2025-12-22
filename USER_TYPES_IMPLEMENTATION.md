# User Types Implementation - Normal User vs Company User

## Overview

This document describes the implementation of two user types in the Global Connect Pro application:

- **Normal User**: Personal calling with basic features
- **Company User**: Full feature access including team collaboration

## Changes Made

### 1. Database Schema

**File**: `supabase/migrations/20251222000000_add_user_types.sql`

- Created `user_type` enum with values: `'normal'` and `'company'`
- Added `user_type` column to `profiles` table
- Created index on `user_type` for performance
- Set default value to `'normal'` for all new users

### 2. Authentication Updates

#### Signup Form (`src/components/auth/AuthForm.tsx`)

- Added user type selection UI with two visual cards:
  - **Normal User**: Personal calling features
  - **Company User**: Team collaboration features
- Updated signup process to save `user_type` to user metadata and profile
- Added visual indicators with icons (UserCircle for normal, Building2 for company)

#### Auth Hook (`src/hooks/useAuth.tsx`)

- Extended to fetch and track user type from database
- Added `userType` state variable
- Added `fetchUserProfile()` function to retrieve user type
- Returns `userType` along with other auth data

### 3. Dashboard Features

#### Feature Visibility (`src/pages/Dashboard.tsx`)

**For Normal Users:**

- ✅ Voice Call button (can make calls)
- ✅ Conference calling (available)
- ✅ Contacts management (can save contacts)
- ✅ Recent calls history
- ✅ Wallet and balance
- ❌ Video Call button (hidden)
- ❌ Message button (hidden)
- ❌ Team button (hidden)
- ❌ Team Activity card (hidden)
- ❌ Upcoming Meetings card (hidden)
- ❌ This Week Analytics card (hidden)

**For Company Users:**

- ✅ All Normal User features
- ✅ Video Call button (coming soon)
- ✅ Message button (coming soon)
- ✅ Team button
- ✅ Team Activity card
- ✅ Upcoming Meetings card
- ✅ This Week Analytics card

## User Experience

### Normal User Flow

1. Sign up and select "Normal User" account type
2. Access dashboard with simplified interface
3. Can make calls, use conference calling, and save contacts
4. No team collaboration features visible
5. Clean, focused calling experience

### Company User Flow

1. Sign up and select "Company User" account type
2. Access full dashboard with all features
3. Can make calls, use conference, save contacts
4. Additional team collaboration features available
5. Team activity, meetings, and analytics visible

## Technical Implementation Details

### Quick Actions Filtering

```typescript
const quickActions = [
  {
    icon: Phone,
    label: "Voice Call",
    showFor: ["normal", "company"], // Available to all
  },
  ...(userType === "company"
    ? [
        // Video, Message, Team buttons only for company users
      ]
    : []),
];
```

### Conditional Rendering

```typescript
{
  userType === "company" && <Card>{/* Team Activity Card */}</Card>;
}
```

## Database Migration

To apply the changes to your database, run:

```bash
# If using Supabase CLI
supabase db reset

# Or apply the migration directly
supabase migration up
```

## Testing

### Test Normal User

1. Sign up with "Normal User" type
2. Verify no Video/Message/Team buttons appear
3. Verify no Team Activity/Upcoming/Analytics cards
4. Verify can still make calls and use basic features

### Test Company User

1. Sign up with "Company User" type
2. Verify all buttons are visible
3. Verify all activity cards are present
4. Verify full feature access

## Next Steps (Company User Features)

When you're ready to implement company user specific features, you'll need to add:

1. Video calling functionality
2. Messaging system
3. Team management interface
4. Real team activity tracking
5. Meeting scheduling
6. Enhanced analytics

## Files Modified

1. `supabase/migrations/20251222000000_add_user_types.sql` - New database migration
2. `src/components/auth/AuthForm.tsx` - User type selection in signup
3. `src/hooks/useAuth.tsx` - User type tracking
4. `src/pages/Dashboard.tsx` - Conditional feature rendering

## Summary

The implementation successfully separates Normal Users and Company Users:

- Normal users get a clean, focused calling experience
- Company users get full team collaboration features
- User type is persisted in the database
- Features are conditionally rendered based on user type
- The system is ready for company-specific feature development
