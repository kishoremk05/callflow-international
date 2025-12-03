# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Create Environment Files

**Frontend - Create `.env` in root:**

```bash
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://tfeuximanivyhdsqfiby.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZXV4aW1hbml2eWhkc3FmaWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzI2NzAsImV4cCI6MjA4MDMwODY3MH0.Fxsg7b2zy1gGcwTkBxtyLIBhrRSKrb1bKbkmXKDgYho
```

**Backend - Create `backend/.env`:**

```bash
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://tfeuximanivyhdsqfiby.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key_here

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=your_twiml_app_sid

STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 3: Get API Keys

#### Supabase (Already configured):

- URL: `https://tfeuximanivyhdsqfiby.supabase.co`
- Get SERVICE_KEY from: Project Settings → API → service_role key

#### Twilio (Required for calling):

1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token from dashboard
3. Create API Key: Console → Account → API Keys → Create API Key
4. Create TwiML App: Console → Voice → TwiML Apps → Create new

#### Stripe (Optional - for international payments):

1. Sign up at https://stripe.com
2. Get Secret Key from: Developers → API Keys
3. Create webhook: Developers → Webhooks

#### Razorpay (Optional - for Indian payments):

1. Sign up at https://razorpay.com
2. Get Key ID and Secret from: Settings → API Keys

### Step 4: Start Development Servers

**Option A - Two Terminals:**

Terminal 1 (Frontend):

```bash
npm run dev
```

Terminal 2 (Backend):

```bash
cd backend
npm run dev
```

**Option B - PowerShell One-Liner:**

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"; cd backend; npm run dev
```

### Step 5: Test the Application

1. Open browser: `http://localhost:5173`
2. Sign up with email/password
3. You're in! 🎉

## 🧪 Testing Different Features

### Regular User Flow:

1. Sign up → Dashboard loads
2. Go to Payments → Add credits (UI only without keys)
3. Use Dialer → Make test calls
4. View Call History
5. Purchase Numbers

### Enterprise User Flow:

1. Go to `/enterprise`
2. Create enterprise account
3. Add team members by email
4. Share credits from personal to shared balance
5. Monitor usage

### Admin Flow:

1. **First, make yourself admin:**
   - Go to Supabase dashboard
   - Open SQL Editor
   - Run:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-uuid', 'admin');
   ```
2. Go to `/admin`
3. View all users, enterprises, rates
4. Update country rates
5. Monitor call logs with profit margins

## 📱 Making Your First Call

1. Ensure Twilio credentials are in `backend/.env`
2. Start both servers
3. Dashboard → Dialer
4. Select country code (e.g., +1 for US)
5. Enter phone number
6. Click "Call" button
7. Allow browser microphone permissions
8. Call connects! 📞

## 🐛 Troubleshooting

### Backend won't start:

- Check all environment variables are set
- Ensure port 5000 is not in use
- Run: `cd backend && npm install`

### Frontend errors:

- Check `.env` file exists in root
- Run: `npm install @twilio/voice-sdk`
- Clear browser cache

### Can't make calls:

- Verify Twilio credentials in backend/.env
- Check browser console for errors
- Ensure microphone permissions granted

### Database errors:

- Check Supabase service key is correct
- Verify migrations ran (check Supabase dashboard)

## 📚 What Next?

- Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for complete feature list
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for API documentation

## 🎯 Production Checklist

Before deploying:

- [ ] Update CORS origins in backend
- [ ] Add production Supabase keys
- [ ] Configure Twilio webhooks
- [ ] Set up Stripe/Razorpay webhooks
- [ ] Test payment flows
- [ ] Add SSL certificates
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy

## 💬 Need Help?

Check the detailed docs:

- API Endpoints: See README.md
- Database Schema: See supabase/migrations
- Environment Variables: See .env.example files

---

**Ready to build something amazing! 🚀**
