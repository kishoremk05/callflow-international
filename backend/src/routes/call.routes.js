import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  initiateCall,
  endCall,
  updateCallStatus,
  getCallHistory,
  getCallStats,
} from "../controllers/call.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/initiate", initiateCall);
router.post("/end", endCall);
router.post("/status", updateCallStatus);
router.get("/history", getCallHistory);
router.get("/stats", getCallStats);

export default router;
