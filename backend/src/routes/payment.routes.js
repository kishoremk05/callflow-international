import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createPaymentIntent,
  stripeWebhook,
  razorpayWebhook,
  getPaymentHistory,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-intent", authenticate, createPaymentIntent);
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
router.post("/razorpay-webhook", razorpayWebhook);
router.get("/history", authenticate, getPaymentHistory);

export default router;
