import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  purchaseNumber,
  releaseNumber,
  getPurchasedNumbers,
  searchAvailableNumbers,
} from "../controllers/number.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/available", searchAvailableNumbers);
router.post("/purchase", purchaseNumber);
router.post("/release/:numberId", releaseNumber);
router.get("/my-numbers", getPurchasedNumbers);

export default router;
