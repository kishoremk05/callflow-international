import axios from "axios";

// Create event in Google Calendar
export const createGoogleCalendarEvent = async (req, res) => {
  try {
    const { accessToken, eventData } = req.body;

    // Validate access token
    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    // Validate event data
    if (!eventData || !eventData.summary) {
      return res.status(400).json({ error: "Event summary is required" });
    }

    // Validate start and end times
    if (!eventData.start || !eventData.end) {
      return res
        .status(400)
        .json({ error: "Event start and end times are required" });
    }

    // Prepare the event object for Google Calendar API
    const googleCalendarEvent = {
      summary: eventData.summary,
      description: eventData.description || "",
      location: eventData.location || "",
      start: {
        dateTime: eventData.start, // ISO 8601 format
      },
      end: {
        dateTime: eventData.end, // ISO 8601 format
      },
    };

    // Add conferencing if requested
    if (eventData.addConference) {
      googleCalendarEvent.conferenceData = {
        createRequest: {
          requestId: `conference-${Date.now()}`,
          conferenceSolutionKey: {
            key: "hangoutsMeet",
          },
        },
      };
    }

    // Add attendees if provided
    if (eventData.attendees && eventData.attendees.length > 0) {
      googleCalendarEvent.attendees = eventData.attendees.map((email) => ({
        email,
      }));
    }

    // Send request to Google Calendar API
    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      googleCalendarEvent,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: eventData.addConference ? { conferenceDataVersion: 1 } : {},
      },
    );

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        id: response.data.id,
        summary: response.data.summary,
        start: response.data.start,
        end: response.data.end,
        htmlLink: response.data.htmlLink,
        conferenceData: response.data.conferenceData,
      },
    });
  } catch (error) {
    console.error(
      "Calendar event creation error:",
      error.response?.data || error.message,
    );

    // Handle Google API errors
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Access token has expired. Please reconnect your calendar.",
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You don't have permission to access Google Calendar.",
      });
    }

    if (error.response?.data?.error?.message) {
      return res.status(400).json({
        error: "Google Calendar API error",
        message: error.response.data.error.message,
      });
    }

    return res.status(500).json({
      error: "Failed to create event",
      message: error.message,
    });
  }
};

// Get calendar availability
export const getCalendarAvailability = async (req, res) => {
  try {
    const { accessToken, timeMin, timeMax } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    if (!timeMin || !timeMax) {
      return res
        .status(400)
        .json({ error: "timeMin and timeMax are required" });
    }

    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/freebusy",
      {
        timeMin,
        timeMax,
        items: [{ id: "primary" }],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.status(200).json({
      success: true,
      availability: response.data.calendars.primary.busy,
    });
  } catch (error) {
    console.error(
      "Calendar availability error:",
      error.response?.data || error.message,
    );

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Access token has expired.",
      });
    }

    return res.status(500).json({
      error: "Failed to fetch availability",
      message: error.message,
    });
  }
};

export default {
  createGoogleCalendarEvent,
  getCalendarAvailability,
};
