import express from "express";
import { authenticate } from "../middleware/auth.js";
import { verifyToken } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/verify-token", authenticate, verifyToken);

export default router;
