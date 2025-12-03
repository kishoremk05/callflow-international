import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getTwilioToken,
  getPublicNumber,
  validateNumber,
} from "../controllers/twilio.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/token", getTwilioToken);
router.get("/public-number", getPublicNumber);
router.post("/validate-number", validateNumber);

export default router;
