# Wallet Sharing Fix

## Problem

When a company admin shared their wallet balance with an organization, the amount was only updating the `shared_balance` field in the `organizations` table but NOT transferring the actual funds to the organization owner's personal wallet.

## Root Cause

The `/api/company-admin/wallet/share` endpoint in `backend/server-single.js` was missing the logic to credit the organization owner's wallet when a company admin shares balance.

## Solution

Updated the endpoint to:

1. **Fetch the organization with owner_id**:

   ```javascript
   const { data: organization } = await supabase
     .from("organizations")
     .select("id, shared_balance, owner_id") // Added owner_id
     .eq("id", organization_id)
     .eq("company_admin_id", companyAdmin.id)
     .single();
   ```

2. **Get the owner's wallet**:

   ```javascript
   const { data: ownerWallet } = await supabase
     .from("wallets")
     .select("balance")
     .eq("user_id", organization.owner_id)
     .single();
   ```

3. **Credit the owner's wallet** (in both create and update flows):
   ```javascript
   const { error: ownerWalletError } = await supabase
     .from("wallets")
     .update({
       balance: parseFloat(ownerWallet.balance) + parseFloat(amount),
     })
     .eq("user_id", organization.owner_id);
   ```

## What Happens Now

When a company admin shares balance:

1. ✅ Company admin's available balance is checked
2. ✅ `wallet_shares` table is created/updated with the shared amount
3. ✅ Organization's `shared_balance` field is updated
4. ✅ **NEW**: Organization owner's wallet balance is credited with the shared amount

## Testing

1. Company admin shares balance (e.g., $100)
2. Check organization's `shared_balance` increases by $100
3. **Check organization owner's wallet balance increases by $100**
4. Company admin's available balance decreases by $100

## 401 Unauthorized Error

If you see "401 Unauthorized" errors:

- This typically means the authentication token has expired
- Solution: Log out and log back in to refresh the token
- The Supabase client is configured with `autoRefreshToken: true`, so tokens should auto-refresh
- If the problem persists, clear browser cache/localStorage and login again

## Backend Restart

The backend server has been restarted to apply these changes. You can test the wallet sharing functionality now.
