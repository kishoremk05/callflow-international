# Deployment Guide

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Make sure your `.env` has all variables set
2. Build command: `npm run build`
3. Output directory: `dist`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables in Vercel

Go to Settings → Environment Variables and add:

```
VITE_SUPABASE_URL=https://tfeuximanivyhdsqfiby.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZXV4aW1hbml2eWhkc3FmaWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzI2NzAsImV4cCI6MjA4MDMwODY3MH0.Fxsg7b2zy1gGcwTkBxtyLIBhrRSKrb1bKbkmXKDgYho
VITE_API_URL=https://your-backend-url.onrender.com
```

(Replace `your-backend-url` with actual Render URL after backend deployment)

---

## Backend Deployment (Render)

### Step 1: Create render.yaml

Already exists in your backend folder!

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: global-connect-backend (or any name)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server-single.js`
   - **Plan**: Free (or paid for better performance)

### Step 3: Add Environment Variables in Render

Go to Environment section and add all these variables:

```bash
# Supabase (get from your Supabase dashboard)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio (get from twilio.com/console)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_API_KEY=your_twilio_api_key
TWILIO_API_SECRET=your_twilio_api_secret
TWILIO_TWIML_APP_SID=your_twilio_twiml_app_sid

# Stripe (add when you get credentials)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Razorpay (add when you get credentials)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Update Twilio TwiML App

After backend is deployed on Render, update Twilio webhooks:

1. Go to Twilio Console → Voice → TwiML Apps
2. Update Voice Request URL to: `https://your-backend.onrender.com/api/twilio/voice`

---

## Quick Deployment Steps

### Option 1: Using Git (Recommended)

1. **Initialize Git** (if not already):

```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Create GitHub Repository**:
   - Go to GitHub.com
   - Create new repository
   - Push your code:

```bash
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

3. **Deploy Frontend to Vercel**:

   - Go to vercel.com
   - Import from GitHub
   - Select your repository
   - Add environment variables
   - Deploy!

4. **Deploy Backend to Render**:
   - Go to render.com
   - New Web Service
   - Connect GitHub repository
   - Set root directory to `backend`
   - Add environment variables
   - Deploy!

### Option 2: Using Vercel CLI & Render CLI

**Install Vercel CLI:**

```bash
npm i -g vercel
```

**Deploy Frontend:**

```bash
vercel --prod
```

**For Render**: Use the web dashboard (easier)

---

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Update `VITE_API_URL` in Vercel with Render backend URL
- [ ] Update `FRONTEND_URL` in Render with Vercel frontend URL
- [ ] Update Twilio TwiML App webhooks with Render URL
- [ ] Test authentication
- [ ] Test calling functionality
- [ ] Set up custom domain (optional)

---

## Important Notes

1. **Render Free Tier**: Spins down after inactivity, first request may be slow
2. **Vercel Free Tier**: Perfect for frontend, unlimited bandwidth
3. **Environment Variables**: Never commit `.env` files to Git
4. **Twilio Webhooks**: Must use HTTPS (both Vercel and Render provide this)
5. **CORS**: Already configured in backend to accept your frontend URL

---

## Troubleshooting

**Frontend can't connect to backend:**

- Check `VITE_API_URL` in Vercel matches your Render URL
- Check `FRONTEND_URL` in Render matches your Vercel URL

**Twilio calls not working:**

- Update TwiML App URLs to use Render backend URL
- Check all Twilio environment variables are set in Render

**Database errors:**

- Verify Supabase credentials in Render
- Check RLS policies are enabled in Supabase
