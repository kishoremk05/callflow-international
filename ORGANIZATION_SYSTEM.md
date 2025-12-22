# Organization System Implementation

## Overview

This document describes the organization/company user system that allows company users to create organizations and invite normal users to join them.

## Features Implemented

### 1. Database Structure

**Migration File**: `supabase/migrations/20251222000001_create_organizations.sql`

**Tables Created:**

- `organizations` - Stores organization details
- `organization_members` - Tracks members of each organization
- `organization_invites` - Manages invitation system

**Key Features:**

- Row Level Security (RLS) enabled on all tables
- Automatic invitation tracking
- Support for multiple organizations per user
- Role-based access (owner, admin, member)

### 2. Backend API Endpoints

**Organization Management:**

- `POST /api/organizations/create` - Create new organization (company users only)
- `GET /api/organizations/my-organizations` - Get user's organizations
- `GET /api/organizations/:organizationId` - Get organization details
- `DELETE /api/organizations/:organizationId/members/:memberId` - Remove member
- `POST /api/organizations/:organizationId/leave` - Leave organization

**Invitation System:**

- `POST /api/organizations/:organizationId/invite` - Send invite to normal user
- `GET /api/organizations/invites/pending` - Get pending invites for current user
- `POST /api/organizations/invites/:inviteId/accept` - Accept invitation
- `POST /api/organizations/invites/:inviteId/reject` - Reject invitation

### 3. Frontend Components

**New Components Created:**

#### CreateOrganizationModal

- Location: `src/components/dashboard/CreateOrganizationModal.tsx`
- Purpose: Modal for company users to create their organization
- Fields: Organization name (required), Description (optional)

#### InviteMemberModal

- Location: `src/components/dashboard/InviteMemberModal.tsx`
- Purpose: Modal for inviting normal users to organization
- Features:
  - Email validation
  - Checks if user is registered
  - Only allows inviting normal users
  - Prevents duplicate invites

#### InviteNotifications

- Location: `src/components/dashboard/InviteNotifications.tsx`
- Purpose: Shows pending organization invites for normal users
- Features:
  - List of all pending invites
  - Accept/Reject buttons
  - Organization details display
  - Real-time status updates

### 4. Dashboard Integration

**Company User Features:**

- **"Create Organization"** button appears when no organization exists
- **"Invite Members"** button appears when organization exists
- Same dashboard as normal users + organization features

**Normal User Features:**

- **"Invitations"** button with badge showing pending invite count
- Notification badge appears when invites are pending
- Can view and respond to invites through modal

## User Flows

### Company User Flow

1. **First Time Setup:**

   ```
   Login → Dashboard → Click "Create Organization" →
   Fill form (Name + Description) → Submit → Organization Created
   ```

2. **Inviting Members:**

   ```
   Dashboard → Click "Invite Members" →
   Enter normal user's email → Send Invite →
   Invite sent to user
   ```

3. **Managing Organization:**
   - View all members
   - Remove members
   - Send multiple invites

### Normal User Flow

1. **Receiving Invite:**

   ```
   Login → Dashboard → See "Invitations" button with badge →
   Click button → View pending invites
   ```

2. **Accepting Invite:**

   ```
   View Invites → See organization details →
   Click Accept (✓) → Joined organization →
   Now part of the organization
   ```

3. **Rejecting Invite:**
   ```
   View Invites → Click Reject (✗) →
   Invite removed from list
   ```

## Security Features

1. **Role-Based Access:**

   - Only company users can create organizations
   - Only organization owners can send invites
   - Only invited users can see their invites

2. **Validation:**

   - Email validation before sending invites
   - User type checking (can only invite normal users)
   - Duplicate invite prevention
   - Member existence checking

3. **Row Level Security (RLS):**
   - Users can only see organizations they belong to
   - Members can only view their own invitations
   - Owners have full control over their organizations

## API Response Examples

### Create Organization

```json
{
  "success": true,
  "organization": {
    "id": "uuid",
    "name": "Acme Corporation",
    "description": "Tech company",
    "owner_id": "user-uuid",
    "created_at": "2025-12-22T...",
    "is_active": true
  }
}
```

### Send Invite

```json
{
  "success": true,
  "invite": {
    "id": "invite-uuid",
    "organization_id": "org-uuid",
    "invited_email": "user@example.com",
    "status": "pending",
    "invited_at": "2025-12-22T..."
  },
  "message": "Invitation sent to user@example.com"
}
```

### Pending Invites

```json
{
  "success": true,
  "invites": [
    {
      "id": "invite-uuid",
      "organizations": {
        "name": "Acme Corp",
        "description": "Tech company"
      },
      "invited_by_profile": {
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "invited_at": "2025-12-22T..."
    }
  ]
}
```

## Error Handling

**Common Errors:**

- `403` - Only company users can create organizations
- `404` - User not found with this email
- `400` - Can only invite normal users
- `400` - User is already a member
- `400` - Invite already sent

## Next Steps

This is the foundation for the organization system. You mentioned you'll tell more about this concept. Here are some features you might want to add:

1. **Shared Resources:**

   - Shared wallet/credits
   - Shared contacts
   - Shared call logs

2. **Advanced Permissions:**

   - Custom roles (admin, member, viewer)
   - Permission levels (can call, can manage, etc.)
   - Resource limits per member

3. **Organization Settings:**

   - Update organization details
   - Transfer ownership
   - Delete organization

4. **Analytics:**

   - Organization-wide call statistics
   - Member usage tracking
   - Cost allocation

5. **Communication:**
   - Internal messaging between members
   - Team video calls
   - Conference calls with organization members

## Testing Checklist

- [ ] Company user can create organization
- [ ] Company user can invite normal user by email
- [ ] Normal user receives invitation notification
- [ ] Normal user can accept invitation
- [ ] Normal user can reject invitation
- [ ] Cannot invite non-existent users
- [ ] Cannot invite company users
- [ ] Cannot send duplicate invites
- [ ] Owner can remove members
- [ ] Members can leave organization

## Files Modified/Created

**Database:**

- `supabase/migrations/20251222000001_create_organizations.sql` (new)

**Backend:**

- `backend/server-single.js` (modified - added organization routes)

**Frontend Components:**

- `src/components/dashboard/CreateOrganizationModal.tsx` (new)
- `src/components/dashboard/InviteMemberModal.tsx` (new)
- `src/components/dashboard/InviteNotifications.tsx` (new)
- `src/pages/Dashboard.tsx` (modified - added organization features)

**Documentation:**

- `ORGANIZATION_SYSTEM.md` (this file)
