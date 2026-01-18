const express = require("express");
const { authenticate } = require("../middleware/auth");
const pricingService = require("../utils/pricingService");

const router = express.Router();

/**
 * GET /api/pricing/estimate
 * Get cost estimate for a destination number
 */
router.get("/estimate", authenticate, async (req, res) => {
  try {
    const { toNumber, estimatedMinutes = 5 } = req.query;

    if (!toNumber) {
      return res.status(400).json({
        success: false,
        error: "Destination number is required",
      });
    }

    const result = await pricingService.estimateCallCost(
      toNumber,
      parseFloat(estimatedMinutes),
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error in pricing estimate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to estimate call cost",
    });
  }
});

/**
 * POST /api/pricing/lookup
 * Look up pricing for a destination number
 */
router.post("/lookup", authenticate, async (req, res) => {
  try {
    const { destinationNumber } = req.body;

    if (!destinationNumber) {
      return res.status(400).json({
        success: false,
        error: "Destination number is required",
      });
    }

    const result = await pricingService.getCallPricing(destinationNumber);

    res.json(result);
  } catch (error) {
    console.error("Error in pricing lookup:", error);
    res.status(500).json({
      success: false,
      error: "Failed to lookup pricing",
    });
  }
});

/**
 * GET /api/pricing/balance
 * Get current wallet balance
 */
router.get("/balance", authenticate, async (req, res) => {
  try {
    const { organizationId } = req.query;

    const result = await pricingService.getWalletBalance(
      req.user.id,
      organizationId || null,
    );

    res.json(result);
  } catch (error) {
    console.error("Error getting balance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get wallet balance",
    });
  }
});

/**
 * POST /api/pricing/check-balance
 * Check if user has sufficient balance for a call
 */
router.post("/check-balance", authenticate, async (req, res) => {
  try {
    const { toNumber, estimatedMinutes = 5, organizationId } = req.body;

    if (!toNumber) {
      return res.status(400).json({
        success: false,
        error: "Destination number is required",
      });
    }

    // Get estimated cost
    const costEstimate = await pricingService.estimateCallCost(
      toNumber,
      estimatedMinutes,
    );

    if (!costEstimate.success) {
      return res.status(400).json(costEstimate);
    }

    // Check balance
    const balanceCheck = await pricingService.checkSufficientBalance(
      req.user.id,
      organizationId || null,
      costEstimate.estimation.estimatedCost,
    );

    res.json({
      success: true,
      ...balanceCheck,
      costEstimate: costEstimate.estimation,
    });
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check balance",
    });
  }
});

module.exports = router;
