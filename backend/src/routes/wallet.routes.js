import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getWalletBalance,
  addCredits,
  deductCredits,
  getTransactionHistory,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/balance", getWalletBalance);
router.post("/add-credits", addCredits);
router.post("/deduct-credits", deductCredits);
router.get("/transactions", getTransactionHistory);

export default router;
