# Google Calendar API Integration - Developer Reference

## Architecture Overview

```
Frontend (React)
    ↓
MeetingCalendar.tsx (handles UI state)
    ↓
CreateEventDialog.tsx (form component)
    ↓
HTTP POST → /api/calendar/create-event
    ↓
Backend (Express.js)
    ↓
calendar.routes.js (route handler)
    ↓
calendar.controller.js (business logic)
    ↓
Google Calendar API
    ↓
User's Google Calendar
```

---

## Backend Components

### 1. Controller: `calendar.controller.js`

#### `createGoogleCalendarEvent(req, res)`

Creates a new event in user's primary Google Calendar.

**Parameters:**

- `req.body.accessToken` (string) - Google OAuth access token
- `req.body.eventData` (object) - Event details

**Event Data Structure:**

```typescript
{
  summary: string;           // Event title (required)
  description?: string;      // Additional details
  location?: string;         // Physical or virtual location
  start: string;             // ISO 8601 datetime (required)
  end: string;               // ISO 8601 datetime (required)
  addConference?: boolean;   // Add Google Meet link
  attendees?: string[];      // Email addresses
}
```

**Returns:**

```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "google_event_id",
    "summary": "Event Title",
    "start": { "dateTime": "2024-03-20T14:00:00Z" },
    "end": { "dateTime": "2024-03-20T15:00:00Z" },
    "htmlLink": "https://calendar.google.com/...",
    "conferenceData": {
      "entryPoints": [
        {
          "entryPointType": "video",
          "uri": "https://meet.google.com/..."
        }
      ]
    }
  }
}
```

**Error Responses:**

- `400` - Missing/invalid event data
- `401` - Access token expired or invalid
- `403` - Permission denied
- `500` - Google API error

---

#### `getCalendarAvailability(req, res)`

Checks free/busy times for scheduling.

**Parameters:**

- `req.body.accessToken` (string) - Google OAuth token
- `req.body.timeMin` (string) - ISO 8601 start time
- `req.body.timeMax` (string) - ISO 8601 end time

**Returns:**

```json
{
  "success": true,
  "availability": [
    {
      "start": "2024-03-20T14:00:00Z",
      "end": "2024-03-20T15:00:00Z"
    }
  ]
}
```

---

### 2. Routes: `calendar.routes.js`

```javascript
POST / api / calendar / create - event;
POST / api / calendar / availability;
```

---

## Frontend Components

### 1. MeetingCalendar.tsx

**New State:**

```typescript
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [isCreatingEvent, setIsCreatingEvent] = useState(false);
```

**New Handler:**

```typescript
const handleCreateEvent = async (eventData: CreateEventData) => {
  // 1. Validate access token
  // 2. Call /api/calendar/create-event
  // 3. Handle response
  // 4. Refresh calendar
  // 5. Show toast notification
};
```

**UI Updates:**

- Added "Create" button in header
- Changed OAuth scope to `calendar` (from `calendar.readonly`)
- Integrated CreateEventDialog component

---

### 2. CreateEventDialog.tsx

**Props:**

```typescript
interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventData) => Promise<void>;
  loading?: boolean;
}
```

**Features:**

- Form validation
- Date/time picker
- Email validation
- Attendee management
- Conference toggle
- Error handling

---

## Google Calendar API Integration

### OAuth Scope

```
https://www.googleapis.com/auth/calendar
```

Grants permission to:

- Create events
- Modify events
- Delete events
- View calendar
- Read event details

### API Endpoints Used

#### Create Event

```
POST https://www.googleapis.com/calendar/v3/calendars/primary/events
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "summary": "Event Title",
  "start": { "dateTime": "2024-03-20T14:00:00Z" },
  "end": { "dateTime": "2024-03-20T15:00:00Z" },
  "location": "Room 101",
  "description": "Event details",
  "attendees": [
    { "email": "attendee@example.com" }
  ],
  "conferenceData": {
    "createRequest": {
      "requestId": "unique-id",
      "conferenceSolutionKey": { "key": "hangoutsMeet" }
    }
  }
}
```

#### Query Parameters

- `conferenceDataVersion=1` - Required when creating conference

#### Response

