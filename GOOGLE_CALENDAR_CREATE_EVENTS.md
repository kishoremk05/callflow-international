# Google Calendar Event Creation - Implementation Guide

## Overview

You can now create and add events directly to your Google Calendar through the GlobalConnect Pro website! This guide covers the newly implemented feature.

---

## What Was Implemented

### 1. **Backend API Endpoints**

- **Location:** `/backend/src/routes/calendar.routes.js`
- **POST `/api/calendar/create-event`** - Creates a new Google Calendar event
- **POST `/api/calendar/availability`** - Checks calendar availability (for future use)

### 2. **Event Creation Form (Dialog)**

- **Location:** `/src/components/dashboard/CreateEventDialog.tsx`
- Modern modal interface with form validation
- Fields:
  - Event Title (required)
  - Description (optional)
  - Location (optional)
  - Start Date & Time (required)
  - End Date & Time (required)
  - Add Google Meet Conference (checkbox)
  - Attendees (email list)

### 3. **Calendar Component Updates**

- **Location:** `/src/components/dashboard/MeetingCalendar.tsx`
- Added "Create" button in the header
- OAuth scope updated to allow write access
- Automatic calendar refresh after event creation
- Toast notifications for success/error feedback

---

## How to Use

### For Users:

1. Navigate to the **Meeting Calendar** section in your dashboard
2. Click the **"Create"** button (top-right)
3. Fill in the event details:
   - **Title** (required) - e.g., "Team Standup"
   - **Description** (optional) - Add more context
   - **Location** (optional) - Physical location or Zoom link
   - **Start & End Times** - Set when the event occurs
4. **(Optional)** Check "Add Google Meet" to auto-create a video conference
5. **(Optional)** Add attendees by entering their email addresses
6. Click **"Create Event"** to save

The event will instantly appear on your Google Calendar and in the portal!

---

## Important Notes

### ⚠️ OAuth Permission Update Required

When you first use this feature, Google will ask you to re-authorize access because we've upgraded from **read-only** to **read and write** permissions.

- **Old scope:** `calendar.readonly` (viewing only)
- **New scope:** `calendar` (viewing + creating/editing)

### 🔐 Security

- Your access token is only used to communicate with Google Calendar API
- We never store your calendar data on our servers
- Events are created directly in your Google Calendar

### 📝 Attendees

- Enter emails one by one (one email per attendee)
- You'll receive a confirmation email when attendees are added
- Google sends invitations automatically

### 🎥 Google Meet Conference

- Checking this option automatically creates a Google Meet link
- Attendees will see the meeting link in their invitation
- The link is unique and only works for this event

---

## API Details (For Developers)

### Create Event Endpoint

```
POST /api/calendar/create-event
Content-Type: application/json

{
  "accessToken": "google_oauth_token",
  "eventData": {
    "summary": "Event Title",
    "description": "Event details",
    "location": "Physical or virtual location",
    "start": "2024-03-20T14:00:00Z",  // ISO 8601 format
    "end": "2024-03-20T15:00:00Z",
    "addConference": true,
    "attendees": ["user@example.com", "another@example.com"]
  }
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "event_google_id",
    "summary": "Event Title",
    "start": { "dateTime": "2024-03-20T14:00:00Z" },
    "end": { "dateTime": "2024-03-20T15:00:00Z" },
    "htmlLink": "https://calendar.google.com/calendar/event?eid=...",
    "conferenceData": { ... }
  }
}
```

### Error Handling

- **401 Unauthorized:** Token expired - user must reconnect
- **403 Forbidden:** Permission denied - check OAuth scope
- **400 Bad Request:** Missing or invalid event data
- **500 Server Error:** Google Calendar API error

---

## Files Created/Modified

### New Files:

- `/backend/src/controllers/calendar.controller.js` - Event creation logic
- `/backend/src/routes/calendar.routes.js` - API routes
- `/src/components/dashboard/CreateEventDialog.tsx` - UI form component

### Modified Files:

- `/backend/src/server.js` - Registered calendar routes
- `/src/components/dashboard/MeetingCalendar.tsx` - Integrated create dialog + button

---

## Testing Checklist

- [ ] Connect Google Calendar in dashboard
- [ ] Re-authorize with new write permission scope
- [ ] Click "Create" button - dialog appears
- [ ] Fill in event details
- [ ] Add attendees' emails
- [ ] Check "Add Google Meet" option
- [ ] Submit form
- [ ] Verify event appears on Google Calendar
- [ ] Check that invitations were sent to attendees
- [ ] Refresh page - event still shows in calendar list

---

## Troubleshooting

### Event creation fails with "Unauthorized"

- Google token expired
- Solution: Click "Disconnect" → "Connect with Google" → Re-authorize

### Calendar not refreshing after creation

- Check browser console for errors
- Verify backend endpoint `/api/calendar/create-event` is responding
- Check that token is still valid

### Attendees not receiving invitations

- Verify email addresses are correct
- Check attendees' spam/junk folders
- Ensure attendee emails are typed correctly in the form

### Google Meet link not created

- Check "Add Google Meet" checkbox before creating
- Verify auth token has correct permissions

---

## Future Enhancements

- [ ] Edit existing events
- [ ] Delete events
- [ ] Recurring events support
- [ ] Calendar availability/scheduling assistant
- [ ] Event reminders
- [ ] Bulk event import/export
