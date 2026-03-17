import express from "express";
import {
  createGoogleCalendarEvent,
  getCalendarAvailability,
} from "../controllers/calendar.controller.js";

const router = express.Router();

// POST: Create a new event in Google Calendar
router.post("/create-event", createGoogleCalendarEvent);

// POST: Get calendar availability/freeBusy info
router.post("/availability", getCalendarAvailability);

export default router;
