# Invite Organization Feature

## Overview

Changed the "Create Organization" feature to "Invite Organization" where company admins can invite existing organization owners to join their company by simply entering the owner's email address.

## Changes Made

### Frontend Changes (`src/pages/CompanyAdminDashboard.tsx`)

1. **Updated State Variables**
   - Removed `orgName` and `orgDescription` states
   - Kept only `ownerEmail` state for the invitation form
   - Renamed `showCreateOrgDialog` to `showInviteOrgDialog`

2. **Updated Handler Function**
   - Renamed `handleCreateOrganization` to `handleInviteOrganization`
   - Changed API endpoint from `/api/company-admin/organizations/create` to `/api/company-admin/invite-organization`
   - Simplified request body to only send `ownerEmail`

3. **Updated UI Components**
   - Button text: "Create Organization" → "Invite Organization"
   - Dialog title: "Create New Organization" → "Invite Organization"
   - Dialog description: Updated to reflect invitation flow
   - Removed organization name and description input fields
   - Kept only "Organization Owner Email" input field
   - Updated button text: "Create Organization" → "Send Invitation"
   - Updated loading state: "Creating..." → "Sending..."
   - Updated empty state message to "Invite an organization owner to get started"

### Backend Changes (`backend/server-single.js`)

1. **New API Endpoint: `/api/company-admin/invite-organization`**
   - Validates that the requester is a company admin
   - Checks if the owner email exists in the system
   - Verifies the user is an organization owner (user_type = 'organization_owner')
   - Checks if they already have an organization under this company
   - Finds the owner's existing organization (that's not yet linked to any company)
   - Links the organization to the company admin by updating `company_admin_id`
   - Returns the updated organization with all members

## How It Works

1. **Company Admin enters organization owner's email**
   - The email must belong to a registered user with `user_type` = "organization_owner"

2. **System validates the invitation**
   - Checks if user exists
   - Verifies user is an organization owner
   - Ensures they have an existing organization not linked to any company
   - Prevents duplicate invitations

3. **Organization is linked to company**
   - The organization's `company_admin_id` is updated to link it to the company
   - The organization and all its members now appear in the company admin dashboard

4. **Dashboard displays linked organizations**
   - Shows organization name, description
   - Displays shared balance
   - Lists organization owner and member count
   - Provides options to share wallet balance or remove organization

## Requirements

For an organization owner to be invited:

- They must have a registered account
- Their `user_type` must be "organization_owner"
- They must have created an organization already
- Their organization must not already be linked to another company

## Future Enhancements

1. **Email Notifications**
   - Send email to organization owner when invited
   - Send confirmation email after accepting invitation

2. **Invitation Table**
   - Create a separate `invitations` table to track pending invitations
   - Allow owners to accept or reject invitations
   - Add expiration dates for invitations

3. **Invitation Management**
   - View pending invitations
   - Resend invitations
   - Cancel invitations

## Testing

To test this feature:

1. Create a user with `user_type` = "organization_owner"
2. Have that user create an organization
3. Login as company admin
4. Click "Invite Organization"
5. Enter the organization owner's email
6. Click "Send Invitation"
7. The organization should appear in the company admin dashboard
