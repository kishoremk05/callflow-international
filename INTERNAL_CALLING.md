# Internal Calling Setup Guide (LiveKit)

## Overview

Internal calling allows enterprise team members to make **free, unlimited browser-based voice calls** without using phone numbers, Twilio, or wallet balance. This is powered by **LiveKit**, an open-source WebRTC platform.

## Features

✅ **Completely Free** - No billing, no wallet deduction, no Twilio usage  
✅ **Browser-Based** - WebRTC audio works directly in the browser  
✅ **Enterprise Only** - Only users from the same enterprise can join  
✅ **Unlimited Calls** - One-to-one or group calls with no time limits  
✅ **Real-Time** - Low latency audio streaming  
✅ **Simple UX** - Just enter a room name and join

## LiveKit Setup

### Option 1: Use LiveKit Cloud (Recommended)

1. **Sign up for LiveKit Cloud:**

   - Go to https://livekit.io/
   - Sign up for a free account
   - Free tier includes: 50GB bandwidth/month

2. **Create a LiveKit Project:**

   - In the dashboard, create a new project
   - Copy your API credentials:
     - `API Key` (starts with "API...")
     - `API Secret` (long secret key)
     - `WebSocket URL` (wss://your-project.livekit.cloud)

3. **Add to Backend .env:**
   ```env
   LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxxxx
   LIVEKIT_API_SECRET=your_secret_key_here
   LIVEKIT_URL=wss://your-project.livekit.cloud
   ```

### Option 2: Self-Host LiveKit Server

If you prefer to self-host:

```bash
# Install LiveKit Server
docker run --rm -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="APIkey: secret" \
  livekit/livekit-server

# Or use docker-compose (see LiveKit docs)
```

Update your `.env`:

```env
LIVEKIT_API_KEY=APIkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
```

## Database Migration

Run the SQL migration in your Supabase dashboard:

**File:** `supabase/migrations/20251214000002_create_internal_calls.sql`

This creates:

- `internal_calls` table - Tracks active call rooms
- `internal_call_participants` table - Records who joined/left
- RLS policies - Ensures enterprise-level access control

## How It Works

### 1. Frontend Flow

**User Journey:**

1. User navigates to Voice Call page
2. Clicks "Browser Call (Free)" tab
3. Enters room name (e.g., "Daily Standup")
4. Enters display name
5. Clicks "Join / Create Room"
6. System requests LiveKit token from backend
7. LiveKit connects user to WebRTC room
8. Other team members join the same room name
9. All participants hear each other in real-time

### 2. Backend Token Generation

**API Endpoint:** `POST /api/internal-call/token`

**Flow:**

1. Validates user's Supabase JWT
2. Checks user belongs to an enterprise
3. Creates room ID: `{enterpriseId}-{roomName}`
4. Generates LiveKit access token with room permissions
5. Records call in `internal_calls` table
6. Adds user to `internal_call_participants` table
7. Returns token + WebSocket URL to frontend

**Security:**

- Only authenticated users can request tokens
- Room IDs are scoped to enterprise (prevents cross-enterprise access)
- LiveKit tokens expire after 24 hours

### 3. WebRTC Connection

**LiveKit React SDK:**

- `<LiveKitRoom>` component handles WebRTC connection
- `useParticipants()` hook provides participant list
- `RoomAudioRenderer` component plays audio streams
- Automatic reconnection on network issues

## API Endpoints

### `POST /api/internal-call/token`

Generate LiveKit token to join a room

- **Auth:** Required (Bearer token)
- **Body:** `{ roomName: string, participantName: string }`
- **Returns:** `{ token, roomId, wsUrl, enterpriseName }`

### `GET /api/internal-call/active`

Get active internal calls for user's enterprise

- **Auth:** Required
- **Returns:** `{ calls: Array<InternalCall> }`

### `POST /api/internal-call/leave/:callId`

Mark user as left from a call

- **Auth:** Required
- **Returns:** `{ success: true }`

### `POST /api/internal-call/end/:callId`

End a call (creator only)

- **Auth:** Required
- **Returns:** `{ success: true }`

## Code Architecture

### Backend (`backend/server-single.js`)

```javascript
// LiveKit initialization
import { AccessToken } from "livekit-server-sdk";

// Token generation
const at = new AccessToken(apiKey, apiSecret, {
  identity: userId,
  name: participantName,
  ttl: "24h",
});

at.addGrant({
  roomJoin: true,
  room: roomId,
  canPublish: true,
  canSubscribe: true,
});

const token = await at.toJwt();
```

### Frontend (`src/components/dashboard/InternalCall.tsx`)

```tsx
import { LiveKitRoom, useParticipants } from "@livekit/components-react";

<LiveKitRoom token={token} serverUrl={wsUrl} audio={true} video={false}>
  <ParticipantsList />
  <CallControls />
  <RoomAudioRenderer />
</LiveKitRoom>;
```

## Testing

### 1. Setup LiveKit

Get credentials from LiveKit Cloud or self-host.

### 2. Configure Backend

Add LiveKit credentials to `backend/.env`:

```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
```

### 3. Restart Backend

```bash
cd backend
node server-single.js
```

You should see:

```
✅ LiveKit configured for internal calls
```

### 4. Run Frontend

```bash
npm run dev
```

### 5. Test Call Flow

1. Open browser, login as enterprise user
2. Navigate to Voice Call page
3. Click "Browser Call (Free)" tab
4. Enter room name: "Test Room"
5. Enter your name: "Alice"
6. Click "Join / Create Room"
7. Open incognito window (or another browser)
8. Login as another enterprise user
9. Join same room: "Test Room"
10. Both users should hear each other!

## Troubleshooting

### "Internal calling is not configured"

**Cause:** LiveKit credentials not set in `.env`

**Fix:** Add LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL to `backend/.env`

### "Failed to join call"

**Possible causes:**

1. User not part of an enterprise
2. Invalid LiveKit credentials
3. Network/firewall blocking WebRTC
4. Database tables not created

**Debug:**

- Check backend logs for errors
- Verify database migration was run
- Test LiveKit credentials with their CLI

### "Can't hear other participants"

**Causes:**

1. Microphone permissions denied
2. Audio input not working
3. Network firewall blocking UDP (WebRTC uses UDP)

**Fix:**

- Allow microphone permissions in browser
- Check browser audio settings
- Use corporate VPN if on restricted network

### "Token expired"

**Cause:** Token TTL is 24 hours by default

**Fix:** Leave and rejoin the call (generates new token)

## Cost Comparison

### Internal Call (LiveKit)

- **Free** for unlimited calls
- **No wallet deduction**
- **No Twilio usage**
- **Enterprise users only**
- **Browser-based WebRTC**

### External Conference (Twilio)

- **Paid** - Uses Twilio calling minutes
- **Wallet balance required**
- **Can call any phone number**
- **Per-minute billing**
- **PSTN phone calls**

## Production Deployment

### Backend (Render)

Ensure environment variables are set:

```
LIVEKIT_API_KEY=APIxxxxxxxxx
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=wss://your-project.livekit.cloud
```

### Frontend (Vercel/Netlify)

No additional setup needed. Frontend automatically uses `VITE_API_URL`.

### LiveKit Cloud

Free tier limits:

- 50GB bandwidth/month
- Unlimited participants
- Unlimited rooms

For production, consider paid plan if exceeding limits.

## Security Best Practices

1. **Enterprise Scoping:**

   - Room IDs include enterprise ID
   - Users from different enterprises can't join same room

2. **Token Expiration:**

   - Tokens expire after 24 hours
   - Must request new token to rejoin

3. **RLS Policies:**

   - Database uses Row Level Security
   - Users can only see calls from their enterprise

4. **Authentication:**
   - All API endpoints require valid Supabase JWT
   - Backend validates user identity before generating tokens

## Future Enhancements

- [ ] Video calling support
- [ ] Screen sharing
- [ ] Call recording
- [ ] Chat during calls
- [ ] Active speaker detection
- [ ] Noise cancellation
- [ ] Virtual backgrounds
- [ ] Call quality indicators
- [ ] Participant invite links
- [ ] Scheduled calls

## Resources

- **LiveKit Docs:** https://docs.livekit.io/
- **React SDK:** https://docs.livekit.io/guides/react/
- **Server SDK:** https://docs.livekit.io/guides/server/
- **WebRTC Guide:** https://webrtc.org/
