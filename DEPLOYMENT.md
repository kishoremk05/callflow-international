# Backend Deployment Instructions

## Render/Railway Deployment

### Prerequisites

- Node.js 18+
- Environment variables configured

### Environment Variables Required

```bash
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret
TWILIO_TWIML_APP_SID=your_twiml_app_sid

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Deployment Steps

#### For Render:

1. Connect your GitHub repository
2. Select "Web Service"
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`
5. Add all environment variables
6. Deploy

#### For Railway:

1. Connect your GitHub repository
2. Select the backend folder
3. Add environment variables
4. Railway will auto-detect Node.js and deploy

### Post-Deployment

1. Update CORS origin in backend to match your frontend URL
2. Configure Twilio webhook URLs to point to your backend
3. Configure Stripe/Razorpay webhook URLs
4. Test API health endpoint: `https://your-backend.com/health`

## Frontend Deployment (Vercel)

### Prerequisites

- GitHub repository connected to Vercel

### Environment Variables

Add these in Vercel dashboard:

```bash
VITE_API_URL=https://your-backend.render.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Build Settings

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Deployment

1. Push to GitHub
2. Vercel will automatically deploy
3. Visit your domain

## Testing Checklist

- [ ] Authentication works
- [ ] Wallet balance loads
- [ ] Twilio device initializes
- [ ] Payment integration responds
- [ ] Admin panel accessible
- [ ] Enterprise features work
- [ ] Call logging functions
- [ ] CORS configured correctly
