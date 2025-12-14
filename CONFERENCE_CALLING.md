# Conference Calling Guide

## How It Works

When you create a conference with multiple contacts, the system now **actually calls** each participant, just like the regular keypad calling feature.

### Step-by-Step Process

1. **Select Contacts**: In the Voice Call page, select the contacts you want to call
2. **Enter Room Name**: Give your conference a name (e.g., "Project Review")
3. **Click "Create & Start Conference"**: The system will:
   - Create a conference room in the database
   - **Make actual phone calls** to each selected participant
   - Each participant receives a call from your Twilio number
   - When they answer, they hear: "Welcome to [Room Name]. You are being connected to the conference."
   - All participants are automatically connected to the same conference call

### Technical Implementation

#### Backend Changes

**1. Actual Twilio Calling**

- When a conference is created, the backend now calls `twilioClient.calls.create()` for each participant
- Each call uses a TwiML URL that connects the participant to the conference room
- Calls are tracked with status callbacks for real-time updates

**2. TwiML Conference Connection**

- New endpoint: `/api/conference/twiml/:conferenceId`
- Generates TwiML with `<Dial><Conference>` to connect participants
- Each participant joins the same conference room by conference ID

**3. Call Status Tracking**

- Status callbacks track when calls are initiated, answered, and completed
- Conference start/end events are tracked
- Participant join/leave events are logged

### Required Environment Variables

Add these to your `backend/.env` file:

```env
# Your Twilio phone number (must be purchased from Twilio)
TWILIO_PHONE_NUMBER=+1234567890

# Your server's public URL (for webhooks)
API_URL=http://localhost:5000
# For production: API_URL=https://yourdomain.com
```

### Testing Locally

For local testing, Twilio webhooks won't work without a public URL. You have two options:

**Option 1: Use ngrok (Recommended for testing)**

```bash
ngrok http 5000
```

Then set `API_URL=https://your-ngrok-url.ngrok.io` in your `.env` file

**Option 2: Deploy to production**
Use a service like Vercel, Railway, or Render that provides a public URL

### Console Logs

When a conference is created, you'll see logs like:

```
📞 Calling contact: John Doe at +1234567890
📞 Calling contact: Jane Smith at +9876543210
```

### Key Differences from Previous Implementation

**Before:**

- Conference rooms were created in database only
- No actual calls were made
- Status showed "Conference created" but nothing happened

**Now:**

- Conference rooms are created AND calls are initiated
- Real phone calls to all participants
- Participants are connected to a live conference call
- Just like using the keypad, but for multiple people at once

### Cost Considerations

⚠️ **Important**: Conference calling uses Twilio minutes for each participant

- Each participant consumes calling minutes
- Check your Twilio pricing: typically $0.01-0.02/min per participant
- A 10-minute conference with 5 people = 50 minutes of usage

### Troubleshooting

**No calls being made?**

- Check that `TWILIO_PHONE_NUMBER` is set in your `.env`
- Verify your Twilio number is voice-enabled
- Check backend console logs for error messages

**Participants can't hear each other?**

- Ensure API_URL is publicly accessible (use ngrok for local testing)
- Check Twilio console for call logs
- Verify TwiML endpoint is responding correctly

**Balance deducted but no calls?**

- Check Twilio account balance
- Verify phone numbers are in correct format (+countrycode + number)
- Check Twilio debugger in console for detailed error messages
