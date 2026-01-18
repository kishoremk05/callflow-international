# Company Admin Registration - Complete Guide

## 🎯 What's Been Created

### 1. **New Registration Page**

- **URL**: `http://localhost:8080/company-admin/register`
- **File**: [CompanyAdminRegister.tsx](src/pages/CompanyAdminRegister.tsx)
- Allows any logged-in user to register as a company admin
- Requires: Company Name, Company Email, (Optional) Company Phone

### 2. **Quick Fix for "outlaws" User**

- **SQL File**: [FIX_OUTLAWS_ADMIN.sql](FIX_OUTLAWS_ADMIN.sql)
- Instantly adds the current "outlaws" user to company_admins table
- Run this in Supabase SQL Editor for immediate access

### 3. **Automatic Redirect**

- If a user tries to access the dashboard without being registered as company admin
- They'll be automatically redirected to the registration page

## 🚀 How to Use

### **Option A: Quick Fix for "outlaws" (Immediate)**

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the content from [FIX_OUTLAWS_ADMIN.sql](FIX_OUTLAWS_ADMIN.sql)
4. Click **Run**
5. Refresh the Company Admin Dashboard - it should work!

### **Option B: Register New Company Admin (For New Users)**

1. Navigate to: `http://localhost:8080/company-admin/register`
2. Fill in the form:
   - **Company Name**: Your company name
   - **Company Email**: Your company email
   - **Company Phone**: (Optional) Contact number
3. Click **"Register Company"**
4. You'll be redirected to the dashboard automatically!

### **Option C: Through Login Page (Signup Flow)**

1. Go to: `http://localhost:8080/company-admin/login`
2. Click **"Don't have a company account? Register"**
3. Fill in signup form:
   - Full Name
   - Email
   - Password
   - Company details
4. Account will be created and registered as company admin automatically

## 📝 How It Works

### **Registration Flow:**

```
User Logs In → Clicks Register → Enters Company Info →
Backend Creates Entry in company_admins Table →
User Gets Access to Dashboard → Can Invite Organizations
```

### **Invitation Flow:**

```
Company Admin → Invites Organization Owner (by email) →
Owner's Organization Gets Linked to Company →
Organization and Members Appear in Company Dashboard →
Company Admin Can Share Wallet Balance
```

## 🔐 Security

- **Authentication Required**: Users must be logged in to register
- **One Company Per User**: Each user can only register one company
- **Profile Update**: User's profile type is automatically updated to "company_admin"

## 📊 Database Structure

### **company_admins table:**

- `id` - UUID (auto-generated)
- `user_id` - References profiles.id
- `company_name` - Company name
- `company_email` - Company email
- `company_phone` - Optional phone number
- `is_active` - Active status (default: true)
- `created_at` - Registration timestamp

## 🎨 Features

### **Registration Page Includes:**

- ✅ Clean, modern UI matching your app design
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Success notifications
- ✅ Automatic redirect to dashboard
- ✅ Back to home button

### **Dashboard Auto-Protection:**

- ✅ Checks if user is registered as company admin
- ✅ Redirects to registration if not
- ✅ Shows helpful error message

## 🛠️ Testing Steps

1. **Test Registration:**

   ```
   1. Login as any user
   2. Go to /company-admin/register
   3. Fill form and submit
   4. Verify redirect to dashboard
   5. Check if data loads correctly
   ```

2. **Test Invitation:**

   ```
   1. From dashboard, click "Invite Organization"
   2. Search for organization owner email
   3. Select from dropdown
   4. Click "Send Invitation"
   5. Verify organization appears in dashboard
   ```

3. **Test Protection:**
   ```
   1. Login as regular user (not company admin)
   2. Try to access /company-admin/dashboard
   3. Should redirect to /company-admin/register
   ```

## 📁 Files Modified/Created

### **Created:**

- ✅ `src/pages/CompanyAdminRegister.tsx` - Registration page
- ✅ `FIX_OUTLAWS_ADMIN.sql` - Quick fix SQL script
- ✅ `ADD_COMPANY_ADMIN.sql` - Manual addition guide

### **Modified:**

- ✅ `src/App.tsx` - Added new route
- ✅ `src/pages/CompanyAdminDashboard.tsx` - Added auto-redirect

### **Backend (Already Exists):**

- ✅ `/api/company-admin/register` - Registration endpoint
- ✅ `/api/company-admin/invite-organization` - Invitation endpoint
- ✅ `/api/company-admin/search-owners` - Search endpoint

## 🎯 Next Steps

1. **For "outlaws" user**: Run the [FIX_OUTLAWS_ADMIN.sql](FIX_OUTLAWS_ADMIN.sql) script
2. **For new users**: Direct them to `/company-admin/register`
3. **Optional**: Add email verification for company registration
4. **Optional**: Add company logo upload
5. **Optional**: Add company settings page

## 💡 Tips

- **Already have an account?** Just use the registration page if you're not yet a company admin
- **Forgot company details?** You can update them later through the profile endpoint
- **Need to register multiple companies?** Each user can only have one company - use different user accounts
- **Want to test?** Use the SQL script to quickly add test company admins

## 🐛 Troubleshooting

### "Not a company admin" error:

**Solution**: Run the FIX_OUTLAWS_ADMIN.sql or use the registration page

### Can't see organizations after inviting:

**Solution**: Refresh the page or click the "Refresh" button in the dashboard

### Registration fails:

**Solution**: Check if you're already registered. Each user can only register once.

---

**Ready to use!** 🎉 The system now supports both quick fixes for existing users and easy registration for new company admins.
