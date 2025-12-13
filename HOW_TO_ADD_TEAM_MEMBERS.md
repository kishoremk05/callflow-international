# How to Add Team Members - Step-by-Step Guide

## Overview

To add team members for conference calling, you need to have an **Enterprise Account** and be the **Enterprise Admin**. Team members can then be invited to join your organization and participate in internal conference calls.

---

## Prerequisites

1. ✅ You must be logged in to the application
2. ✅ You must have an Enterprise Account created
3. ✅ You must be the Enterprise Admin
4. ✅ The person you want to add must already have a user account (they need to sign up first)

---

## Method 1: Using the Enterprise Dashboard (Recommended)

### Step 1: Navigate to Enterprise Dashboard

1. Log in to your account
2. Click on **"Enterprise"** in the navigation menu
3. You'll be redirected to `/enterprise` page

### Step 2: Access the Add Member Section

1. Look for the **"Add Team Member"** card or dialog
2. Click the **"Add Member"** button (with UserPlus icon)

### Step 3: Enter Member Details

1. **Email Address**: Enter the email address of the user you want to add

   - ⚠️ **Important**: The user must already be registered in the system
   - If they're not registered, ask them to sign up first at `/signup`

2. **Optional Settings** (depending on your UI):
   - **Credit Limit**: Set spending limit for the member (default: 0)
   - **Can Make Calls**: Toggle to allow/restrict calling (default: true)
   - **Can Purchase Numbers**: Toggle to allow number purchases (default: false)

### Step 4: Submit

1. Click **"Add Member"** button
2. You'll see a success toast notification
3. The member will appear in the **Team Members** table

---

## Method 2: Using API Directly (For Developers)

### Endpoint

```
POST /api/enterprise/:enterpriseId/members
```

### Request Headers

```
Authorization: Bearer {your_access_token}
Content-Type: application/json
```

### Request Body

```json
{
  "email": "member@example.com",
  "creditLimit": 0,
  "canMakeCalls": true,
  "canPurchaseNumbers": false
}
```

### Example Using Fetch API

```javascript
const addMember = async (enterpriseId, memberEmail) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${API_URL}/api/enterprise/${enterpriseId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: memberEmail,
        creditLimit: 0,
        canMakeCalls: true,
        canPurchaseNumbers: false,
      }),
    }
  );

  const data = await response.json();

  if (data.success) {
    console.log("Member added:", data.member);
  } else {
    console.error("Error:", data.error);
  }
};
```

---

## After Adding Team Members

Once team members are added:

1. **View Team Members**

   - Go to Enterprise Dashboard
   - See all members in the "Team Members" table
   - View their details: name, email, credit usage, permissions

2. **Use in Voice Call**

   - Navigate to `/voice-call` page
   - Switch to **"Inside Team"** tab
   - You'll see all team members with checkboxes
   - Select members for conference calls

3. **Create Conference Room**
   - Enter a room name (e.g., "Marketing Meeting")
   - Select team members to invite
   - Click **"Create Conference"**
   - Selected members will be invited to join the conference

---

## Creating an Enterprise Account (If You Don't Have One)

If you don't have an enterprise account yet:

### Option 1: Via Enterprise Dashboard

1. Go to `/enterprise` page
2. Click **"Create Enterprise Account"** button
3. Enter your company name
4. Set maximum members (default: 50)
5. Click **"Create"**

### Option 2: Via API

```javascript
const createEnterprise = async (companyName) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}/api/enterprise/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: companyName,
      maxMembers: 50,
    }),
  });

  const data = await response.json();
  return data;
};
```

---

## Workflow for New User to Join Team

1. **New User Signs Up**

   - New user goes to `/signup`
   - Creates an account with email and password
   - Verifies email (if email verification is enabled)

2. **Admin Adds User to Enterprise**

   - Admin goes to Enterprise Dashboard
   - Clicks "Add Member"
   - Enters the new user's email address
   - Submits the form

