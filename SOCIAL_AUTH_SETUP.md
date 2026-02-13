# Social Authentication Setup Guide

This guide will help you configure Google, Facebook, and X (Twitter) authentication in your Supabase project.

## Prerequisites

✅ The frontend code has been updated with social login buttons
✅ react-icons package installed for social media icons

## Step 1: Configure OAuth Providers in Supabase Dashboard

### A. Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add Authorized redirect URIs:
     ```
     https://tfeuximanivyhdsqfiby.supabase.co/auth/v1/callback
     ```
     For local development also add:
     ```
     http://localhost:8080/auth/callback
     ```

4. **Copy Credentials**
   - Copy the Client ID and Client Secret

5. **Configure in Supabase**
   - Go to: https://supabase.com/dashboard/project/tfeuximanivyhdsqfiby/auth/providers
   - Find "Google" provider
   - Enable it
   - Paste Client ID and Client Secret
   - Click "Save"

---

### B. Facebook OAuth Setup

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Click "My Apps" > "Create App"
   - Choose "Consumer" type
   - Fill in app details

2. **Add Facebook Login Product**
   - In your app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"

3. **Configure OAuth Settings**
   - Go to "Facebook Login" > "Settings"
   - Add Valid OAuth Redirect URIs:
     ```
     https://tfeuximanivyhdsqfiby.supabase.co/auth/v1/callback
     ```
     For local development also add:
     ```
     http://localhost:8080/auth/v1/callback
     ```

4. **Get App Credentials**
   - Go to "Settings" > "Basic"
   - Copy your "App ID" and "App Secret"

5. **Configure in Supabase**
   - Go to: https://supabase.com/dashboard/project/tfeuximanivyhdsqfiby/auth/providers
   - Find "Facebook" provider
   - Enable it
   - Paste App ID as Client ID
   - Paste App Secret as Client Secret
   - Click "Save"

6. **Make App Public** (Important!)
   - In Facebook App Dashboard, go to "App Mode"
   - Switch from "Development" to "Live"

---

### C. X (Twitter) OAuth Setup

1. **Go to Twitter Developer Portal**
   - Visit: https://developer.twitter.com/en/portal/dashboard
   - Create a new app or select existing one

2. **Enable OAuth 2.0**
   - In your app settings, go to "User authentication settings"
   - Click "Set up"
   - Enable "OAuth 2.0"
   - App permissions: "Read users"
   - Type of App: "Web App"

3. **Configure Callback URLs**
   - Callback / Redirect URL:
     ```
     https://tfeuximanivyhdsqfiby.supabase.co/auth/v1/callback
     ```
   - Website URL: Your production URL (e.g., https://your-app.vercel.app)

4. **Get API Keys**
   - Go to "Keys and tokens" tab
   - Copy "API Key" (Client ID) and "API Secret Key" (Client Secret)
   - Also generate "OAuth 2.0 Client ID and Client Secret" if not already generated

5. **Configure in Supabase**
   - Go to: https://supabase.com/dashboard/project/tfeuximanivyhdsqfiby/auth/providers
   - Find "Twitter" provider
   - Enable it
   - Paste API Key as Client ID
   - Paste API Key Secret as Client Secret
   - Click "Save"

---

## Step 2: Update Site URL in Supabase

1. Go to: https://supabase.com/dashboard/project/tfeuximanivyhdsqfiby/auth/url-configuration

2. Set the following:
   - **Site URL**: Your production URL (e.g., `https://your-app.vercel.app`)
   - **Redirect URLs**: Add all URLs where users can be redirected after authentication:
     ```
     https://your-app.vercel.app
     https://your-app.vercel.app/**
     http://localhost:8080
     http://localhost:8080/**
     ```

---

## Step 3: Update Environment Variables (if needed)

If you're using environment variables, make sure they're set in Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Ensure these are set:
   - `VITE_SUPABASE_URL`: https://tfeuximanivyhdsqfiby.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: Your anon key

---

## Step 4: Test the Integration

1. **Local Testing**:
   - Run `npm run dev`
   - Go to login page
   - Try signing in with Google, Facebook, or X
   - You should be redirected to the provider's login page
   - After successful login, you should be redirected back to your app

2. **Production Testing**:
   - Deploy to Vercel: `npm run build && vercel --prod`
   - Test all three providers
   - Verify users are created in Supabase Authentication dashboard

---

## Step 5: Handle User Profile Data

After successful OAuth login, you may want to store additional user information:

The profile will be automatically created in Supabase, but you can customize it by updating the `profiles` table triggers or handling it in your application code.

---

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Make sure the callback URL in OAuth provider settings matches exactly
   - Include both production and development URLs

2. **"App Not Approved" (Facebook)**
   - Switch your Facebook app from Development to Live mode
   - Complete App Review if required for additional permissions

3. **"Unauthorized" error**
   - Double-check Client ID and Client Secret are correct
   - Ensure the provider is enabled in Supabase dashboard

4. **Users not redirected back**
   - Check Site URL configuration in Supabase
   - Verify Redirect URLs include your domain

5. **CORS errors**
   - Make sure your domain is added to Supabase's allowed origins
   - Check that Site URL is correctly configured

---

## Security Best Practices

1. ✅ Never commit OAuth credentials to Git
2. ✅ Use environment variables for sensitive data
3. ✅ Enable email verification if needed
4. ✅ Set up proper redirect URL allowlists
5. ✅ Regularly rotate OAuth secrets
6. ✅ Monitor authentication logs in Supabase

---

## Next Steps

After users authenticate:

- They will be redirected to your app homepage
- Their profile will be created in the `profiles` table
- You can access user data via `supabase.auth.getUser()`
- The session will persist across page reloads

---

## Support Links

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/social-login
- **Google OAuth**: https://console.cloud.google.com/
- **Facebook Developers**: https://developers.facebook.com/
- **Twitter Developer Portal**: https://developer.twitter.com/

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

✅ Setup complete! Your users can now sign in with Google, Facebook, or X (Twitter).
