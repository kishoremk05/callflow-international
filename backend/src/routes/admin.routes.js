import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getAllUsers,
  getAllEnterprises,
  updateRates,
  getRates,
  getAllCallLogs,
  getAllPayments,
  getPurchasedNumbers,
  getDashboardStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(requireRole(["admin"]));

router.get("/users", getAllUsers);
router.get("/enterprises", getAllEnterprises);
router.get("/rates", getRates);
router.put("/rates", updateRates);
router.get("/call-logs", getAllCallLogs);
router.get("/payments", getAllPayments);
router.get("/purchased-numbers", getPurchasedNumbers);
router.get("/stats", getDashboardStats);

export default router;
