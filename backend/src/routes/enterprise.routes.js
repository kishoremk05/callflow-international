import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createEnterprise,
  getEnterpriseDetails,
  addMember,
  removeMember,
  updateMemberPermissions,
  shareCredits,
  getEnterpriseUsage,
} from "../controllers/enterprise.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/create", createEnterprise);
router.get("/:enterpriseId", getEnterpriseDetails);
router.post("/:enterpriseId/members", addMember);
router.delete("/:enterpriseId/members/:memberId", removeMember);
router.patch(
  "/:enterpriseId/members/:memberId/permissions",
  updateMemberPermissions
);
router.post("/:enterpriseId/share-credits", shareCredits);
router.get("/:enterpriseId/usage", getEnterpriseUsage);

export default router;