```json
{
  "id": "event_id",
  "summary": "Event Title",
  "start": { "dateTime": "2024-03-20T14:00:00Z" },
  "end": { "dateTime": "2024-03-20T15:00:00Z" },
  "location": "Room 101",
  "htmlLink": "https://calendar.google.com/calendar/event?eid=...",
  "conferenceData": {
    "entryPoints": [
      {
        "entryPointType": "video",
        "uri": "https://meet.google.com/abc-defg-hij"
      }
    ]
  },
  "attendees": [
    {
      "email": "attendee@example.com",
      "responseStatus": "needsAction"
    }
  ]
}
```

---

## Error Handling

### Token Expiration (401)

```
GET /api/calendar/create-event → 401
Frontend response:
- Clear stored token
- Show "reconnect" message
- Redirect to reconnect flow
```

### Invalid Permission (403)

```
User doesn't have Google Meet permission
Solution: Re-authenticate with new scope
```

### Invalid Event Data (400)

```
{
  "error": "Event summary is required"
}
```

### Network Errors

```
Implement retry logic with exponential backoff
Show user-friendly error messages
Log detailed errors for debugging
```

---

## Testing

### Unit Tests Checklist

- [ ] Token validation (missing, invalid, expired)
- [ ] Event data validation (required fields)
- [ ] Date/time validation (end > start)
- [ ] Email validation for attendees
- [ ] Conference creation when requested
- [ ] Attendee invitation sending

### Integration Tests

- [ ] Create simple event
- [ ] Create event with attendees
- [ ] Create event with conference
- [ ] Handle token expiration
- [ ] Handle API errors gracefully

### End-to-End Tests

- [ ] User flow: connect → create → verify in Google Calendar
- [ ] Error flow: expired token → reconnect → retry
- [ ] Mobile responsiveness of create dialog

---

## Security Considerations

1. **Token Handling**
   - Tokens never sent to server (frontend-only)
   - Tokens stored in sessionStorage (not persisted)
   - Tokens cleared on logout

2. **Data Protection**
   - CORS enabled to prevent unauthorized access
   - Helmet security headers configured
   - Input validation on all fields

3. **Email Validation**
   - Regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Prevents injection attacks

4. **Rate Limiting**
   - Consider implementing in production
   - Prevent spam event creation

---

## Performance Optimization

### Current Implementation

- Direct Google API calls from frontend (no backend relay)
- Minimal latency
- Direct error handling

### Potential Improvements

- Backend event creation caching
- Batch event operations
- Schedule event creation (queue system)
- Optimize API payload size

---

## Monitoring & Logging

### Backend Logging

```javascript
console.error("Calendar event creation error:", error);
```

### Frontend Logging

```javascript
console.error("Event creation error:", err);
toast.error(err.message);
```

### Production Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Track failed event creations
- Monitor Google API quota usage

---

## Future Enhancements

1. **Event Editing**
   - PATCH `/api/calendar/update-event/{eventId}`
   - Modify existing events

2. **Event Deletion**
   - DELETE `/api/calendar/delete-event/{eventId}`
   - Cancel events

3. **Recurring Events**
   - Support `recurrence` field in event data
   - Daily, weekly, monthly patterns

4. **Batch Operations**
   - Create multiple events at once
   - Bulk import calendar events

5. **Calendar Sync**
   - Background sync every N minutes
   - Webhook support for real-time updates

6. **Advanced Scheduling**
   - Find meeting slots
   - Suggest best times
   - Timezone support

---

## Troubleshooting Guide

### Event not appearing in Google Calendar

1. Check network tab for failed requests
2. Verify token in browser DevTools
3. Check backend logs for errors
4. Verify Google OAuth scope includes write

### Attendees not receiving invitations

1. Verify email format
2. Check Google Account allows sending
3. Look for SMTP configuration issues
4. Check spam filters

### Google Meet link not created

1. Verify `addConference: true`
2. Check `conferenceDataVersion: 1` in params
3. Verify OAuth scope has calendar write

---

## References

- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [Create Events Guide](https://developers.google.com/calendar/api/guides/create-events)
- [Hangouts Meet Integration](https://developers.google.com/calendar/api/guides/conference-data)
