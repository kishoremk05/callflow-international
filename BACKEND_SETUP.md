# How to Start the Backend Server

## Quick Start

### Option 1: Start Backend Server

```powershell
# Open a new terminal
cd backend
node server-single.js
```

The server should start on `http://localhost:5000`

You should see:

```
🚀 Server running on http://localhost:5000
📱 Environment: development
✅ Server is ready to accept connections
```

### Option 2: Check if Server is Running

Open your browser and go to:

```
http://localhost:5000/health
```

You should see:

```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "environment": "development",
  "services": {
    "twilio": false,
    "livekit": false
  }
}
```

## Troubleshooting

### Error: "Route not found"

**Cause**: Backend server is not running or frontend cannot connect to it.

**Solution**:

1. Open a new PowerShell terminal
2. Navigate to backend folder: `cd backend`
3. Start server: `node server-single.js`
4. Keep this terminal open
5. Refresh your browser

### Error: "Port 5000 is already in use"

**Solution**:

1. Kill the process using port 5000:
   ```powershell
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```
2. Or change the port in `.env` file:
   ```
   PORT=5001
   ```

### Error: "Cannot connect to server"

**Check**:

1. Is backend server running? (See Option 2 above)
2. Is the API URL correct in your `.env` file?
   ```
   VITE_API_URL=http://localhost:5000
   ```
3. Are there any CORS errors in browser console?

## Testing Organization Creation

Once backend is running:

### For Company Users:

1. Login as a company user
2. Click "Create Organization" button
3. Fill in the form
4. Submit

You should NOT see "Route not found" error anymore.

### For Normal Users:

1. Wait for a company user to invite you
2. You'll see an orange "Organization Invites" button with a badge
3. Click it to view and accept/reject invites

## Environment Setup

Make sure your `.env` file in the backend folder has:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=5000
```

And your frontend `.env` has:

```env
VITE_API_URL=http://localhost:5000
```

## Common Commands

### Start Backend

```bash
cd backend
node server-single.js
```

### Start Frontend

```bash
npm run dev
# or
npm start
```

### Check Backend Logs

Look at the terminal where `node server-single.js` is running.
You should see logs for each request.

## Need Help?

If you still see "Route not found":

1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify the API URL matches between frontend and backend
4. Ensure no firewall is blocking port 5000