3. **User Gets Access**
   - User automatically becomes an `enterprise_member` (role assigned)
   - User can now see team members in Voice Call page
   - User can participate in internal conferences

---

## Database Tables Involved

### `enterprise_accounts`

```sql
- id: UUID (primary key)
- name: TEXT (company name)
- admin_id: UUID (references auth.users)
- max_members: INTEGER
- shared_balance: DECIMAL
```

### `enterprise_members`

```sql
- id: UUID (primary key)
- enterprise_id: UUID (references enterprise_accounts)
- user_id: UUID (references auth.users)
- credit_limit: DECIMAL
- used_credits: DECIMAL
- can_make_calls: BOOLEAN
- can_purchase_numbers: BOOLEAN
- joined_at: TIMESTAMP
```

### `user_roles`

```sql
- user_id: UUID (references auth.users)
- role: TEXT (e.g., 'enterprise_admin', 'enterprise_member')
```

---

## Common Issues & Solutions

### Issue 1: "User not found" error

**Solution**: The user must create an account first at `/signup` before they can be added to an enterprise.

### Issue 2: "Access denied" error

**Solution**: Only the Enterprise Admin (the person who created the enterprise) can add members.

### Issue 3: No team members showing in Voice Call

**Solution**:

- Ensure you're logged in to an enterprise account
- Check that members are properly added in Enterprise Dashboard
- Refresh the page

### Issue 4: Can't find Enterprise Dashboard

**Solution**:

- Navigate to `/enterprise` in your browser
- Or add a navigation link to the Header component

---

## Security & Permissions

### Row Level Security (RLS)

The database has RLS policies that ensure:

- Only enterprise admins can add/remove members
- Members can only see other members in their enterprise
- Members cannot access other enterprises' data

### API Authentication

All API endpoints require:

- Valid Supabase authentication token
- Proper role assignment (admin for member management)

---

## Testing

To test the member addition:

1. **Create Test Accounts**

   ```bash
   # User 1 (will be admin)
   Email: admin@test.com
   Password: Test123!

   # User 2 (will be member)
   Email: member1@test.com
   Password: Test123!
   ```

2. **Login as Admin**

   - Create enterprise account
   - Add member1@test.com

3. **Test Voice Call**

   - Go to /voice-call
   - Check if member appears in "Inside Team" tab

4. **Verify Database**

   ```sql
   -- Check enterprise_members table
   SELECT * FROM enterprise_members;

   -- Check user_roles table
   SELECT * FROM user_roles;
   ```

---

## API Response Examples

### Success Response

```json
{
  "success": true,
  "member": {
    "id": "uuid-here",
    "enterprise_id": "enterprise-uuid",
    "user_id": "user-uuid",
    "credit_limit": 0,
    "can_make_calls": true,
    "can_purchase_numbers": false,
    "joined_at": "2025-12-11T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "error": "User not found"
}
```

```json
{
  "error": "Access denied"
}
```

---

## Summary Checklist

Before adding team members:

- [ ] Create an enterprise account
- [ ] Ensure you are the enterprise admin
- [ ] Have the team member register an account first
- [ ] Note down their email address

To add a member:

- [ ] Go to Enterprise Dashboard (`/enterprise`)
- [ ] Click "Add Member" button
- [ ] Enter team member's email
- [ ] Configure permissions (optional)
- [ ] Click submit
- [ ] Verify member appears in team list

To use in conference calls:

- [ ] Navigate to Voice Call page (`/voice-call`)
- [ ] Go to "Inside Team" tab
- [ ] Select team members
- [ ] Create conference room
- [ ] Start the call

---

## Need Help?

If you encounter any issues:

1. Check browser console for error messages
2. Verify backend server is running (`npm start` in backend folder)
3. Check database tables in Supabase dashboard
4. Review API logs in terminal
5. Ensure all environment variables are set correctly

For more technical details, see `VOICE_CALL_IMPLEMENTATION.md`
