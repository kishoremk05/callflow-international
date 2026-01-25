import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { AccessToken as LiveKitAccessToken } from "livekit-server-sdk";
import { getRealCallCostFromTwilio } from "./src/utils/twilioCosting.js";

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

// Profit margin configuration (percentage to add on top of Twilio's base rates)
// This markup is applied to all call pricing to generate profit
const PROFIT_MARGIN_PERCENTAGE = parseFloat(
  process.env.PROFIT_MARGIN_PERCENTAGE || "15.0",
);
console.log(`💰 Profit margin configured at: ${PROFIT_MARGIN_PERCENTAGE}%`);

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Initialize Twilio (optional for development)
let twilioClient = null;
let TwilioAccessToken = null;
let VoiceGrant = null;

// Only initialize Twilio if credentials start with correct prefixes
if (
  process.env.TWILIO_ACCOUNT_SID?.startsWith("AC") &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_AUTH_TOKEN !== "your_twilio_auth_token"
) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    TwilioAccessToken = twilio.jwt.AccessToken;
    VoiceGrant = TwilioAccessToken.VoiceGrant;
    console.log("✅ Twilio initialized successfully");
  } catch (error) {
    console.warn("⚠️ Twilio initialization failed:", error.message);
  }
} else {
  console.log("ℹ️ Twilio not configured - voice features disabled");
}

// Initialize payment gateways (optional for development)
let stripe = null;
let razorpay = null;

if (
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY !== "your_stripe_secret_key"
) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log("✅ Stripe initialized successfully");
  } catch (error) {
    console.warn("⚠️ Stripe initialization failed:", error.message);
  }
} else {
  console.log("ℹ️ Stripe not configured - payment features limited");
}

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_ID !== "your_razorpay_key_id"
) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully");
  } catch (error) {
    console.warn("⚠️ Razorpay initialization failed:", error.message);
  }
} else {
  console.log("ℹ️ Razorpay not configured - payment features limited");
}

// Initialize LiveKit (for internal calls)
let livekitEnabled = false;
if (
  process.env.LIVEKIT_API_KEY &&
  process.env.LIVEKIT_API_SECRET &&
  process.env.LIVEKIT_URL &&
  process.env.LIVEKIT_API_KEY !== "your_livekit_api_key"
) {
  livekitEnabled = true;
  console.log("✅ LiveKit configured for internal calls");
} else {
  console.log("ℹ️ LiveKit not configured - internal calls disabled");
}

// Express app setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Allow all Vercel preview and production deployments
      if (
        origin &&
        (origin.includes(".vercel.app") ||
          origin.includes("vercel.app") ||
          allowedOrigins.includes(origin))
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, true); // Allow anyway in production to avoid blocking
      }
    },
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(
  "/api/payments/stripe-webhook",
  express.raw({ type: "application/json" }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// PRICING SERVICE FUNCTIONS
// ============================================================================

/**
 * Get pricing for a destination number from call_pricing table
 */
async function getCallPricing(destinationNumber) {
  try {
    const cleanNumber = destinationNumber.replace(/\D/g, "");

    const { data, error } = await supabase.rpc("get_call_pricing", {
      destination_number: cleanNumber,
    });

    if (error) throw error;

    if (data && data.length > 0) {
      return {
        success: true,
        pricing: {
          pricingId: data[0].pricing_id,
          ratePerMinute: parseFloat(data[0].rate_per_minute),
          markupPercentage: parseFloat(data[0].markup_percentage),
          finalRate: parseFloat(data[0].final_rate),
          countryName: data[0].country_name,
          phoneType: data[0].phone_type,
        },
      };
    }

    return {
      success: true,
      pricing: {
        pricingId: null,
        ratePerMinute: 0.5,
        markupPercentage: 15.0,
        finalRate: 0.575,
        countryName: "Unknown",
        phoneType: "unknown",
      },
      isFallback: true,
    };
  } catch (error) {
    console.error("Error getting call pricing:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Estimate call cost
 */
async function estimateCallCost(
  destinationNumber,
  estimatedDurationMinutes = 5,
) {
  try {
    const pricingResult = await getCallPricing(destinationNumber);

    if (!pricingResult.success) {
      throw new Error(pricingResult.error);
    }

    const { pricing } = pricingResult;
    const estimatedCost = pricing.finalRate * estimatedDurationMinutes;

    return {
      success: true,
      estimation: {
        destinationNumber,
        countryName: pricing.countryName,
        phoneType: pricing.phoneType,
        ratePerMinute: pricing.finalRate,
        estimatedDurationMinutes,
        estimatedCost: parseFloat(estimatedCost.toFixed(4)),
        pricingId: pricing.pricingId,
        isFallback: pricingResult.isFallback || false,
      },
    };
  } catch (error) {
    console.error("Error estimating call cost:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Reserve funds for a call
 */
async function reserveCallFunds(
  userId,
  organizationId,
  callSid,
  estimatedCost,
) {
  try {
    const { data, error } = await supabase.rpc("reserve_call_funds", {
      p_user_id: userId,
      p_organization_id: organizationId,
      p_call_sid: callSid,
      p_estimated_cost: estimatedCost,
    });

    if (error) throw error;

    return {
      success: true,
      transactionId: data,
      reservedAmount: estimatedCost,
    };
  } catch (error) {
    console.error("Error reserving call funds:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Settle actual call cost
 */
async function settleCallCost(callSid, actualCost) {
  try {
    const { data, error } = await supabase.rpc("settle_call_cost", {
      p_call_sid: callSid,
      p_actual_cost: actualCost,
    });

    if (error) throw error;

    return {
      success: true,
      transactionId: data,
    };
  } catch (error) {
    console.error("Error settling call cost:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// HEALTH CHECK & ROOT ROUTES
// ============================================================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      twilio: !!twilioClient,
      livekit: livekitEnabled,
    },
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "CallFlow International API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", req.user.id)
        .single();

      if (!userRole || !roles.includes(userRole.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.userRole = userRole.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// AUTH ROUTES
// ============================================================================

app.post("/api/auth/verify-token", authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      user_metadata: req.user.user_metadata,
    },
  });
});

// ============================================================================
// PRICING API ROUTES
// ============================================================================

// Get cost estimate for a destination number
app.get("/api/pricing/estimate", authenticate, async (req, res, next) => {
  try {
    const { toNumber, estimatedMinutes = 5 } = req.query;

    if (!toNumber) {
      return res.status(400).json({
        success: false,
        error: "Destination number is required",
      });
    }

    const result = await estimateCallCost(
      toNumber,
      parseFloat(estimatedMinutes),
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error in pricing estimate:", error);
    next(error);
  }
});

// Look up pricing for a destination number
app.post("/api/pricing/lookup", authenticate, async (req, res, next) => {
  try {
    const { destinationNumber } = req.body;

    if (!destinationNumber) {
      return res.status(400).json({
        success: false,
        error: "Destination number is required",
      });
    }

    const result = await getCallPricing(destinationNumber);
    res.json(result);
  } catch (error) {
    console.error("Error in pricing lookup:", error);
    next(error);
  }
});

// Check if user has sufficient balance for a call
app.post("/api/pricing/check-balance", authenticate, async (req, res, next) => {
  try {
    const { toNumber, estimatedMinutes = 5, organizationId } = req.body;

    if (!toNumber) {
      return res.status(400).json({
        success: false,
        error: "Destination number is required",
      });
    }

    // Get estimated cost
    const costEstimate = await estimateCallCost(toNumber, estimatedMinutes);

    if (!costEstimate.success) {
      return res.status(400).json(costEstimate);
    }

    // Check balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    const currentBalance = parseFloat(wallet?.balance || 0);
    const requiredAmount = costEstimate.estimation.estimatedCost;
    const hasSufficientFunds = currentBalance >= requiredAmount;

    res.json({
      success: true,
      hasSufficientFunds,
      currentBalance,
      requiredAmount,
      shortfall: hasSufficientFunds ? 0 : requiredAmount - currentBalance,
      costEstimate: costEstimate.estimation,
    });
  } catch (error) {
    console.error("Error checking balance:", error);
    next(error);
  }
});

// ============================================================================
// WALLET ROUTES
// ============================================================================

app.get("/api/wallet/balance", authenticate, async (req, res, next) => {
  try {
    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("balance, currency")
      .eq("user_id", req.user.id)
      .single();

    if (error) throw new Error("Failed to fetch wallet balance");
    res.json({ success: true, wallet });
  } catch (error) {
    next(error);
  }
});

app.post("/api/wallet/add-credits", authenticate, async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    const newBalance = parseFloat(wallet.balance) + parseFloat(amount);

    await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", req.user.id);

    res.json({ success: true, balance: newBalance });
  } catch (error) {
    next(error);
  }
});

app.get("/api/wallet/transactions", authenticate, async (req, res, next) => {
  try {
    const { data: transactions } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
});

// Share credit with organization member
app.post("/api/wallet/share-credit", authenticate, async (req, res, next) => {
  try {
    const { recipient_user_id, amount } = req.body;

    if (!recipient_user_id || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // Get sender's wallet
    const { data: senderWallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (!senderWallet || senderWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct from sender
    const { error: deductError } = await supabase
      .from("wallets")
      .update({ balance: senderWallet.balance - amount })
      .eq("user_id", req.user.id);

    if (deductError) throw deductError;

    // Get or create recipient wallet
    let { data: recipientWallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", recipient_user_id)
      .single();

    if (!recipientWallet) {
      const { data: newWallet } = await supabase
        .from("wallets")
        .insert({ user_id: recipient_user_id, balance: 0, currency: "USD" })
        .select()
        .single();
      recipientWallet = newWallet;
    }

    // Add to recipient
    const { error: addError } = await supabase
      .from("wallets")
      .update({ balance: recipientWallet.balance + amount })
      .eq("user_id", recipient_user_id);

    if (addError) throw addError;

    // Log transaction for sender
    await supabase.from("payments").insert({
      user_id: req.user.id,
      amount: -amount,
      currency: "USD",
      payment_method: "transfer_out",
      status: "completed",
      description: `Shared credit with user`,
    });

    // Log transaction for recipient
    await supabase.from("payments").insert({
      user_id: recipient_user_id,
      amount: amount,
      currency: "USD",
      payment_method: "transfer_in",
      status: "completed",
      description: `Received credit from organization member`,
    });

    res.json({
      success: true,
      message: `Successfully shared $${amount} credit`,
      new_balance: senderWallet.balance - amount,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// CALL QUEUE ROUTES (Company Users)
// ============================================================================

// Upload call queue CSV
app.post("/api/call-queue/upload", authenticate, async (req, res, next) => {
  try {
    const { contacts } = req.body;

    console.log("Call queue upload request:", {
      userId: req.user.id,
      contactsCount: contacts?.length,
    });

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: "Invalid contacts data" });
    }

    // Create queue
    const { data: queue, error: queueError } = await supabase
      .from("call_queues")
      .insert({
        user_id: req.user.id,
        total_contacts: contacts.length,
        completed_contacts: 0,
      })
      .select()
      .single();

    if (queueError) {
      console.error("Queue creation error:", queueError);
      throw queueError;
    }

    console.log("Queue created:", queue.id);

    // Add contacts
    const contactsToInsert = contacts.map((contact, index) => ({
      queue_id: queue.id,
      name: contact.name,
      number: contact.number,
      position: index + 1,
      status: "pending",
    }));

    const { error: contactsError } = await supabase
      .from("call_queue_contacts")
      .insert(contactsToInsert);

    if (contactsError) {
      console.error("Contacts insertion error:", contactsError);
      throw contactsError;
    }

    console.log("Contacts inserted successfully");

    res.json({
      success: true,
      queueId: queue.id,
      message: `Queue created with ${contacts.length} contacts`,
    });
  } catch (error) {
    console.error("Call queue upload error:", error);
    next(error);
  }
});

// Get call queue
app.get("/api/call-queue/:queueId", authenticate, async (req, res, next) => {
  try {
    const { queueId } = req.params;

    // Verify ownership
    const { data: queue } = await supabase
      .from("call_queues")
      .select("*")
      .eq("id", queueId)
      .eq("user_id", req.user.id)
      .single();

    if (!queue) {
      return res.status(404).json({ error: "Queue not found" });
    }

    // Get contacts
    const { data: contacts } = await supabase
      .from("call_queue_contacts")
      .select("*")
      .eq("queue_id", queueId)
      .order("position", { ascending: true });

    res.json({
      success: true,
      queue: contacts || [],
      info: queue,
    });
  } catch (error) {
    next(error);
  }
});

// Update contact status in queue
app.post(
  "/api/call-queue/:queueId/update",
  authenticate,
  async (req, res, next) => {
    try {
      const { queueId } = req.params;
      const { contactId, status } = req.body;

      // Verify ownership
      const { data: queue } = await supabase
        .from("call_queues")
        .select("*")
        .eq("id", queueId)
        .eq("user_id", req.user.id)
        .single();

      if (!queue) {
        return res.status(404).json({ error: "Queue not found" });
      }

      // Update contact
      const updateData = {
        status,
        ...(status === "calling"
          ? { called_at: new Date().toISOString() }
          : {}),
      };

      const { error } = await supabase
        .from("call_queue_contacts")
        .update(updateData)
        .eq("id", contactId)
        .eq("queue_id", queueId);

      if (error) throw error;

      // Update queue stats
      const { data: contacts } = await supabase
        .from("call_queue_contacts")
        .select("status")
        .eq("queue_id", queueId);

      const completed =
        contacts?.filter(
          (c) => c.status === "answered" || c.status === "skipped",
        ).length || 0;

      await supabase
        .from("call_queues")
        .update({
          completed_contacts: completed,
          status: completed === queue.total_contacts ? "completed" : "active",
        })
        .eq("id", queueId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
);

// Get active queues for user
app.get("/api/call-queue/active", authenticate, async (req, res, next) => {
  try {
    const { data: queues } = await supabase
      .from("call_queues")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    res.json({ success: true, queues: queues || [] });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// TWILIO ROUTES
// ============================================================================

app.post("/api/twilio/token", authenticate, async (req, res, next) => {
  try {
    if (!twilioClient || !TwilioAccessToken) {
      return res.status(503).json({ error: "Twilio not configured" });
    }
    const identity = req.user.id;
    const token = new TwilioAccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      {
        identity,
        ttl: 3600, // 1 hour TTL
      },
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    res.json({
      success: true,
      token: token.toJwt(),
      identity,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/twilio/public-number", authenticate, async (req, res, next) => {
  try {
    const { data: publicNumber } = await supabase
      .from("public_numbers")
      .select("*")
      .eq("is_active", true)
      .order("usage_count", { ascending: true })
      .limit(1)
      .single();

    if (!publicNumber) {
      return res.status(404).json({ error: "No public numbers available" });
    }

    await supabase
      .from("public_numbers")
      .update({ usage_count: publicNumber.usage_count + 1 })
      .eq("id", publicNumber.id);

    res.json({
      success: true,
      number: publicNumber.phone_number,
      numberId: publicNumber.id,
    });
  } catch (error) {
    next(error);
  }
});

// Twilio Voice Webhook - Handles outgoing calls
app.post(
  "/api/twilio/voice",
  express.urlencoded({ extended: false }),
  async (req, res) => {
    try {
      const { To, From, CallerId } = req.body;

      console.log("Twilio voice webhook called:", { To, From, CallerId });

      // Use CallerId parameter or fallback to From or environment variable
      // Treat "null" string as undefined, and skip From if it's a client identifier
      const callerIdToUse =
        CallerId && CallerId !== "null"
          ? CallerId
          : !From || From.startsWith("client:")
            ? process.env.TWILIO_PHONE_NUMBER
            : From;

      if (!callerIdToUse) {
        console.error("No caller ID available");
        const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>No caller ID configured. Please configure a Twilio phone number.</Say>
</Response>`;
        return res.type("text/xml").send(errorTwiml);
      }

      // Create TwiML response to make the call
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial 
    callerId="${callerIdToUse}"
    action="${
      process.env.API_URL || "http://localhost:5000"
    }/api/calls/status-callback"
    method="POST"
  >${To}</Dial>
</Response>`;

      console.log("Sending TwiML:", twiml);
      res.type("text/xml");
      res.send(twiml);
    } catch (error) {
      console.error("Voice webhook error:", error);
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're sorry, an error occurred. Please try again later.</Say>
</Response>`;
      res.type("text/xml");
      res.send(errorTwiml);
    }
  },
);

// Twilio Voice Fallback Webhook
app.post(
  "/api/twilio/voice-fallback",
  express.urlencoded({ extended: false }),
  (req, res) => {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're sorry, an error occurred. Please try again later.</Say>
</Response>`;
    res.type("text/xml");
    res.send(twiml);
  },
);

// ============================================================================
// CALL ROUTES
// ============================================================================

app.post("/api/calls/initiate", authenticate, async (req, res, next) => {
  try {
    const {
      toNumber,
      toCountryCode,
      callerIdType,
      callerIdNumber,
      organizationId,
    } = req.body;

    if (!toNumber) {
      return res.status(400).json({ error: "Destination number is required" });
    }

    // Combine country code and number for proper pricing lookup
    const fullNumber = toCountryCode ? `${toCountryCode}${toNumber}` : toNumber;

    console.log(
      `📞 Initiating call to ${toCountryCode || "(no code)"} ${toNumber} (Full: ${fullNumber})`,
    );

    // Get pricing using new system - MUST use fullNumber with country code
    const costEstimate = await estimateCallCost(fullNumber, 5); // 5-minute estimate

    if (!costEstimate.success) {
      return res.status(400).json({ error: "Failed to estimate call cost" });
    }

    console.log(
      `💰 Estimated cost: $${costEstimate.estimation.estimatedCost} (${costEstimate.estimation.countryName} - ${costEstimate.estimation.phoneType})`,
    );

    // Check wallet balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (
      !wallet ||
      parseFloat(wallet.balance) < costEstimate.estimation.estimatedCost
    ) {
      return res.status(400).json({
        error: "Insufficient balance",
        required: costEstimate.estimation.estimatedCost,
        available: parseFloat(wallet?.balance || 0),
      });
    }

    // Generate temporary CallSid for reserve (will be updated with real Twilio SID)
    const tempCallSid = `TEMP_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Reserve funds before making the call
    const reserveResult = await reserveCallFunds(
      req.user.id,
      organizationId || null,
      tempCallSid,
      costEstimate.estimation.estimatedCost,
    );

    if (!reserveResult.success) {
      return res.status(400).json({ error: reserveResult.error });
    }

    console.log(
      `✅ Reserved $${reserveResult.reservedAmount} (Transaction ID: ${reserveResult.transactionId})`,
    );

    // Create call log entry
    const { data: callLog, error: logError } = await supabase
      .from("call_logs")
      .insert({
        user_id: req.user.id,
        from_number: req.user.id,
        to_number: toNumber,
        to_country_code: toCountryCode || costEstimate.estimation.countryName,
        caller_id_type: callerIdType || "public",
        caller_id_number: callerIdNumber || "",
        status: "initiated",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error("Failed to create call log:", logError);
      return res.status(500).json({ error: "Failed to create call log" });
    }

    // Create call cost record
    const { error: costRecordError } = await supabase
      .from("call_cost_records")
      .insert({
        call_sid: tempCallSid,
        user_id: req.user.id,
        organization_id: organizationId || null,
        from_number: req.user.id,
        to_number: toNumber,
        destination_country_code: costEstimate.estimation.countryName,
        phone_number_type: costEstimate.estimation.phoneType,
        pricing_id: costEstimate.estimation.pricingId,
        rate_per_minute: costEstimate.estimation.ratePerMinute / (1 + 15 / 100), // base rate
        markup_percentage: 15.0,
        final_rate_per_minute: costEstimate.estimation.ratePerMinute,
        estimated_cost: costEstimate.estimation.estimatedCost,
        reserve_transaction_id: reserveResult.transactionId,
        call_started_at: new Date().toISOString(),
      });

    if (costRecordError) {
      console.warn("Failed to create cost record:", costRecordError);
    }

    res.json({
      success: true,
      callId: callLog.id,
      tempCallSid: tempCallSid,
      ratePerMinute: costEstimate.estimation.ratePerMinute,
      estimatedCost: costEstimate.estimation.estimatedCost,
      countryName: costEstimate.estimation.countryName,
      phoneType: costEstimate.estimation.phoneType,
      reserveTransactionId: reserveResult.transactionId,
    });
  } catch (error) {
    console.error("Error initiating call:", error);
    next(error);
  }
});

// Get call status endpoint
app.get("/api/calls/status/:callId", authenticate, async (req, res, next) => {
  try {
    const { callId } = req.params;

    const { data: callLog } = await supabase
      .from("call_logs")
      .select(
        "id, status, call_status, answered_at, started_at, ended_at, duration_seconds",
      )
      .eq("id", callId)
      .eq("user_id", req.user.id)
      .single();

    if (!callLog) {
      return res.status(404).json({ error: "Call not found" });
    }

    // Map database status to frontend states
    let callState = "idle";
    if (callLog.status === "initiated") {
      callState = "connecting";
    } else if (callLog.status === "ringing") {
      callState = "ringing";
    } else if (callLog.status === "in_progress" || callLog.answered_at) {
      callState = "answered";
    }

    res.json({
      success: true,
      callState,
      status: callLog.status,
      answeredAt: callLog.answered_at,
      startedAt: callLog.started_at,
      endedAt: callLog.ended_at,
      duration: callLog.duration_seconds || 0,
    });
  } catch (error) {
    next(error);
  }
});

// TwiML endpoint for call handling
app.post("/api/calls/twiml", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // Simple dial to connect the call
  twiml.say("Please hold while we connect your call.");

  res.type("text/xml");
  res.send(twiml.toString());
});

app.post("/api/calls/end", authenticate, async (req, res, next) => {
  try {
    const { callId, durationSeconds, twilioCallSid } = req.body;

    console.log(
      `📞 Ending call ${callId}, duration: ${durationSeconds}s, CallSid: ${twilioCallSid}`,
    );

    const { data: callLog } = await supabase
      .from("call_logs")
      .select("*, to_country_code, twilio_call_sid")
      .eq("id", callId)
      .eq("user_id", req.user.id)
      .single();

    if (!callLog) {
      return res.status(404).json({ error: "Call log not found" });
    }

    // Get the actual CallSid (use from request if available, fallback to stored one)
    const actualCallSid = twilioCallSid || callLog.twilio_call_sid;

    console.log(
      `📋 Call log found - CallSid: ${actualCallSid}, Duration: ${durationSeconds}`,
    );

    // Get cost record for this call
    const { data: costRecord } = await supabase
      .from("call_cost_records")
      .select("*, reserve_transaction_id")
      .or(
        `call_sid.eq.${actualCallSid}${actualCallSid && actualCallSid.startsWith("TEMP_") ? "" : `,twilio_call_sid.eq.${actualCallSid}`}`,
      )
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let billedAmount = 0;
    let actualCost = 0;
    let profitMargin = 0;
    let finalRate = 0;

    if (costRecord && costRecord.final_rate_per_minute) {
      // Use new pricing system
      finalRate = parseFloat(costRecord.final_rate_per_minute);
      const durationMinutes = (durationSeconds || 0) / 60;

      // Billing logic: Free for calls under 30 seconds
      let billedMinutes = 0;
      if (durationSeconds >= 30) {
        billedMinutes = Math.ceil(durationMinutes); // Round up to next full minute
      }

      actualCost = billedMinutes * finalRate;
      billedAmount = actualCost; // Same for now, can add additional fees if needed

      const baseRate = parseFloat(costRecord.rate_per_minute);
      const markupPercentage = parseFloat(
        costRecord.markup_percentage || PROFIT_MARGIN_PERCENTAGE,
      );
      const twilioCost = durationMinutes * baseRate;
      profitMargin = actualCost - twilioCost;

      console.log(`💰 Call Cost Breakdown:`);
      console.log(
        `   Duration: ${durationSeconds}s (${billedMinutes} billed minutes)`,
      );
      console.log(`   Base Rate: $${baseRate.toFixed(6)}/min (Twilio)`);
      console.log(`   Markup: ${markupPercentage.toFixed(2)}%`);
      console.log(`   Final Rate: $${finalRate.toFixed(6)}/min`);
      console.log(`   Twilio Cost: $${twilioCost.toFixed(4)}`);
      console.log(
        `   Profit Margin: $${profitMargin.toFixed(4)} (${profitMargin > 0 ? ((profitMargin / twilioCost) * 100).toFixed(1) : "0"}%)`,
      );
      console.log(`   💵 Total Charged: $${actualCost.toFixed(4)}`);

      // Settle the cost (refund or charge difference from reserved amount)
      if (costRecord.reserve_transaction_id) {
        const settleResult = await settleCallCost(actualCallSid, actualCost);
        if (settleResult.success) {
          console.log(
            `✅ Settled call cost. Transaction ID: ${settleResult.transactionId}`,
          );

          // Update cost record with settlement info
          await supabase
            .from("call_cost_records")
            .update({
              call_duration: durationSeconds,
              actual_cost: actualCost,
              settle_transaction_id: settleResult.transactionId,
              call_ended_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", costRecord.id);
        } else {
          console.error(`❌ Failed to settle call cost: ${settleResult.error}`);
        }
      }
    } else {
      // Fallback to old rate_settings system
      const { data: rate } = await supabase
        .from("rate_settings")
        .select("sell_rate_per_minute, cost_per_minute")
        .eq("country_code", callLog.to_country_code)
        .single();

      const durationMinutes = (durationSeconds || 0) / 60;

      let billedMinutes = 0;
      if (durationSeconds >= 30) {
        billedMinutes = Math.ceil(durationMinutes);
      }

      billedAmount = billedMinutes * (rate?.sell_rate_per_minute || 0);
      const twilioEstimatedCost =
        durationMinutes * (rate?.cost_per_minute || 0);
      profitMargin = billedAmount - twilioEstimatedCost;

      console.log(
        `💸 Old System: ${durationSeconds}s (${billedMinutes} min) × $${rate?.sell_rate_per_minute}/min = $${billedAmount}`,
      );

      // Manual wallet deduction for old system
      if (billedAmount > 0) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", req.user.id)
          .single();

        const oldBalance = parseFloat(wallet.balance);
        const newBalance = oldBalance - billedAmount;

        console.log(
          `🏦 Deducting $${billedAmount} from wallet. Old: $${oldBalance.toFixed(2)}, New: $${newBalance.toFixed(2)}`,
        );

        await supabase
          .from("wallets")
          .update({ balance: Math.max(0, newBalance) })
          .eq("user_id", req.user.id);
      }
    }

    // Update call log
    await supabase
      .from("call_logs")
      .update({
        status: "completed",
        duration_seconds: durationSeconds || 0,
        twilio_call_sid: actualCallSid,
        billed_amount: billedAmount,
        twilio_cost: actualCost,
        profit_margin: profitMargin,
        ended_at: new Date().toISOString(),
      })
      .eq("id", callId);

    // Return detailed cost information including profit margin
    const baseRate = costRecord ? parseFloat(costRecord.rate_per_minute) : 0;
    const markupPercentage = costRecord
      ? parseFloat(costRecord.markup_percentage || PROFIT_MARGIN_PERCENTAGE)
      : PROFIT_MARGIN_PERCENTAGE;

    res.json({
      success: true,
      billedAmount,
      durationSeconds,
      profitMargin,
      baseRate,
      finalRate,
      markupPercentage,
      costBreakdown: {
        baseRate: baseRate,
        markupPercentage: markupPercentage,
        finalRate: finalRate,
        durationMinutes: (durationSeconds / 60).toFixed(2),
        billedMinutes: Math.ceil(durationSeconds / 60),
        twilioBaseCost: (baseRate * (durationSeconds / 60)).toFixed(4),
        profitAmount: profitMargin.toFixed(4),
        totalCharged: billedAmount.toFixed(4),
      },
    });
  } catch (error) {
    console.error("Error ending call:", error);
    next(error);
  }
});

// Update call with Twilio CallSid
app.post("/api/calls/update-sid", authenticate, async (req, res, next) => {
  try {
    const { callId, twilioCallSid, tempCallSid } = req.body;

    if (!callId || !twilioCallSid) {
      return res
        .status(400)
        .json({ error: "CallId and twilioCallSid are required" });
    }

    console.log(
      `🔗 Updating call ${callId} with Twilio CallSid: ${twilioCallSid}`,
    );

    // Update the call log with Twilio CallSid
    const { error } = await supabase
      .from("call_logs")
      .update({
        twilio_call_sid: twilioCallSid,
        updated_at: new Date().toISOString(),
      })
      .eq("id", callId)
      .eq("user_id", req.user.id);

    if (error) {
      console.error("Failed to update call with CallSid:", error);
      return res.status(500).json({ error: "Failed to update call" });
    }

    // Update cost record with actual Twilio CallSid
    if (tempCallSid) {
      await supabase
        .from("call_cost_records")
        .update({
          call_sid: twilioCallSid,
          updated_at: new Date().toISOString(),
        })
        .eq("call_sid", tempCallSid)
        .eq("user_id", req.user.id);

      // Update wallet transactions with actual CallSid
      await supabase
        .from("wallet_transactions")
        .update({ related_call_sid: twilioCallSid })
        .eq("related_call_sid", tempCallSid)
        .eq("user_id", req.user.id);
    }

    console.log(
      `✅ Successfully linked call ${callId} with Twilio CallSid ${twilioCallSid}`,
    );
    res.json({ success: true, message: "Call updated with Twilio CallSid" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/calls/history", authenticate, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: calls } = await supabase
      .from("call_logs")
      .select("*")
      .eq("user_id", req.user.id)
      .order("started_at", { ascending: false })
      .range(offset, parseInt(offset) + parseInt(limit) - 1);

    res.json({ success: true, calls });
  } catch (error) {
    next(error);
  }
});

app.get("/api/calls/stats", authenticate, async (req, res, next) => {
  try {
    const { data: calls } = await supabase
      .from("call_logs")
      .select("duration_seconds, billed_amount, started_at")
      .eq("user_id", req.user.id);

    const totalCalls = calls?.length || 0;
    const totalMinutes =
      calls?.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) /
        60 || 0;
    const totalSpent =
      calls?.reduce((sum, call) => sum + (call.billed_amount || 0), 0) || 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth =
      calls
        ?.filter((call) => new Date(call.started_at) >= startOfMonth)
        .reduce((sum, call) => sum + (call.billed_amount || 0), 0) || 0;

    res.json({
      success: true,
      stats: {
        totalCalls,
        totalMinutes: Math.round(totalMinutes),
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        thisMonth: parseFloat(thisMonth.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PAYMENT ROUTES
// ============================================================================

app.post(
  "/api/payments/create-intent",
  authenticate,
  async (req, res, next) => {
    try {
      const { amount, currency = "USD", provider = "stripe" } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const { data: payment } = await supabase
        .from("payments")
        .insert({
          user_id: req.user.id,
          amount,
          currency,
          provider,
          status: "pending",
        })
        .select()
        .single();

      if (provider === "stripe") {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          metadata: { userId: req.user.id, paymentId: payment.id },
        });

        await supabase
          .from("payments")
          .update({ provider_payment_id: paymentIntent.id })
          .eq("id", payment.id);

        res.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentId: payment.id,
        });
      } else if (provider === "razorpay") {
        const order = await razorpay.orders.create({
          amount: Math.round(amount * 100),
          currency: "INR",
          receipt: payment.id,
          notes: { userId: req.user.id, paymentId: payment.id },
        });

        await supabase
          .from("payments")
          .update({ provider_payment_id: order.id })
          .eq("id", payment.id);

        res.json({
          success: true,
          orderId: order.id,
          paymentId: payment.id,
          key: process.env.RAZORPAY_KEY_ID,
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

app.post("/api/payments/stripe-webhook", async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { userId, paymentId } = paymentIntent.metadata;

      await supabase
        .from("payments")
        .update({
          status: "completed",
          credits_added: paymentIntent.amount / 100,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      const newBalance =
        parseFloat(wallet.balance) + paymentIntent.amount / 100;

      await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/payments/razorpay-webhook", async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      const paymentId = payment.notes.paymentId;
      const userId = payment.notes.userId;

      await supabase
        .from("payments")
        .update({
          status: "completed",
          credits_added: payment.amount / 100,
          provider_payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      const newBalance = parseFloat(wallet.balance) + payment.amount / 100;

      await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);
    }

    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/payments/history", authenticate, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, parseInt(offset) + parseInt(limit) - 1);

    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// NUMBER MANAGEMENT ROUTES
// ============================================================================

app.get("/api/numbers/available", authenticate, async (req, res, next) => {
  try {
    const { countryCode = "US", areaCode, type = "local" } = req.query;

    const searchParams = { limit: 20 };
    if (areaCode) searchParams.areaCode = areaCode;

    let numbers;
    if (type === "tollfree") {
      numbers = await twilioClient
        .availablePhoneNumbers(countryCode)
        .tollFree.list(searchParams);
    } else {
      numbers = await twilioClient
        .availablePhoneNumbers(countryCode)
        .local.list(searchParams);
    }

    res.json({
      success: true,
      numbers: numbers.map((num) => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        capabilities: num.capabilities,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/numbers/purchase", authenticate, async (req, res, next) => {
  try {
    const { phoneNumber, countryCode } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (!wallet || wallet.balance < 5) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const incomingNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber,
      friendlyName: `User ${req.user.id}`,
    });

    const { data: purchasedNumber } = await supabase
      .from("purchased_numbers")
      .insert({
        user_id: req.user.id,
        phone_number: phoneNumber,
        twilio_sid: incomingNumber.sid,
        country_code: countryCode || "US",
        monthly_cost: 5.0,
        is_active: true,
        purchased_at: new Date().toISOString(),
      })
      .select()
      .single();

    const newBalance = parseFloat(wallet.balance) - 5.0;
    await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", req.user.id);

    res.json({ success: true, number: purchasedNumber, newBalance });
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/numbers/release/:numberId",
  authenticate,
  async (req, res, next) => {
    try {
      const { numberId } = req.params;

      const { data: number } = await supabase
        .from("purchased_numbers")
        .select("*")
        .eq("id", numberId)
        .eq("user_id", req.user.id)
        .single();

      if (!number) {
        return res.status(404).json({ error: "Number not found" });
      }

      await twilioClient.incomingPhoneNumbers(number.twilio_sid).remove();

      await supabase
        .from("purchased_numbers")
        .update({ is_active: false })
        .eq("id", numberId);

      res.json({ success: true, message: "Number released successfully" });
    } catch (error) {
      next(error);
    }
  },
);

app.get("/api/numbers/my-numbers", authenticate, async (req, res, next) => {
  try {
    const { data: numbers } = await supabase
      .from("purchased_numbers")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("is_active", true)
      .order("purchased_at", { ascending: false });

    res.json({ success: true, numbers });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ENTERPRISE ROUTES
// ============================================================================

app.post("/api/enterprise/create", authenticate, async (req, res, next) => {
  try {
    const { name, maxMembers = 50 } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Enterprise name is required" });
    }

    const { data: enterprise } = await supabase
      .from("enterprise_accounts")
      .insert({
        name,
        admin_id: req.user.id,
        max_members: maxMembers,
        shared_balance: 0,
      })
      .select()
      .single();

    await supabase
      .from("user_roles")
      .insert({ user_id: req.user.id, role: "enterprise_admin" });

    res.json({ success: true, enterprise });
  } catch (error) {
    next(error);
  }
});

app.get(
  "/api/enterprise/:enterpriseId",
  authenticate,
  async (req, res, next) => {
    try {
      const { enterpriseId } = req.params;

      const { data: enterprise } = await supabase
        .from("enterprise_accounts")
        .select(
          `
        *,
        enterprise_members (
          id, user_id, credit_limit, used_credits,
          can_make_calls, can_purchase_numbers, joined_at,
          profiles:user_id (full_name, email)
        )
      `,
        )
        .eq("id", enterpriseId)
        .single();

      if (!enterprise) {
        return res.status(404).json({ error: "Enterprise not found" });
      }

      const isAdmin = enterprise.admin_id === req.user.id;
      const isMember = enterprise.enterprise_members?.some(
        (m) => m.user_id === req.user.id,
      );

      if (!isAdmin && !isMember) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json({ success: true, enterprise, isAdmin });
    } catch (error) {
      next(error);
    }
  },
);

app.post(
  "/api/enterprise/:enterpriseId/members",
  authenticate,
  async (req, res, next) => {
    try {
      const { enterpriseId } = req.params;
      const {
        email,
        creditLimit = 0,
        canMakeCalls = true,
        canPurchaseNumbers = false,
      } = req.body;

      const { data: enterprise } = await supabase
        .from("enterprise_accounts")
        .select("admin_id, max_members")
        .eq("id", enterpriseId)
        .single();

      if (!enterprise || enterprise.admin_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      const { data: member } = await supabase
        .from("enterprise_members")
        .insert({
          enterprise_id: enterpriseId,
          user_id: profile.id,
          credit_limit: creditLimit,
          can_make_calls: canMakeCalls,
          can_purchase_numbers: canPurchaseNumbers,
        })
        .select()
        .single();

      await supabase
        .from("user_roles")
        .insert({ user_id: profile.id, role: "enterprise_member" });

      res.json({ success: true, member });
    } catch (error) {
      next(error);
    }
  },
);

app.post(
  "/api/enterprise/:enterpriseId/share-credits",
  authenticate,
  async (req, res, next) => {
    try {
      const { enterpriseId } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const { data: enterprise } = await supabase
        .from("enterprise_accounts")
        .select("admin_id, shared_balance")
        .eq("id", enterpriseId)
        .single();

      if (!enterprise || enterprise.admin_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", req.user.id)
        .single();

      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const newWalletBalance = parseFloat(wallet.balance) - amount;
      const newSharedBalance = parseFloat(enterprise.shared_balance) + amount;

      await supabase
        .from("wallets")
        .update({ balance: newWalletBalance })
        .eq("user_id", req.user.id);

      await supabase
        .from("enterprise_accounts")
        .update({ shared_balance: newSharedBalance })
        .eq("id", enterpriseId);

      res.json({
        success: true,
        sharedBalance: newSharedBalance,
        walletBalance: newWalletBalance,
      });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/api/enterprise/:enterpriseId/usage",
  authenticate,
  async (req, res, next) => {
    try {
      const { enterpriseId } = req.params;

      const { data: calls } = await supabase
        .from("call_logs")
        .select("user_id, duration_seconds, billed_amount")
        .eq("enterprise_id", enterpriseId);

      const usageByUser = {};
      calls?.forEach((call) => {
        if (!usageByUser[call.user_id]) {
          usageByUser[call.user_id] = {
            totalCalls: 0,
            totalMinutes: 0,
            totalSpent: 0,
          };
        }
        usageByUser[call.user_id].totalCalls++;
        usageByUser[call.user_id].totalMinutes +=
          (call.duration_seconds || 0) / 60;
        usageByUser[call.user_id].totalSpent += call.billed_amount || 0;
      });

      res.json({ success: true, usage: usageByUser });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// CONTACTS ROUTES
// ============================================================================

// Get all contacts for user
app.get("/api/contacts", authenticate, async (req, res, next) => {
  try {
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", req.user.id)
      .order("name");

    if (error) throw error;

    res.json({ success: true, contacts: contacts || [] });
  } catch (error) {
    next(error);
  }
});

// Create new contact
app.post("/api/contacts", authenticate, async (req, res, next) => {
  try {
    const { name, phone_number, country_code, email, company, notes } =
      req.body;

    if (!name || !phone_number || !country_code) {
      return res.status(400).json({
        error: "Name, phone number, and country code are required",
      });
    }

    const { data: contact, error } = await supabase
      .from("contacts")
      .insert({
        user_id: req.user.id,
        name,
        phone_number,
        country_code,
        email: email || null,
        company: company || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, contact });
  } catch (error) {
    next(error);
  }
});

// Update contact
app.put("/api/contacts/:contactId", authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const {
      name,
      phone_number,
      country_code,
      email,
      company,
      notes,
      is_favorite,
    } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (country_code !== undefined) updates.country_code = country_code;
    if (email !== undefined) updates.email = email;
    if (company !== undefined) updates.company = company;
    if (notes !== undefined) updates.notes = notes;
    if (is_favorite !== undefined) updates.is_favorite = is_favorite;

    const { data: contact, error } = await supabase
      .from("contacts")
      .update(updates)
      .eq("id", contactId)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, contact });
  } catch (error) {
    next(error);
  }
});

// Delete contact
app.delete("/api/contacts/:contactId", authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contactId)
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// INTERNAL CALL ROUTES (LiveKit - Free for Enterprise Users)
// ============================================================================

// Generate LiveKit token for internal calls
app.post("/api/internal-call/token", authenticate, async (req, res, next) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        error: "Room name and participant name are required",
      });
    }

    if (!livekitEnabled) {
      return res.status(503).json({
        error: "Internal calling is not configured. Please contact support.",
      });
    }

    // Check wallet balance - require at least $2 to join call
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    const minimumBalance = 2.0; // $2 minimum to join call
    if (!wallet || (wallet.balance || 0) < minimumBalance) {
      return res.status(402).json({
        error: "Insufficient wallet balance",
        message: `You need at least $${minimumBalance} in your wallet to join an internal call. Please add funds to continue.`,
        currentBalance: wallet?.balance || 0,
      });
    }

    // Create room ID - allow any user to create/join calls
    const roomId = `global-${roomName}`;

    // Generate LiveKit access token
    const at = new LiveKitAccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: req.user.id,
        name: participantName,
        ttl: "24h", // Token valid for 24 hours
      },
    );

    // Grant permissions for this room
    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    // Record the call in database
    const { data: existingCall } = await supabase
      .from("internal_calls")
      .select("id, created_by")
      .eq("room_id", roomId)
      .eq("status", "active")
      .single();

    let callId = existingCall?.id;
    let isHost = false;

    if (!existingCall) {
      // Create new call record
      const { data: newCall, error: callError } = await supabase
        .from("internal_calls")
        .insert({
          room_id: roomId,
          room_name: roomName,
          enterprise_id: null, // No enterprise required
          created_by: req.user.id,
          call_type: "group", // Assume group call by default
          status: "active",
        })
        .select()
        .single();

      if (callError) {
        console.error("Failed to create call record:", callError);
      } else {
        callId = newCall.id;
        isHost = true; // User created the room, so they're the host
      }
    } else {
      // Check if this user is the host
      isHost = existingCall.created_by === req.user.id;
    }

    // Add user as participant
    if (callId) {
      const { error: participantError } = await supabase
        .from("internal_call_participants")
        .insert({
          call_id: callId,
          user_id: req.user.id,
          participant_name: participantName,
          status: "joined",
        });

      if (participantError) {
        console.error("Failed to record participant:", participantError);
      }
    }

    res.json({
      success: true,
      token,
      roomId,
      wsUrl: process.env.LIVEKIT_URL,
      callId,
      isHost,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    next(error);
  }
});

// Get waiting participants for a call (host only)
app.get(
  "/api/internal-call/waiting/:callId",
  authenticate,
  async (req, res, next) => {
    try {
      const { callId } = req.params;

      // Verify user is the call creator
      const { data: call } = await supabase
        .from("internal_calls")
        .select("created_by")
        .eq("id", callId)
        .single();

      if (!call || call.created_by !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Get waiting participants
      const { data: waitingUsers, error } = await supabase
        .from("internal_call_participants")
        .select("*")
        .eq("call_id", callId)
        .eq("status", "waiting")
        .order("created_at", { ascending: true });

      if (error) throw error;

      res.json({ success: true, waiting: waitingUsers || [] });
    } catch (error) {
      next(error);
    }
  },
);

// Approve participant (host only)
app.post(
  "/api/internal-call/approve/:participantId",
  authenticate,
  async (req, res, next) => {
    try {
      const { participantId } = req.params;

      // Get participant details
      const { data: participant } = await supabase
        .from("internal_call_participants")
        .select("*, internal_calls(created_by, enterprise_id, room_id)")
        .eq("id", participantId)
        .single();

      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      // Verify user is the call creator
      if (participant.internal_calls.created_by !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Update status to approved
      const { error } = await supabase
        .from("internal_call_participants")
        .update({
          status: "approved",
          approved_by: req.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", participantId);

      if (error) throw error;

      // Generate LiveKit token for approved user
      if (livekitEnabled && participant.user_id) {
        // room_id already contains the full enterprise-scoped ID
        const roomId = participant.internal_calls.room_id;

        const at = new LiveKitAccessToken(
          process.env.LIVEKIT_API_KEY,
          process.env.LIVEKIT_API_SECRET,
          {
            identity: participant.user_id,
            name: participant.participant_name,
            ttl: "24h",
          },
        );

        at.addGrant({
          roomJoin: true,
          room: roomId,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
        });

        const token = await at.toJwt();

        res.json({
          success: true,
          message: "Participant approved",
          token,
          roomId,
          wsUrl: process.env.LIVEKIT_URL,
        });
      } else {
        res.json({ success: true, message: "Participant approved" });
      }
    } catch (error) {
      next(error);
    }
  },
);

// Reject participant (host only)
app.post(
  "/api/internal-call/reject/:participantId",
  authenticate,
  async (req, res, next) => {
    try {
      const { participantId } = req.params;

      // Get participant details
      const { data: participant } = await supabase
        .from("internal_call_participants")
        .select("*, internal_calls(created_by)")
        .eq("id", participantId)
        .single();

      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      // Verify user is the call creator
      if (participant.internal_calls.created_by !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Update status to rejected
      const { error } = await supabase
        .from("internal_call_participants")
        .update({
          status: "rejected",
        })
        .eq("id", participantId);

      if (error) throw error;

      res.json({ success: true, message: "Participant rejected" });
    } catch (error) {
      next(error);
    }
  },
);

// Check approval status (for waiting users)
app.get(
  "/api/internal-call/status/:callId",
  authenticate,
  async (req, res, next) => {
    try {
      const { callId } = req.params;

      // Get participant status
      const { data: participant } = await supabase
        .from("internal_call_participants")
        .select(
          "id, status, approved_at, participant_name, internal_calls(room_id, enterprise_id)",
        )
        .eq("call_id", callId)
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!participant) {
        return res.status(404).json({ error: "Not found" });
      }

      // If approved, generate token
      if (participant.status === "approved" && livekitEnabled) {
        // room_id already contains the full enterprise-scoped ID
        const roomId = participant.internal_calls.room_id;

        const at = new LiveKitAccessToken(
          process.env.LIVEKIT_API_KEY,
          process.env.LIVEKIT_API_SECRET,
          {
            identity: req.user.id,
            name: participant.participant_name || req.user.email || "User",
            ttl: "24h",
          },
        );

        // Update status to joined
        await supabase
          .from("internal_call_participants")
          .update({ status: "joined" })
          .eq("id", participant.id);

        at.addGrant({
          roomJoin: true,
          room: roomId,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
        });

        const token = await at.toJwt();

        res.json({
          success: true,
          status: participant.status,
          token,
          roomId,
          wsUrl: process.env.LIVEKIT_URL,
        });
      } else {
        res.json({
          success: true,
          status: participant.status,
        });
      }
    } catch (error) {
      next(error);
    }
  },
);

// Get active internal calls for user's enterprise
app.get("/api/internal-call/active", authenticate, async (req, res, next) => {
  try {
    // Get user's enterprise
    const { data: enterpriseMember } = await supabase
      .from("enterprise_members")
      .select("enterprise_id")
      .eq("user_id", req.user.id)
      .single();

    if (!enterpriseMember) {
      return res.json({ success: true, calls: [] });
    }

    // Get active calls
    const { data: calls, error } = await supabase
      .from("internal_calls")
      .select(
        `
        *,
        internal_call_participants (
          id,
          user_id,
          participant_name,
          joined_at,
          left_at,
          status
        )
      `,
      )
      .eq("enterprise_id", enterpriseMember.enterprise_id)
      .eq("status", "active")
      .order("started_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, calls: calls || [] });
  } catch (error) {
    next(error);
  }
});

// Leave internal call
app.post(
  "/api/internal-call/leave/:callId",
  authenticate,
  async (req, res, next) => {
    try {
      const { callId } = req.params;

      // Get participant join time to calculate duration and cost
      const { data: participant } = await supabase
        .from("internal_call_participants")
        .select("joined_at")
        .eq("call_id", callId)
        .eq("user_id", req.user.id)
        .eq("status", "joined")
        .single();

      if (participant && participant.joined_at) {
        // Calculate call duration in hours
        const joinTime = new Date(participant.joined_at);
        const leaveTime = new Date();
        const durationMs = leaveTime - joinTime;
        const durationHours = durationMs / (1000 * 60 * 60); // Convert to hours

        // Calculate cost at $2 per hour
        const costPerHour = 2.0;
        const totalCost = Math.ceil(durationHours * costPerHour * 100) / 100; // Round up to 2 decimals

        if (totalCost > 0) {
          // Deduct from wallet
          const { data: wallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", req.user.id)
            .single();

          if (wallet) {
            const newBalance = (wallet.balance || 0) - totalCost;

            // Update wallet balance
            await supabase
              .from("wallets")
              .update({ balance: newBalance })
              .eq("user_id", req.user.id);

            // Record transaction
            await supabase.from("wallet_transactions").insert({
              user_id: req.user.id,
              amount: -totalCost,
              type: "deduction",
              description: `Internal call - ${Math.round(
                durationHours * 60,
              )} minutes at $${costPerHour}/hr`,
              balance_after: newBalance,
            });
          }
        }
      }

      // Update participant status
      const { error: participantError } = await supabase
        .from("internal_call_participants")
        .update({
          status: "left",
          left_at: new Date().toISOString(),
        })
        .eq("call_id", callId)
        .eq("user_id", req.user.id);

      if (participantError) throw participantError;

      // Check if all participants have left
      const { data: activeParticipants } = await supabase
        .from("internal_call_participants")
        .select("id")
        .eq("call_id", callId)
        .eq("status", "joined");

      // If no active participants, end the call
      if (!activeParticipants || activeParticipants.length === 0) {
        await supabase
          .from("internal_calls")
          .update({
            status: "ended",
            ended_at: new Date().toISOString(),
          })
          .eq("id", callId);
      }

      res.json({ success: true, message: "Left call successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// End internal call (creator only)
app.post(
  "/api/internal-call/end/:callId",
  authenticate,
  async (req, res, next) => {
    try {
      const { callId } = req.params;

      // Verify user is the creator
      const { data: call } = await supabase
        .from("internal_calls")
        .select("created_by")
        .eq("id", callId)
        .single();

      if (!call || call.created_by !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Only the call creator can end the call" });
      }

      // Update call status
      await supabase
        .from("internal_calls")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", callId);

      // Update all participants
      await supabase
        .from("internal_call_participants")
        .update({
          status: "left",
          left_at: new Date().toISOString(),
        })
        .eq("call_id", callId)
        .eq("status", "joined");

      res.json({ success: true, message: "Call ended successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// CONFERENCE ROUTES
// ============================================================================

// Create internal team conference
app.post(
  "/api/conference/create-internal",
  authenticate,
  async (req, res, next) => {
    try {
      const { roomName, memberIds, contacts, enterpriseId } = req.body;

      if (!roomName || (!memberIds?.length && !contacts?.length)) {
        return res.status(400).json({
          error: "Room name and at least one member or contact are required",
        });
      }

      // Verify enterprise membership
      if (enterpriseId) {
        const { data: member } = await supabase
          .from("enterprise_members")
          .select("id")
          .eq("enterprise_id", enterpriseId)
          .eq("user_id", req.user.id)
          .single();

        if (!member) {
          return res
            .status(403)
            .json({ error: "Not a member of this enterprise" });
        }
      }

      // Twilio conferences are created automatically when participants join
      // The conference name will be used in the TwiML when dialing participants
      let conferenceSid = null;

      // Create conference room in database
      const { data: conference, error: confError } = await supabase
        .from("conference_rooms")
        .insert({
          name: roomName,
          enterprise_id: enterpriseId || null,
          created_by: req.user.id,
          conference_sid: conferenceSid,
          status: "active",
          is_internal: true,
        })
        .select()
        .single();

      if (confError) throw confError;

      // Add participants (enterprise members and contacts)
      const participants = [];

      // Add enterprise members with user_id
      if (memberIds && memberIds.length > 0) {
        memberIds.forEach((userId) => {
          if (userId) {
            participants.push({
              conference_id: conference.id,
              user_id: userId,
              status: "invited",
            });
          }
        });
      }

      // Add contacts with phone numbers (no user_id)
      if (contacts && contacts.length > 0) {
        contacts.forEach((contact) => {
          participants.push({
            conference_id: conference.id,
            user_id: null,
            phone_number: contact.phone_number,
            country_code: contact.country_code,
            participant_name: contact.name,
            status: "invited",
          });
        });
      }

      if (participants.length > 0) {
        const { error: participantsError } = await supabase
          .from("conference_participants")
          .insert(participants);

        if (participantsError) throw participantsError;
      }

      // Make actual phone calls to participants if Twilio is configured
      if (twilioClient) {
        // Call contacts with phone numbers
        if (contacts && contacts.length > 0) {
          for (const contact of contacts) {
            try {
              const fullPhoneNumber = `${contact.country_code}${contact.phone_number}`;

              await twilioClient.calls.create({
                url: `${
                  process.env.API_URL || "http://localhost:5000"
                }/api/conference/twiml/${conference.id}`,
                to: fullPhoneNumber,
                from: process.env.TWILIO_PHONE_NUMBER,
                statusCallback: `${
                  process.env.API_URL || "http://localhost:5000"
                }/api/conference/status-callback`,
                statusCallbackEvent: ["initiated", "answered", "completed"],
              });

              console.log(
                `📞 Calling contact: ${contact.name} at ${fullPhoneNumber}`,
              );
            } catch (callError) {
              console.error(
                `Failed to call ${contact.name}:`,
                callError.message,
              );
            }
          }
        }

        // For enterprise members, you would need to have their phone numbers
        // This would require updating the enterprise_members table or profiles table
        // to include phone numbers for each team member
      }

      res.json({
        success: true,
        conference: {
          id: conference.id,
          name: conference.name,
          conferenceSid,
          participants: participants.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Create external conference
app.post(
  "/api/conference/create-external",
  authenticate,
  async (req, res, next) => {
    try {
      const { title, participants } = req.body;

      if (!title || !participants || participants.length === 0) {
        return res.status(400).json({
          error: "Conference title and at least one participant are required",
        });
      }

      // Verify wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", req.user.id)
        .single();

      if (!wallet || wallet.balance <= 0) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Twilio conferences are created automatically when participants join
      // The conference name will be used in the TwiML when dialing participants
      let conferenceSid = null;

      // Create conference room in database
      const { data: conference, error: confError } = await supabase
        .from("conference_rooms")
        .insert({
          name: title,
          created_by: req.user.id,
          conference_sid: conferenceSid,
          status: "active",
          is_internal: false,
        })
        .select()
        .single();

      if (confError) throw confError;

      // Add participants and initiate calls
      const participantRecords = participants.map((p) => ({
        conference_id: conference.id,
        phone_number: `${p.countryCode}${p.phone}`,
        participant_name: p.name || "Unknown",
        country_code: p.countryCode,
        status: "invited",
      }));

      const { error: participantsError } = await supabase
        .from("conference_participants")
        .insert(participantRecords);

      if (participantsError) throw participantsError;

      // Make actual phone calls to participants if Twilio is configured
      if (twilioClient) {
        for (const participant of participants) {
          try {
            const fullPhoneNumber = `${participant.countryCode}${participant.phone}`;

            const call = await twilioClient.calls.create({
              url: `${
                process.env.API_URL || "http://localhost:5000"
              }/api/conference/twiml/${conference.id}`,
              to: fullPhoneNumber,
              from: process.env.TWILIO_PHONE_NUMBER,
              statusCallback: `${
                process.env.API_URL || "http://localhost:5000"
              }/api/conference/status-callback`,
              statusCallbackEvent: ["initiated", "answered", "completed"],
            });

            // Update participant with call SID
            await supabase
              .from("conference_participants")
              .update({ call_sid: call.sid })
              .eq("conference_id", conference.id)
              .eq("phone_number", fullPhoneNumber);

            console.log(
              `📞 Calling ${
                participant.name || "participant"
              } at ${fullPhoneNumber}`,
            );
          } catch (error) {
            console.warn(`Failed to dial ${participant.phone}:`, error.message);
          }
        }
      }

      res.json({
        success: true,
        conference: {
          id: conference.id,
          name: conference.name,
          conferenceSid,
          participants: participants.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get active conferences
app.get("/api/conference/active", authenticate, async (req, res, next) => {
  try {
    const { data: conferences } = await supabase
      .from("conference_rooms")
      .select(
        `
        *,
        conference_participants (
          id, user_id, phone_number, participant_name, status, joined_at,
          profiles:user_id (full_name, email)
        )
      `,
      )
      .eq("created_by", req.user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false });

    res.json({ success: true, conferences });
  } catch (error) {
    next(error);
  }
});

// End conference
app.post(
  "/api/conference/end/:conferenceId",
  authenticate,
  async (req, res, next) => {
    try {
      const { conferenceId } = req.params;

      // Verify ownership
      const { data: conference } = await supabase
        .from("conference_rooms")
        .select("*")
        .eq("id", conferenceId)
        .eq("created_by", req.user.id)
        .single();

      if (!conference) {
        return res.status(404).json({ error: "Conference not found" });
      }

      // End conference in Twilio
      if (twilioClient && conference.conference_sid) {
        try {
          await twilioClient
            .conferences(conference.conference_sid)
            .update({ status: "completed" });
        } catch (error) {
          console.warn("Failed to end Twilio conference:", error.message);
        }
      }

      // Update conference status
      await supabase
        .from("conference_rooms")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", conferenceId);

      // Update participant statuses
      await supabase
        .from("conference_participants")
        .update({
          status: "left",
          left_at: new Date().toISOString(),
        })
        .eq("conference_id", conferenceId)
        .eq("status", "joined");

      res.json({ success: true, message: "Conference ended successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// Join conference (for internal participants)
app.post(
  "/api/conference/join/:conferenceId",
  authenticate,
  async (req, res, next) => {
    try {
      const { conferenceId } = req.params;

      // Verify participant
      const { data: participant } = await supabase
        .from("conference_participants")
        .select("*, conference_rooms(*)")
        .eq("conference_id", conferenceId)
        .eq("user_id", req.user.id)
        .single();

      if (!participant) {
        return res
          .status(403)
          .json({ error: "Not a participant of this conference" });
      }

      // Update participant status
      await supabase
        .from("conference_participants")
        .update({
          status: "joined",
          joined_at: new Date().toISOString(),
        })
        .eq("id", participant.id);

      res.json({
        success: true,
        conference: {
          id: participant.conference_rooms.id,
          name: participant.conference_rooms.name,
          conferenceSid: participant.conference_rooms.conference_sid,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Leave conference
app.post(
  "/api/conference/leave/:conferenceId",
  authenticate,
  async (req, res, next) => {
    try {
      const { conferenceId } = req.params;

      await supabase
        .from("conference_participants")
        .update({
          status: "left",
          left_at: new Date().toISOString(),
        })
        .eq("conference_id", conferenceId)
        .eq("user_id", req.user.id);

      res.json({ success: true, message: "Left conference successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// TwiML endpoint to connect participants to conference
app.post("/api/conference/twiml/:conferenceId", async (req, res) => {
  try {
    const { conferenceId } = req.params;

    // Get conference details
    const { data: conference } = await supabase
      .from("conference_rooms")
      .select("*")
      .eq("id", conferenceId)
      .single();

    if (!conference) {
      return res.status(404).send("Conference not found");
    }

    // Generate TwiML to connect participant to conference
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Welcome to ${
    conference.name
  }. You are being connected to the conference.</Say>
  <Dial>
    <Conference 
      statusCallback="${
        process.env.API_URL || "http://localhost:5000"
      }/api/conference/status-callback"
      statusCallbackEvent="start end join leave"
      startConferenceOnEnter="true"
      endConferenceOnExit="false"
    >${conference.id}</Conference>
  </Dial>
</Response>`;

    res.type("text/xml");
    res.send(twiml);
  } catch (error) {
    console.error("TwiML generation error:", error);
    res.status(500).send("Error");
  }
});

// Conference status callback (Twilio webhook)
app.post(
  "/api/conference/status-callback",
  express.urlencoded({ extended: false }),
  async (req, res) => {
    try {
      const { ConferenceSid, StatusCallbackEvent, CallSid, Timestamp } =
        req.body;

      console.log("Conference status callback:", {
        ConferenceSid,
        StatusCallbackEvent,
        CallSid,
      });

      // Update database based on event
      if (StatusCallbackEvent === "conference-start") {
        await supabase
          .from("conference_rooms")
          .update({ started_at: new Date(Timestamp).toISOString() })
          .eq("conference_sid", ConferenceSid);
      } else if (StatusCallbackEvent === "conference-end") {
        await supabase
          .from("conference_rooms")
          .update({
            status: "ended",
            ended_at: new Date(Timestamp).toISOString(),
          })
          .eq("conference_sid", ConferenceSid);
      } else if (StatusCallbackEvent === "participant-join") {
        await supabase
          .from("conference_participants")
          .update({
            status: "joined",
            joined_at: new Date(Timestamp).toISOString(),
          })
          .eq("call_sid", CallSid);
      } else if (StatusCallbackEvent === "participant-leave") {
        await supabase
          .from("conference_participants")
          .update({
            status: "left",
            left_at: new Date(Timestamp).toISOString(),
          })
          .eq("call_sid", CallSid);
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Conference callback error:", error);
      res.status(500).send("Error");
    }
  },
);

// Call status callback endpoint to handle individual call state changes
app.post(
  "/api/calls/status-callback",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const { CallSid, CallStatus, Duration, From, To } = req.body;

      console.log("Call Status Callback:", {
        CallSid,
        CallStatus,
        Duration,
        From,
        To,
      });

      // Find the call log by twilio_call_sid
      const { data: callLog } = await supabase
        .from("call_logs")
        .select(
          "id, user_id, status, started_at, to_country_code, answered_at, twilio_call_sid",
        )
        .eq("twilio_call_sid", CallSid)
        .single();

      if (!callLog) {
        console.log(`Call log not found for CallSid: ${CallSid}`);
        return res.status(200).send("OK");
      }

      let updateData = {
        call_status: CallStatus,
        updated_at: new Date().toISOString(),
      };

      // Handle different call states
      if (CallStatus === "ringing") {
        updateData.status = "ringing";
      } else if (CallStatus === "in-progress") {
        updateData.status = "answered";
        // Only set answered_at if not already set
        if (!callLog.answered_at) {
          updateData.answered_at = new Date().toISOString();
        }
      } else if (
        CallStatus === "completed" ||
        CallStatus === "busy" ||
        CallStatus === "no-answer" ||
        CallStatus === "failed"
      ) {
        updateData.status = "completed";
        updateData.ended_at = new Date().toISOString();

        if (Duration && callLog.answered_at && CallSid) {
          // Only bill if call was actually answered and we have CallSid
          updateData.duration_seconds = parseInt(Duration);

          try {
            // 🚀 GET REAL COST FROM TWILIO API
            console.log(
              `💰 Fetching REAL cost from Twilio for CallSid: ${CallSid}`,
            );
            const twilioRealCost = await getRealCallCostFromTwilio(CallSid);

            // Use EXACT Twilio cost (no markup - as per user requirement)
            const actualTwilioCost = twilioRealCost.actualCost;
            const userChargeAmount = actualTwilioCost; // Exact cost, no markup

            console.log(
              `✅ Real Twilio cost for ${CallSid}: $${actualTwilioCost}`,
            );
            console.log(`💸 Charging user exactly: $${userChargeAmount}`);

            updateData.billed_amount = userChargeAmount;
            updateData.twilio_cost = actualTwilioCost;
            updateData.profit_margin = 0; // No markup, so profit is 0

            // 💰 Deduct REAL cost from wallet
            if (userChargeAmount > 0) {
              const { data: wallet } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", callLog.user_id)
                .single();

              if (wallet) {
                const oldBalance = parseFloat(wallet.balance);
                const newBalance = oldBalance - userChargeAmount;
                console.log(
                  `🏦 Wallet update: $${oldBalance} - $${userChargeAmount} = $${newBalance}`,
                );

                await supabase
                  .from("wallets")
                  .update({ balance: Math.max(0, newBalance) })
                  .eq("user_id", callLog.user_id);

                console.log(
                  `✅ User wallet updated! New balance: $${Math.max(
                    0,
                    newBalance,
                  )}`,
                );
              }
            }
          } catch (twilioError) {
            console.error(
              `❌ Failed to get real cost from Twilio for ${CallSid}:`,
              twilioError.message,
            );

            // 🔄 Fallback to estimated calculation if Twilio API fails
            console.log(
              `⚠️ Using fallback estimated cost calculation for ${CallSid}`,
            );
            const { data: rate } = await supabase
              .from("rate_settings")
              .select("sell_rate_per_minute, cost_per_minute")
              .eq("country_code", callLog.to_country_code)
              .single();

            const durationSeconds = parseInt(Duration);
            const durationMinutes = durationSeconds / 60;
            let billedMinutes = 0;

            if (durationSeconds >= 30) {
              billedMinutes = Math.ceil(durationMinutes);
            }

            const billedAmount =
              billedMinutes * (rate?.sell_rate_per_minute || 0);
            const twilioEstimatedCost =
              durationMinutes * (rate?.cost_per_minute || 0);

            updateData.billed_amount = billedAmount;
            updateData.twilio_cost = twilioEstimatedCost;
            updateData.profit_margin = billedAmount - twilioEstimatedCost;

            // Deduct fallback amount from wallet
            if (billedAmount > 0) {
              const { data: wallet } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", callLog.user_id)
                .single();

              if (wallet) {
                const newBalance = parseFloat(wallet.balance) - billedAmount;
                await supabase
                  .from("wallets")
                  .update({ balance: Math.max(0, newBalance) })
                  .eq("user_id", callLog.user_id);
              }
            }
          }
        } else if (Duration && !callLog.answered_at) {
          // Call completed but was never answered (busy/no-answer) - no charge
          console.log(
            `📞 Call ${CallSid} completed but never answered - no charge`,
          );
          updateData.duration_seconds = parseInt(Duration);
          updateData.billed_amount = 0;
          updateData.twilio_cost = 0;
          updateData.profit_margin = 0;
        }
      }

      // Update the call log
      await supabase.from("call_logs").update(updateData).eq("id", callLog.id);

      res.status(200).send("OK");
    } catch (error) {
      console.error("Call status callback error:", error);
      res.status(500).send("Error");
    }
  },
);

// ============================================================================
// COMPANY ADMIN ROUTES
// ============================================================================

// Register as company admin
app.post(
  "/api/company-admin/register",
  authenticate,
  async (req, res, next) => {
    try {
      const { company_name, company_email, company_phone } = req.body;

      if (!company_name || !company_email) {
        return res
          .status(400)
          .json({ error: "Company name and email are required" });
      }

      // Check if user is already a company admin
      const { data: existingAdmin } = await supabase
        .from("company_admins")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: "User is already a company admin" });
      }

      // Create company admin
      const { data: companyAdmin, error: adminError } = await supabase
        .from("company_admins")
        .insert({
          user_id: req.user.id,
          company_name,
          company_email,
          company_phone: company_phone || null,
        })
        .select()
        .single();

      if (adminError) throw adminError;

      // Update user profile to company_admin type
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: "company_admin" })
        .eq("id", req.user.id);

      if (profileError) throw profileError;

      res.json({ success: true, companyAdmin });
    } catch (error) {
      next(error);
    }
  },
);

// Get company admin profile
app.get("/api/company-admin/profile", authenticate, async (req, res, next) => {
  try {
    const { data: companyAdmin, error } = await supabase
      .from("company_admins")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error || !companyAdmin) {
      return res.status(404).json({ error: "Company admin profile not found" });
    }

    res.json({ success: true, companyAdmin });
  } catch (error) {
    next(error);
  }
});

// Update company admin profile
app.put("/api/company-admin/profile", authenticate, async (req, res, next) => {
  try {
    const { company_name, company_email, company_phone } = req.body;

    const { data: companyAdmin, error } = await supabase
      .from("company_admins")
      .update({
        company_name,
        company_email,
        company_phone: company_phone || null,
      })
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, companyAdmin });
  } catch (error) {
    next(error);
  }
});

// Get company admin wallet
app.get("/api/company-admin/wallet", authenticate, async (req, res, next) => {
  try {
    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error) throw error;

    // Get total shared amount
    const { data: companyAdmin } = await supabase
      .from("company_admins")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    let totalShared = 0;
    if (companyAdmin) {
      const { data: shares } = await supabase
        .from("wallet_shares")
        .select("shared_amount")
        .eq("company_admin_id", companyAdmin.id);

      totalShared =
        shares?.reduce(
          (sum, share) => sum + parseFloat(share.shared_amount),
          0,
        ) || 0;
    }

    res.json({
      success: true,
      wallet: {
        ...wallet,
        total_shared: totalShared,
        available: parseFloat(wallet.balance) - totalShared,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all admins (admin + co-admins) for the company
app.get(
  "/api/company-admin/all-admins",
  authenticate,
  async (req, res, next) => {
    try {
      // Get current company admin to find company_email
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("company_email")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // Get all company_admins with the same company_email
      const { data: allAdmins, error } = await supabase
        .from("company_admins")
        .select("id, user_id, created_at")
        .eq("company_email", companyAdmin.company_email)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get user profiles for each admin
      const adminsWithProfiles = await Promise.all(
        (allAdmins || []).map(async (admin, index) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", admin.user_id)
            .single();

          return {
            id: admin.id,
            email: profile?.email || "Unknown",
            full_name: profile?.full_name || "Unknown",
            role: index === 0 ? "Admin" : "Co-Admin",
            joined_at: admin.created_at,
          };
        }),
      );

      res.json({ success: true, admins: adminsWithProfiles });
    } catch (error) {
      next(error);
    }
  },
);

// Leave company (admin leaves and promotes co-admin to admin)
app.post(
  "/api/company-admin/leave-company",
  authenticate,
  async (req, res, next) => {
    try {
      // Get current company admin
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id, company_email, created_at")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // Get all admins with the same company_email
      const { data: allAdmins, error: fetchError } = await supabase
        .from("company_admins")
        .select("id, user_id, created_at")
        .eq("company_email", companyAdmin.company_email)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      if (!allAdmins || allAdmins.length === 0) {
        return res.status(400).json({ error: "No admins found" });
      }

      // Check if current user is the first admin (Admin, not Co-Admin)
      const isMainAdmin = allAdmins[0].user_id === req.user.id;

      // If this is the last admin, they cannot leave
      if (allAdmins.length === 1) {
        return res.status(400).json({
          error:
            "Cannot leave company as the only admin. Please delete the company instead.",
        });
      }

      // Delete the current admin's record
      const { error: deleteError } = await supabase
        .from("company_admins")
        .delete()
        .eq("user_id", req.user.id);

      if (deleteError) throw deleteError;

      // Update user profile to company type
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: "company" })
        .eq("id", req.user.id);

      if (profileError) throw profileError;

      res.json({
        success: true,
        message: isMainAdmin
          ? "You have left the company and the co-admin has been promoted to admin"
          : "You have left the company",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get all organizations under company
app.get(
  "/api/company-admin/organizations",
  authenticate,
  async (req, res, next) => {
    try {
      // Get company admin (need company_email for matching)
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id, company_email")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // Get ALL company_admins with the same company_email (includes co-admins)
      const { data: allCompanyAdmins } = await supabase
        .from("company_admins")
        .select("id")
        .eq("company_email", companyAdmin.company_email);

      const companyAdminIds = (allCompanyAdmins || []).map((ca) => ca.id);

      // Get organizations for all admins of this company
      const { data: organizations, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .in("company_admin_id", companyAdminIds)
        .order("created_at", { ascending: false });

      if (orgError) throw orgError;

      // Get organization members and profiles for each organization
      const enrichedOrganizations = await Promise.all(
        (organizations || []).map(async (org) => {
          // Get members for this organization
          const { data: members } = await supabase
            .from("organization_members")
            .select("id, user_id, role")
            .eq("organization_id", org.id);

          // Get profiles for these members
          const memberProfiles = await Promise.all(
            (members || []).map(async (member) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", member.user_id)
                .single();

              return {
                ...member,
                profiles: profile,
              };
            }),
          );

          // Get owner's wallet balance
          const { data: ownerWallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", org.owner_id)
            .single();

          // Get wallet shares
          const { data: shares } = await supabase
            .from("wallet_shares")
            .select("shared_amount, shared_at")
            .eq("organization_id", org.id);

          return {
            ...org,
            organization_members: memberProfiles,
            wallet_shares: shares || [],
            owner_wallet_balance: ownerWallet?.balance || 0,
          };
        }),
      );

      res.json({ success: true, organizations: enrichedOrganizations });
    } catch (error) {
      next(error);
    }
  },
);

// Create organization under company
app.post(
  "/api/company-admin/organizations/create",
  authenticate,
  async (req, res, next) => {
    try {
      const { name, description, owner_email } = req.body;

      if (!name || !owner_email) {
        return res
          .status(400)
          .json({ error: "Organization name and owner email are required" });
      }

      // Get company admin
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // Find the owner user by email
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", owner_email)
        .single();

      if (!ownerProfile) {
        return res
          .status(404)
          .json({ error: "Owner user not found with this email" });
      }

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name,
          description: description || null,
          owner_id: ownerProfile.id,
          company_admin_id: companyAdmin.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add owner as member
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: organization.id,
          user_id: ownerProfile.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      res.json({ success: true, organization });
    } catch (error) {
      next(error);
    }
  },
);

// Search for organization owners by email
app.get(
  "/api/company-admin/search-owners",
  authenticate,
  async (req, res, next) => {
    try {
      const { email } = req.query;

      if (!email || email.length < 2) {
        return res.json({ success: true, owners: [] });
      }

      // Get company admin
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // First, get all organizations that are not yet linked to this company
      const { data: availableOrgs, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, owner_id, company_admin_id")
        .or(`company_admin_id.is.null,company_admin_id.neq.${companyAdmin.id}`)
        .limit(50);

      if (orgError) throw orgError;

      if (!availableOrgs || availableOrgs.length === 0) {
        return res.json({ success: true, owners: [] });
      }

      // Get unique owner IDs
      const ownerIds = [...new Set(availableOrgs.map((org) => org.owner_id))];

      // Search for profiles that match the email and are owners of these organizations
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", ownerIds)
        .ilike("email", `%${email}%`)
        .limit(10);

      if (profileError) throw profileError;

      // Map profiles to their organizations
      const filteredOwners = (profiles || [])
        .map((profile) => {
          // Find this owner's available organization
          const availableOrg = availableOrgs.find(
            (org) =>
              org.owner_id === profile.id && org.company_admin_id === null,
          );

          // If no available org (all are already linked), skip this owner
          if (!availableOrg) {
            return null;
          }

          return {
            email: profile.email,
            full_name: profile.full_name || profile.email,
            organization_name: availableOrg.name,
          };
        })
        .filter((owner) => owner !== null);

      res.json({ success: true, owners: filteredOwners });
    } catch (error) {
      next(error);
    }
  },
);

// Invite organization owner to join company
app.post(
  "/api/company-admin/invite-organization",
  authenticate,
  async (req, res, next) => {
    try {
      const { ownerEmail } = req.body;

      if (!ownerEmail) {
        return res.status(400).json({ error: "Owner email is required" });
      }

      // Get company admin
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id, company_name, user_id")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // Check if the owner user exists
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", ownerEmail)
        .single();

      if (!ownerProfile) {
        return res.status(404).json({
          error:
            "User not found with this email. Please ask them to register first.",
        });
      }

      // Check if they already own an organization under this company
      const { data: existingOrg } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("owner_id", ownerProfile.id)
        .eq("company_admin_id", companyAdmin.id)
        .single();

      if (existingOrg) {
        return res.status(400).json({
          error:
            "This organization owner already has an organization under your company",
        });
      }

      // Check if user has an organization in the system (not linked to any company)
      const { data: userOrganizations } = await supabase
        .from("organizations")
        .select("id, name, description, shared_balance")
        .eq("owner_id", ownerProfile.id)
        .is("company_admin_id", null);

      if (!userOrganizations || userOrganizations.length === 0) {
        return res.status(404).json({
          error:
            "This user doesn't have an available organization. They may need to create one first or their organization is already linked to another company.",
        });
      }

      const userOrganization = userOrganizations[0];

      // Link the organization to the company
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          company_admin_id: companyAdmin.id,
        })
        .eq("id", userOrganization.id);

      if (updateError) throw updateError;

      // Get the updated organization with members
      const { data: updatedOrg } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", userOrganization.id)
        .single();

      // Get organization members
      const { data: members } = await supabase
        .from("organization_members")
        .select("id, user_id, role")
        .eq("organization_id", userOrganization.id);

      // Get profiles for members
      const memberProfiles = await Promise.all(
        (members || []).map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .eq("id", member.user_id)
            .single();

          return {
            ...member,
            profiles: profile,
          };
        }),
      );

      const enrichedOrg = {
        ...updatedOrg,
        organization_members: memberProfiles,
      };

      // TODO: Send email notification to the organization owner
      // You can implement email sending here using a service like SendGrid, Resend, etc.

      res.json({
        success: true,
        message: "Organization owner invited and linked successfully!",
        organization: enrichedOrg,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get company admin info for organization owner
app.get(
  "/api/organizations/company-admin-info",
  authenticate,
  async (req, res, next) => {
    try {
      // Get organizations owned by this user
      const { data: organizations, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, company_admin_id")
        .eq("owner_id", req.user.id);

      if (orgError) throw orgError;

      // Find the first organization with a company admin
      const linkedOrg = organizations?.find(
        (org) => org.company_admin_id !== null,
      );

      if (!linkedOrg || !linkedOrg.company_admin_id) {
        return res.json({ linked: false });
      }

      // Get company admin details
      const { data: companyAdmin, error: adminError } = await supabase
        .from("company_admins")
        .select("company_name, company_email, company_phone")
        .eq("id", linkedOrg.company_admin_id)
        .single();

      if (adminError) throw adminError;

      res.json({
        linked: true,
        companyAdmin: companyAdmin,
        organizationName: linkedOrg.name,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get company admin info for a specific organization
app.get(
  "/api/organizations/:organizationId/company-admin",
  authenticate,
  async (req, res, next) => {
    try {
      const { organizationId } = req.params;

      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, company_admin_id, owner_id")
        .eq("id", organizationId)
        .single();

      if (orgError) throw orgError;

      if (!org || !org.company_admin_id) {
        return res.json({ companyAdmin: null });
      }

      // Verify user is owner or member of this organization
      const { data: membership } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", req.user.id)
        .single();

      if (org.owner_id !== req.user.id && !membership) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get company admin details
      const { data: companyAdmin, error: adminError } = await supabase
        .from("company_admins")
        .select("company_name, company_email, company_phone")
        .eq("id", org.company_admin_id)
        .single();

      if (adminError) throw adminError;

      res.json({
        companyAdmin: companyAdmin,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Share wallet balance to organization
app.post(
  "/api/company-admin/wallet/share",
  authenticate,
  async (req, res, next) => {
    try {
      const { organization_id, amount, notes } = req.body;

      if (!organization_id || !amount || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Valid organization ID and amount are required" });
      }

      // Get company admin
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // Check company wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", req.user.id)
        .single();

      // Get current total shared amount
      const { data: shares } = await supabase
        .from("wallet_shares")
        .select("shared_amount")
        .eq("company_admin_id", companyAdmin.id);

      const totalShared =
        shares?.reduce(
          (sum, share) => sum + parseFloat(share.shared_amount),
          0,
        ) || 0;
      const available = parseFloat(wallet.balance) - totalShared;

      if (available < parseFloat(amount)) {
        return res.status(400).json({
          error: "Insufficient balance",
          available,
          requested: parseFloat(amount),
        });
      }

      // Check if organization belongs to this company admin
      const { data: organization } = await supabase
        .from("organizations")
        .select("id, shared_balance, owner_id")
        .eq("id", organization_id)
        .eq("company_admin_id", companyAdmin.id)
        .single();

      if (!organization) {
        return res.status(404).json({
          error: "Organization not found or doesn't belong to this company",
        });
      }

      // Get owner's wallet
      const { data: ownerWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", organization.owner_id)
        .single();

      if (!ownerWallet) {
        return res.status(404).json({
          error: "Owner wallet not found",
        });
      }

      // Check if share already exists
      const { data: existingShare } = await supabase
        .from("wallet_shares")
        .select("id, shared_amount")
        .eq("company_admin_id", companyAdmin.id)
        .eq("organization_id", organization_id)
        .single();

      if (existingShare) {
        // Update existing share
        const newAmount =
          parseFloat(existingShare.shared_amount) + parseFloat(amount);

        const { error: updateError } = await supabase
          .from("wallet_shares")
          .update({
            shared_amount: newAmount,
            shared_at: new Date().toISOString(),
            notes,
          })
          .eq("id", existingShare.id);

        if (updateError) throw updateError;

        // Update organization shared_balance
        const { error: orgError } = await supabase
          .from("organizations")
          .update({
            shared_balance:
              parseFloat(organization.shared_balance) + parseFloat(amount),
          })
          .eq("id", organization_id);

        if (orgError) throw orgError;

        // Credit owner's wallet
        const newOwnerBalance =
          parseFloat(ownerWallet.balance) + parseFloat(amount);
        console.log(
          `💰 Crediting owner wallet (update): ${organization.owner_id}`,
        );
        console.log(`   Old balance: $${ownerWallet.balance}`);
        console.log(`   Adding: $${amount}`);
        console.log(`   New balance: $${newOwnerBalance}`);

        const { error: ownerWalletError } = await supabase
          .from("wallets")
          .update({
            balance: newOwnerBalance,
          })
          .eq("user_id", organization.owner_id);

        if (ownerWalletError) {
          console.error("❌ Error updating owner wallet:", ownerWalletError);
          throw ownerWalletError;
        }

        console.log("✅ Owner wallet updated successfully");
      } else {
        // Create new share
        const { error: shareError } = await supabase
          .from("wallet_shares")
          .insert({
            company_admin_id: companyAdmin.id,
            organization_id,
            shared_amount: amount,
            shared_by: req.user.id,
            notes,
          });

        if (shareError) throw shareError;

        // Update organization shared_balance
        const { error: orgError } = await supabase
          .from("organizations")
          .update({
            shared_balance:
              parseFloat(organization.shared_balance) + parseFloat(amount),
          })
          .eq("id", organization_id);

        if (orgError) throw orgError;

        // Credit owner's wallet
        const newOwnerBalance =
          parseFloat(ownerWallet.balance) + parseFloat(amount);
        console.log(`💰 Crediting owner wallet: ${organization.owner_id}`);
        console.log(`   Old balance: $${ownerWallet.balance}`);
        console.log(`   Adding: $${amount}`);
        console.log(`   New balance: $${newOwnerBalance}`);

        const { error: ownerWalletError } = await supabase
          .from("wallets")
          .update({
            balance: newOwnerBalance,
          })
          .eq("user_id", organization.owner_id);

        if (ownerWalletError) {
          console.error("❌ Error updating owner wallet:", ownerWalletError);
          throw ownerWalletError;
        }

        console.log("✅ Owner wallet updated successfully");
      }

      res.json({
        success: true,
        message: "Wallet balance shared successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get wallet shares
app.get(
  "/api/company-admin/wallet/shares",
  authenticate,
  async (req, res, next) => {
    try {
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      const { data: shares, error } = await supabase
        .from("wallet_shares")
        .select(
          `
        *,
        organizations(
          id,
          name,
          shared_balance
        )
      `,
        )
        .eq("company_admin_id", companyAdmin.id)
        .order("shared_at", { ascending: false });

      if (error) throw error;

      res.json({ success: true, shares: shares || [] });
    } catch (error) {
      next(error);
    }
  },
);

// Get company admin stats
app.get("/api/company-admin/stats", authenticate, async (req, res, next) => {
  try {
    const { data: companyAdmin } = await supabase
      .from("company_admins")
      .select("id, company_email")
      .eq("user_id", req.user.id)
      .single();

    if (!companyAdmin) {
      return res.status(403).json({ error: "Not a company admin" });
    }

    // Get ALL company_admins with the same company_email (includes co-admins)
    const { data: allCompanyAdmins } = await supabase
      .from("company_admins")
      .select("id")
      .eq("company_email", companyAdmin.company_email);

    const companyAdminIds = (allCompanyAdmins || []).map((ca) => ca.id);

    // Get total organizations for all admins of this company
    const { count: totalOrganizations } = await supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .in("company_admin_id", companyAdminIds);

    // Get total shared balance for all admins of this company
    const { data: shares } = await supabase
      .from("wallet_shares")
      .select("shared_amount")
      .in("company_admin_id", companyAdminIds);

    const totalShared =
      shares?.reduce(
        (sum, share) => sum + parseFloat(share.shared_amount),
        0,
      ) || 0;

    // Get total members across all organizations
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id")
      .in("company_admin_id", companyAdminIds);

    let totalMembers = 0;
    if (organizations && organizations.length > 0) {
      const orgIds = organizations.map((org) => org.id);
      const { count: memberCount } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .in("organization_id", orgIds);

      totalMembers = memberCount || 0;
    }

    res.json({
      success: true,
      stats: {
        totalOrganizations: totalOrganizations || 0,
        totalShared: parseFloat(totalShared.toFixed(2)),
        totalMembers,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete organization
app.delete(
  "/api/company-admin/organizations/:id",
  authenticate,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!companyAdmin) {
        return res.status(403).json({ error: "Not a company admin" });
      }

      // Verify organization belongs to this company admin
      const { data: organization } = await supabase
        .from("organizations")
        .select("id, shared_balance")
        .eq("id", id)
        .eq("company_admin_id", companyAdmin.id)
        .single();

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Return the shared balance back to company admin wallet
      if (organization.shared_balance > 0) {
        // Get company admin wallet
        const { data: wallet } = await supabase
          .from("company_admin_wallets")
          .select("balance")
          .eq("company_admin_id", companyAdmin.id)
          .single();

        if (wallet) {
          // Add the shared balance back to company admin wallet
          await supabase
            .from("company_admin_wallets")
            .update({
              balance: wallet.balance + organization.shared_balance,
            })
            .eq("company_admin_id", companyAdmin.id);
        }
      }

      // Delete the organization (cascade will handle members and shares)
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      res.json({
        success: true,
        message: "Organization deleted successfully",
        refunded_amount: organization.shared_balance,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// ORGANIZATION ROUTES
// ============================================================================

// Create organization
app.post("/api/organizations/create", authenticate, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    // Check if user is a company user or company admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", req.user.id)
      .single();

    if (
      !profile ||
      (profile.user_type !== "company" && profile.user_type !== "company_admin")
    ) {
      return res.status(403).json({
        error: "Only company users and company admins can create organizations",
      });
    }

    // Get company admin ID if user is a company admin
    let companyAdminId = null;
    if (profile.user_type === "company_admin") {
      const { data: companyAdmin } = await supabase
        .from("company_admins")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      companyAdminId = companyAdmin?.id || null;
    }

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name,
        description: description || null,
        owner_id: req.user.id,
        company_admin_id: companyAdminId,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Add owner as member
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: req.user.id,
        role: "owner",
      });

    if (memberError) throw memberError;

    res.json({ success: true, organization });
  } catch (error) {
    next(error);
  }
});

// Get user's organizations
app.get(
  "/api/organizations/my-organizations",
  authenticate,
  async (req, res, next) => {
    try {
      // Get organizations where user is owner
      const { data: organizations, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", req.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.json({ success: true, organizations: organizations || [] });
    } catch (error) {
      next(error);
    }
  },
);

// Get user's organization memberships (for normal users)
app.get(
  "/api/organizations/my-memberships",
  authenticate,
  async (req, res, next) => {
    try {
      // Get organization memberships
      const { data: memberships, error } = await supabase
        .from("organization_members")
        .select("organization_id, role, joined_at")
        .eq("user_id", req.user.id);

      if (error) throw error;

      // Fetch organization details and member count
      const organizationsWithDetails = await Promise.all(
        (memberships || []).map(async (membership) => {
          const { data: org } = await supabase
            .from("organizations")
            .select("id, name, owner_id, created_at")
            .eq("id", membership.organization_id)
            .eq("is_active", true)
            .single();

          if (!org) return null;

          // Get owner details
          const { data: owner } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", org.owner_id)
            .single();

          // Get member count
          const { count } = await supabase
            .from("organization_members")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id);

          return {
            id: org.id,
            name: org.name,
            owner_name: owner?.full_name || "Unknown",
            owner_email: owner?.email || "",
            member_count: count || 0,
            joined_at: membership.joined_at,
            role: membership.role,
          };
        }),
      );

      const organizations = organizationsWithDetails.filter(
        (org) => org !== null,
      );

      res.json({ success: true, organizations });
    } catch (error) {
      next(error);
    }
  },
);

// Get organization details
app.get(
  "/api/organizations/:organizationId",
  authenticate,
  async (req, res, next) => {
    try {
      const { organizationId } = req.params;

      const { data: organization, error } = await supabase
        .from("organizations")
        .select(
          `
        *,
        organization_members (
          id,
          user_id,
          role,
          joined_at,
          profiles:user_id (
            full_name,
            email,
            user_type
          )
        )
      `,
        )
        .eq("id", organizationId)
        .single();

      if (error) throw error;

      // Check if user has access
      const isMember = organization.organization_members.some(
        (m) => m.user_id === req.user.id,
      );
      const isOwner = organization.owner_id === req.user.id;

      if (!isMember && !isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json({ success: true, organization, isOwner });
    } catch (error) {
      next(error);
    }
  },
);

// Search for normal users by email
app.get("/api/users/search", authenticate, async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string" || email.trim().length < 2) {
      return res.json({ success: true, users: [] });
    }

    // Search for normal and company users matching the email (exclude admins)
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, user_type")
      .in("user_type", ["normal", "company"])
      .ilike("email", `%${email.trim()}%`)
      .limit(5);

    if (error) throw error;

    res.json({ success: true, users: users || [] });
  } catch (error) {
    next(error);
  }
});

// Send organization invite
app.post(
  "/api/organizations/:organizationId/invite",
  authenticate,
  async (req, res, next) => {
    try {
      const { organizationId } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Get the organization with owner details
      const { data: organization } = await supabase
        .from("organizations")
        .select("owner_id, name")
        .eq("id", organizationId)
        .single();

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Check if user is the owner
      let isAuthorized = organization.owner_id === req.user.id;

      // If not the owner, check if user is a co-admin with same company_email as owner
      if (!isAuthorized) {
        // Get owner's company_email
        const { data: ownerAdmin } = await supabase
          .from("company_admins")
          .select("company_email")
          .eq("user_id", organization.owner_id)
          .single();

        if (ownerAdmin) {
          // Check if current user is a company admin with same company_email
          const { data: currentUserAdmin } = await supabase
            .from("company_admins")
            .select("company_email")
            .eq("user_id", req.user.id)
            .single();

          if (
            currentUserAdmin &&
            currentUserAdmin.company_email === ownerAdmin.company_email
          ) {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({
          error: "Only organization owner or co-admins can send invites",
        });
      }

      // Check if user exists
      const { data: invitedUser } = await supabase
        .from("profiles")
        .select("id, email, full_name, user_type")
        .eq("email", email)
        .single();

      if (!invitedUser) {
        return res
          .status(404)
          .json({ error: "User not found with this email" });
      }

      // Check if user is normal or company user (not admin/co-admin)
      if (
        invitedUser.user_type !== "normal" &&
        invitedUser.user_type !== "company"
      ) {
        return res.status(400).json({
          error: "Can only invite normal or company users to organization",
        });
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", invitedUser.id)
        .single();

      if (existingMember) {
        return res
          .status(400)
          .json({ error: "User is already a member of this organization" });
      }

      // Check for any existing invite
      const { data: existingInvite } = await supabase
        .from("organization_invites")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("invited_email", email)
        .single();

      let invite;
      if (existingInvite) {
        // Update existing invite to pending
        const { data: updatedInvite, error: updateError } = await supabase
          .from("organization_invites")
          .update({
            status: "pending",
            invited_by: req.user.id,
            invited_at: new Date().toISOString(),
            responded_at: null,
          })
          .eq("id", existingInvite.id)
          .select()
          .single();

        if (updateError) throw updateError;
        invite = updatedInvite;
      } else {
        // Create new invite
        const { data: newInvite, error: inviteError } = await supabase
          .from("organization_invites")
          .insert({
            organization_id: organizationId,
            invited_email: email,
            invited_by: req.user.id,
            status: "pending",
          })
          .select()
          .single();

        if (inviteError) throw inviteError;
        invite = newInvite;
      }

      res.json({
        success: true,
        invite,
        message: `Invitation sent to ${email}`,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get pending invites for an organization
app.get(
  "/api/organizations/:organizationId/pending-invites",
  authenticate,
  async (req, res, next) => {
    try {
      const { organizationId } = req.params;

      // Verify user has access to this organization
      const { data: organization } = await supabase
        .from("organizations")
        .select("owner_id, company_admin_id")
        .eq("id", organizationId)
        .single();

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Check if user is owner or company admin
      let hasAccess = organization.owner_id === req.user.id;

      if (!hasAccess && organization.company_admin_id) {
        const { data: companyAdmins } = await supabase
          .from("company_admins")
          .select("user_id")
          .eq("id", organization.company_admin_id);

        if (companyAdmins && companyAdmins.length > 0) {
          hasAccess = companyAdmins.some(
            (admin) => admin.user_id === req.user.id,
          );
        }
      }

      if (!hasAccess) {
        return res
          .status(403)
          .json({ error: "Access denied to this organization" });
      }

      // Fetch pending invites (status = 'pending')
      const { data: invites, error } = await supabase
        .from("organization_invites")
        .select("id, invited_email, invited_at, status")
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("invited_at", { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        invites: invites || [],
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get organization members
app.get(
  "/api/organizations/:organizationId/members",
  authenticate,
  async (req, res, next) => {
    try {
      const { organizationId } = req.params;

      // Get the organization with owner details
      const { data: organization } = await supabase
        .from("organizations")
        .select("owner_id")
        .eq("id", organizationId)
        .single();

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Check if user is the owner
      let isAuthorized = organization.owner_id === req.user.id;

      // If not the owner, check if user is a co-admin with same company_email as owner
      if (!isAuthorized) {
        // Get owner's company_email
        const { data: ownerAdmin } = await supabase
          .from("company_admins")
          .select("company_email")
          .eq("user_id", organization.owner_id)
          .single();

        if (ownerAdmin) {
          // Check if current user is a company admin with same company_email
          const { data: currentUserAdmin } = await supabase
            .from("company_admins")
            .select("company_email")
            .eq("user_id", req.user.id)
            .single();

          if (
            currentUserAdmin &&
            currentUserAdmin.company_email === ownerAdmin.company_email
          ) {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({
          error: "Only organization owner or co-admins can view members",
        });
      }

      // Get organization members
      const { data: members, error } = await supabase
        .from("organization_members")
        .select("id, user_id, role, joined_at")
        .eq("organization_id", organizationId)
        .order("joined_at", { ascending: false });

      if (error) throw error;

      // Manually fetch profile details for each member
      const membersWithDetails = await Promise.all(
        (members || []).map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", member.user_id)
            .single();

          // Get member's wallet balance
          let { data: wallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", member.user_id)
            .single();

          // Create wallet if it doesn't exist
          if (!wallet) {
            const { data: newWallet } = await supabase
              .from("wallets")
              .insert({ user_id: member.user_id, balance: 0 })
              .select()
              .single();
            wallet = newWallet;
          }

          return {
            ...member,
            full_name: profile?.full_name || "Unknown User",
            email: profile?.email || "",
            wallet_balance: wallet?.balance || 0,
          };
        }),
      );

      res.json({ success: true, members: membersWithDetails });
    } catch (error) {
      next(error);
    }
  },
);

// Get pending invites for current user
app.get(
  "/api/organizations/invites/pending",
  authenticate,
  async (req, res, next) => {
    try {
      // Get user's email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", req.user.id)
        .single();

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Get pending invites
      const { data: invites, error } = await supabase
        .from("organization_invites")
        .select("*")
        .eq("invited_email", profile.email)
        .eq("status", "pending")
        .order("invited_at", { ascending: false });

      if (error) throw error;

      // Fetch organization details for each invite
      const invitesWithDetails = await Promise.all(
        (invites || []).map(async (invite) => {
          const { data: org } = await supabase
            .from("organizations")
            .select("id, name, description")
            .eq("id", invite.organization_id)
            .single();

          const { data: inviter } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", invite.invited_by)
            .single();

          return {
            ...invite,
            organizations: org,
            invited_by_profile: inviter,
          };
        }),
      );

      res.json({ success: true, invites: invitesWithDetails });
    } catch (error) {
      next(error);
    }
  },
);

// Accept organization invite
app.post(
  "/api/organizations/invites/:inviteId/accept",
  authenticate,
  async (req, res, next) => {
    try {
      const { inviteId } = req.params;

      // Get user's email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, user_type")
        .eq("id", req.user.id)
        .single();

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Get invite
      const { data: invite } = await supabase
        .from("organization_invites")
        .select("*")
        .eq("id", inviteId)
        .eq("invited_email", profile.email)
        .eq("status", "pending")
        .single();

      if (!invite) {
        return res
          .status(404)
          .json({ error: "Invite not found or already processed" });
      }

      const organizationId = invite.organization_id;

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("user_id", req.user.id)
        .single();

      // Update invite status to accepted
      const { error: inviteUpdateError } = await supabase
        .from("organization_invites")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
        })
        .eq("id", inviteId)
        .eq("status", "pending");

      if (inviteUpdateError) throw inviteUpdateError;

      if (!existingMember) {
        // Add user to organization using upsert to handle duplicates
        const { error: memberError } = await supabase
          .from("organization_members")
          .upsert(
            {
              organization_id: organizationId,
              user_id: req.user.id,
              role: "member",
            },
            {
              onConflict: "organization_id,user_id",
            },
          );

        if (memberError) throw memberError;
      }

      res.json({
        success: true,
        message: "Successfully joined organization",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Reject organization invite
app.post(
  "/api/organizations/invites/:inviteId/reject",
  authenticate,
  async (req, res, next) => {
    try {
      const { inviteId } = req.params;

      // Get user's email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", req.user.id)
        .single();

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Simply delete the invite instead of updating status
      // This avoids unique constraint issues
      const { error } = await supabase
        .from("organization_invites")
        .delete()
        .eq("id", inviteId)
        .eq("invited_email", profile.email)
        .eq("status", "pending");

      if (error) throw error;

      res.json({
        success: true,
        message: "Invite rejected",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Remove member from organization
app.delete(
  "/api/organizations/:organizationId/members/:memberId",
  authenticate,
  async (req, res, next) => {
    try {
      const { organizationId, memberId } = req.params;

      // Get the organization with owner details
      const { data: organization } = await supabase
        .from("organizations")
        .select("owner_id")
        .eq("id", organizationId)
        .single();

      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }

      // Check if user is the owner
      let isAuthorized = organization.owner_id === req.user.id;

      // If not the owner, check if user is a co-admin with same company_email as owner
      if (!isAuthorized) {
        // Get owner's company_email
        const { data: ownerAdmin } = await supabase
          .from("company_admins")
          .select("company_email")
          .eq("user_id", organization.owner_id)
          .single();

        if (ownerAdmin) {
          // Check if current user is a company admin with same company_email
          const { data: currentUserAdmin } = await supabase
            .from("company_admins")
            .select("company_email")
            .eq("user_id", req.user.id)
            .single();

          if (
            currentUserAdmin &&
            currentUserAdmin.company_email === ownerAdmin.company_email
          ) {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({
          error: "Only organization owner or co-admins can remove members",
        });
      }

      // Get the member's user_id and wallet balance before deleting
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("id", memberId)
        .eq("organization_id", organizationId)
        .single();

      if (!memberData) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Get member's current wallet balance from wallets table
      let { data: memberWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", memberData.user_id)
        .single();

      // Create wallet if it doesn't exist
      if (!memberWallet) {
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: memberData.user_id, balance: 0 })
          .select()
          .single();
        memberWallet = newWallet;
      }

      const memberBalance = memberWallet?.balance || 0;

      // Transfer member's credits to organization owner if they have any
      if (memberBalance > 0) {
        // Get or create owner's wallet
        let { data: ownerWallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", organization.owner_id)
          .single();

        if (!ownerWallet) {
          const { data: newWallet } = await supabase
            .from("wallets")
            .insert({ user_id: organization.owner_id, balance: 0 })
            .select()
            .single();
          ownerWallet = newWallet;
        }

        const newOwnerBalance = (ownerWallet?.balance || 0) + memberBalance;

        // Deduct from member wallet
        await supabase
          .from("wallets")
          .update({ balance: 0 })
          .eq("user_id", memberData.user_id);

        // Add to organization owner's wallet
        await supabase
          .from("wallets")
          .update({ balance: newOwnerBalance })
          .eq("user_id", organization.owner_id);

        // Record transaction for member
        await supabase.from("wallet_transactions").insert({
          user_id: memberData.user_id,
          amount: -memberBalance,
          type: "deduction",
          description: `Credits transferred to organization owner upon removal`,
          balance_after: 0,
        });

        // Record transaction for owner
        await supabase.from("wallet_transactions").insert({
          user_id: organization.owner_id,
          amount: memberBalance,
          type: "credit",
          description: `Credits received from removed member`,
          balance_after: newOwnerBalance,
        });
      }

      // Get member's email for invite update
      const { data: memberProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", memberData.user_id)
        .single();

      // Update invite status to revoked if exists
      if (memberProfile?.email) {
        await supabase
          .from("organization_invites")
          .update({ status: "revoked" })
          .eq("organization_id", organizationId)
          .eq("invited_email", memberProfile.email);
      }

      // Delete member
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId)
        .eq("organization_id", organizationId);

      if (error) throw error;

      res.json({
        success: true,
        message:
          memberBalance > 0
            ? `Member removed successfully. $${memberBalance.toFixed(
                2,
              )} transferred to your wallet.`
            : "Member removed successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Leave organization
app.post(
  "/api/organizations/:organizationId/leave",
  authenticate,
  async (req, res, next) => {
    try {
      const { organizationId } = req.params;

      // Check if user is owner
      const { data: organization } = await supabase
        .from("organizations")
        .select("owner_id")
        .eq("id", organizationId)
        .single();

      if (organization && organization.owner_id === req.user.id) {
        return res.status(400).json({
          error:
            "Organization owner cannot leave. Transfer ownership or delete organization first.",
        });
      }

      // Get user's current wallet balance from wallets table
      let { data: userWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", req.user.id)
        .single();

      // Create wallet if it doesn't exist
      if (!userWallet) {
        const { data: newWallet } = await supabase
          .from("wallets")
          .insert({ user_id: req.user.id, balance: 0 })
          .select()
          .single();
        userWallet = newWallet;
      }

      const userBalance = userWallet?.balance || 0;

      // Transfer user's credits to organization owner if they have any
      if (userBalance > 0 && organization) {
        // Get or create owner's wallet
        let { data: ownerWallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", organization.owner_id)
          .single();

        if (!ownerWallet) {
          const { data: newWallet } = await supabase
            .from("wallets")
            .insert({ user_id: organization.owner_id, balance: 0 })
            .select()
            .single();
          ownerWallet = newWallet;
        }

        const newOwnerBalance = (ownerWallet?.balance || 0) + userBalance;

        // Deduct from user wallet
        await supabase
          .from("wallets")
          .update({ balance: 0 })
          .eq("user_id", req.user.id);

        // Add to organization owner's wallet
        await supabase
          .from("wallets")
          .update({ balance: newOwnerBalance })
          .eq("user_id", organization.owner_id);

        // Record transaction for user
        await supabase.from("wallet_transactions").insert({
          user_id: req.user.id,
          amount: -userBalance,
          type: "deduction",
          description: `Credits transferred to organization owner upon leaving`,
          balance_after: 0,
        });

        // Record transaction for owner
        await supabase.from("wallet_transactions").insert({
          user_id: organization.owner_id,
          amount: userBalance,
          type: "credit",
          description: `Credits received from member who left organization`,
          balance_after: newOwnerBalance,
        });
      }

      // Get user's email for invite update
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", req.user.id)
        .single();

      // Update invite status to revoked if exists
      if (userProfile?.email) {
        await supabase
          .from("organization_invites")
          .update({ status: "revoked" })
          .eq("organization_id", organizationId)
          .eq("invited_email", userProfile.email);
      }

      // Remove membership
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", req.user.id);

      if (error) throw error;

      res.json({
        success: true,
        message:
          userBalance > 0
            ? `Left organization successfully. $${userBalance.toFixed(
                2,
              )} transferred to organization owner.`
            : "Left organization successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// TEMPORARY ADMIN ROUTES (NO AUTH REQUIRED - FOR TESTING ONLY)
// Get all users with their enterprise status
app.get("/api/admin/temp/users", async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        created_at,
        enterprise_members (
          id,
          enterprise_id,
          role,
          enterprise_accounts (
            id,
            name,
            business_type
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      is_enterprise:
        user.enterprise_members && user.enterprise_members.length > 0,
      enterprise_info:
        user.enterprise_members && user.enterprise_members.length > 0
          ? user.enterprise_members[0].enterprise_accounts
          : null,
    }));

    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    next(error);
  }
});

// Convert user to enterprise account
app.post("/api/admin/temp/make-enterprise/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { enterpriseName, businessType } = req.body;

    // Check if user exists
    const { data: user } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already in an enterprise
    const { data: existingMember } = await supabase
      .from("enterprise_members")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      return res
        .status(400)
        .json({ error: "User is already in an enterprise" });
    }

    // Create enterprise account
    const { data: enterprise, error: enterpriseError } = await supabase
      .from("enterprise_accounts")
      .insert({
        name: enterpriseName || `${user.full_name || user.email}'s Enterprise`,
        business_type: businessType || "technology",
        admin_id: userId,
        status: "active",
      })
      .select()
      .single();

    if (enterpriseError) throw enterpriseError;

    // Add user as enterprise member
    const { error: memberError } = await supabase
      .from("enterprise_members")
      .insert({
        enterprise_id: enterprise.id,
        user_id: userId,
        role: "admin",
      });

    if (memberError) throw memberError;

    res.json({
      success: true,
      message: "User converted to enterprise account",
      enterprise,
    });
  } catch (error) {
    console.error("Failed to convert user:", error);
    next(error);
  }
});

// Remove user from enterprise
app.post(
  "/api/admin/temp/remove-enterprise/:userId",
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Get user's enterprise membership
      const { data: membership } = await supabase
        .from("enterprise_members")
        .select("enterprise_id")
        .eq("user_id", userId)
        .single();

      if (!membership) {
        return res.status(404).json({ error: "User is not in any enterprise" });
      }

      // Remove from enterprise_members
      const { error: deleteError } = await supabase
        .from("enterprise_members")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      res.json({
        success: true,
        message: "User removed from enterprise",
      });
    } catch (error) {
      console.error("Failed to remove user:", error);
      next(error);
    }
  },
);

app.get(
  "/api/admin/users",
  authenticate,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const { data: users } = await supabase
        .from("profiles")
        .select(`*, wallets (balance, currency), user_roles (role)`)
        .range(offset, parseInt(offset) + parseInt(limit) - 1)
        .order("created_at", { ascending: false });

      res.json({ success: true, users });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/api/admin/enterprises",
  authenticate,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { data: enterprises } = await supabase
        .from("enterprise_accounts")
        .select(
          `*, profiles:admin_id (full_name, email), enterprise_members (count)`,
        )
        .order("created_at", { ascending: false });

      res.json({ success: true, enterprises });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/api/admin/rates",
  authenticate,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { data: rates } = await supabase
        .from("rate_settings")
        .select("*")
        .order("country_name");

      res.json({ success: true, rates });
    } catch (error) {
      next(error);
    }
  },
);

app.put(
  "/api/admin/rates",
  authenticate,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { countryCode, costPerMinute, sellRatePerMinute } = req.body;

      if (!countryCode) {
        return res.status(400).json({ error: "Country code is required" });
      }

      const updates = { updated_at: new Date().toISOString() };
      if (costPerMinute !== undefined) updates.cost_per_minute = costPerMinute;
      if (sellRatePerMinute !== undefined)
        updates.sell_rate_per_minute = sellRatePerMinute;

      await supabase
        .from("rate_settings")
        .update(updates)
        .eq("country_code", countryCode);

      res.json({ success: true, message: "Rates updated successfully" });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/api/admin/call-logs",
  authenticate,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const { data: calls } = await supabase
        .from("call_logs")
        .select(`*, profiles:user_id (full_name, email)`)
        .range(offset, parseInt(offset) + parseInt(limit) - 1)
        .order("started_at", { ascending: false });

      res.json({ success: true, calls });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/api/admin/payments",
  authenticate,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { limit = 100, offset = 0 } = req.query;

      const { data: payments } = await supabase
        .from("payments")
        .select(`*, profiles:user_id (full_name, email)`)
        .range(offset, parseInt(offset) + parseInt(limit) - 1)
        .order("created_at", { ascending: false });

      res.json({ success: true, payments });
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/api/admin/stats",
  authenticate,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalEnterprises } = await supabase
        .from("enterprise_accounts")
        .select("*", { count: "exact", head: true });

      const { count: totalCalls } = await supabase
        .from("call_logs")
        .select("*", { count: "exact", head: true });

      const { data: callLogs } = await supabase
        .from("call_logs")
        .select("billed_amount, profit_margin");

      const totalRevenue =
        callLogs?.reduce((sum, call) => sum + (call.billed_amount || 0), 0) ||
        0;
      const totalProfit =
        callLogs?.reduce((sum, call) => sum + (call.profit_margin || 0), 0) ||
        0;

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalEnterprises,
          totalCalls,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalProfit: parseFloat(totalProfit.toFixed(2)),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// ADMIN ACCESS REQUEST ROUTES
// ============================================================================

// Search existing companies for joining as co-admin
app.get("/api/companies/search", authenticate, async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return res.json({ success: true, companies: [] });
    }

    // Search for companies by name
    const { data: companies, error } = await supabase
      .from("company_admins")
      .select("id, company_name, company_email")
      .ilike("company_name", `%${query.trim()}%`)
      .limit(10);

    if (error) throw error;

    // Remove duplicates based on company_email
    const uniqueCompanies = companies
      ? companies.reduce((acc, company) => {
          const exists = acc.find(
            (c) => c.company_email === company.company_email,
          );
          if (!exists) {
            acc.push(company);
          }
          return acc;
        }, [])
      : [];

    res.json({ success: true, companies: uniqueCompanies });
  } catch (error) {
    next(error);
  }
});

// Create admin access request (company users requesting to become admin)
app.post("/api/admin-access-request", authenticate, async (req, res, next) => {
  try {
    const {
      company_name,
      company_email,
      company_phone,
      company_id,
      request_type,
    } = req.body;

    // Validate based on request type
    if (request_type === "join_existing") {
      if (!company_id) {
        return res.status(400).json({
          error: "Company selection is required for joining existing company",
        });
      }

      // Verify company exists
      const { data: companyExists } = await supabase
        .from("company_admins")
        .select("id, company_name, company_email")
        .eq("id", company_id)
        .single();

      if (!companyExists) {
        return res.status(404).json({
          error: "Selected company not found",
        });
      }
    } else {
      // For creating new company
      if (!company_name || !company_email) {
        return res.status(400).json({
          error: "Company name and email are required",
        });
      }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, user_type")
      .eq("id", req.user.id)
      .single();

    // Check if user is already a company admin
    if (profile?.user_type === "company_admin") {
      return res.status(400).json({
        error: "You are already a company admin",
      });
    }

    // Check if user already has a pending or approved request
    const { data: existingRequest } = await supabase
      .from("admin_access_requests")
      .select("id, status")
      .eq("user_id", req.user.id)
      .single();

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({
          error: "You already have a pending request",
        });
      } else if (existingRequest.status === "approved") {
        return res.status(400).json({
          error: "Your request was already approved",
        });
      } else if (existingRequest.status === "rejected") {
        // Allow resubmission if rejected
        const { error: updateError } = await supabase
          .from("admin_access_requests")
          .update({
            company_name: company_name || null,
            company_email: company_email || null,
            company_phone: company_phone || null,
            company_id: company_id || null,
            request_type: request_type || "create_new",
            status: "pending",
            requested_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            rejection_reason: null,
          })
          .eq("id", existingRequest.id);

        if (updateError) throw updateError;

        return res.json({
          success: true,
          message: "Request resubmitted successfully",
        });
      }
    }

    // Create new request
    const { data: request, error: requestError } = await supabase
      .from("admin_access_requests")
      .insert({
        user_id: req.user.id,
        email: profile.email,
        full_name: profile.full_name || "",
        company_name: company_name || null,
        company_email: company_email || null,
        company_phone: company_phone || null,
        company_id: company_id || null,
        request_type: request_type || "create_new",
        status: "pending",
      })
      .select()
      .single();

    if (requestError) throw requestError;

    res.json({
      success: true,
      message: "Admin access request submitted successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's own admin access request status
app.get(
  "/api/admin-access-request/status",
  authenticate,
  async (req, res, next) => {
    try {
      const { data: request, error } = await supabase
        .from("admin_access_requests")
        .select("*")
        .eq("user_id", req.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      res.json({
        success: true,
        request: request || null,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Cancel admin access request (only if pending)
app.delete(
  "/api/admin-access-request",
  authenticate,
  async (req, res, next) => {
    try {
      const { data: request } = await supabase
        .from("admin_access_requests")
        .select("id, status")
        .eq("user_id", req.user.id)
        .single();

      if (!request) {
        return res.status(404).json({ error: "No request found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          error: "Only pending requests can be cancelled",
        });
      }

      const { error: deleteError } = await supabase
        .from("admin_access_requests")
        .delete()
        .eq("id", request.id);

      if (deleteError) throw deleteError;

      res.json({
        success: true,
        message: "Request cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// SUPER ADMIN ROUTES
// ============================================================================

// Super Admin credentials (temporary hardcoded)
const SUPER_ADMIN_EMAIL = "admin@gmail.com";
const SUPER_ADMIN_PASSWORD = "admin@2026";

// Super Admin middleware
const authenticateSuperAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Simple token validation (token is just email for now)
    if (token === Buffer.from(SUPER_ADMIN_EMAIL).toString("base64")) {
      req.superAdmin = { email: SUPER_ADMIN_EMAIL };
      next();
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Super Admin Login
app.post("/api/super-admin/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      // Generate simple token (base64 encoded email)
      const token = Buffer.from(email).toString("base64");

      res.json({
        success: true,
        token,
        message: "Login successful",
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get Super Admin Stats
app.get(
  "/api/super-admin/stats",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      // Count company admins
      const { count: totalCompanyAdmins } = await supabase
        .from("company_admins")
        .select("*", { count: "exact", head: true });

      // Count organizations
      const { count: totalOrganizations } = await supabase
        .from("organizations")
        .select("*", { count: "exact", head: true });

      // Count normal users (excluding company admins)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, user_type");

      const totalNormalUsers =
        profiles?.filter((p) => p.user_type !== "company").length || 0;

      // Get Twilio balance
      let twilioBalance = 0;
      if (twilioClient) {
        try {
          const balance = await twilioClient.balance.fetch();
          // Twilio balance is returned as an object with balance and currency
          twilioBalance = Math.abs(parseFloat(balance.balance)) || 0;
        } catch (error) {
          console.error("Error fetching Twilio balance:", error);
          // Fallback: try account fetch method
          try {
            const account = await twilioClient.api.v2010
              .accounts(process.env.TWILIO_ACCOUNT_SID)
              .fetch();
            twilioBalance = Math.abs(parseFloat(account.balance)) || 0;
          } catch (fallbackError) {
            console.error(
              "Fallback Twilio balance fetch failed:",
              fallbackError,
            );
            twilioBalance = 0;
          }
        }
      }

      res.json({
        success: true,
        stats: {
          total_company_admins: totalCompanyAdmins || 0,
          total_organizations: totalOrganizations || 0,
          total_normal_users: totalNormalUsers,
          twilio_balance: twilioBalance,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get All Admin Access Requests
app.get(
  "/api/super-admin/admin-access-requests",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { status } = req.query; // Filter by status if provided

      let query = supabase
        .from("admin_access_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data: requests, error } = await query;

      if (error) throw error;

      // Enrich requests with existing company information for join_existing requests
      const enrichedRequests = await Promise.all(
        (requests || []).map(async (request) => {
          if (request.request_type === "join_existing" && request.company_id) {
            const { data: existingCompany } = await supabase
              .from("company_admins")
              .select("company_name, company_email")
              .eq("id", request.company_id)
              .single();

            if (existingCompany) {
              return {
                ...request,
                existing_company_name: existingCompany.company_name,
                existing_company_email: existingCompany.company_email,
              };
            }
          }
          return request;
        }),
      );

      res.json({ success: true, requests: enrichedRequests });
    } catch (error) {
      next(error);
    }
  },
);

// Approve Admin Access Request
app.post(
  "/api/super-admin/approve-admin-request/:requestId",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { requestId } = req.params;

      // Get the request
      const { data: request, error: requestError } = await supabase
        .from("admin_access_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          error: "Only pending requests can be approved",
        });
      }

      let companyAdmin;

      if (request.request_type === "join_existing" && request.company_id) {
        // User wants to join existing company as co-admin

        // Verify the company exists
        const { data: existingCompany, error: companyError } = await supabase
          .from("company_admins")
          .select("*")
          .eq("id", request.company_id)
          .single();

        if (companyError || !existingCompany) {
          return res.status(404).json({ error: "Company not found" });
        }

        // Create company admin entry with same company details
        const { data: newCoAdmin, error: adminError } = await supabase
          .from("company_admins")
          .insert({
            user_id: request.user_id,
            company_name: existingCompany.company_name,
            company_email: existingCompany.company_email,
            company_phone: existingCompany.company_phone,
          })
          .select()
          .single();

        if (adminError) {
          if (adminError.code === "23505") {
            return res.status(400).json({
              error: "User is already a company admin",
            });
          }
          throw adminError;
        }

        companyAdmin = newCoAdmin;
      } else {
        // User wants to create new company

        const { data: newCompanyAdmin, error: adminError } = await supabase
          .from("company_admins")
          .insert({
            user_id: request.user_id,
            company_name: request.company_name,
            company_email: request.company_email,
            company_phone: request.company_phone,
          })
          .select()
          .single();

        if (adminError) {
          if (adminError.code === "23505") {
            return res.status(400).json({
              error: "User is already a company admin",
            });
          }
          throw adminError;
        }

        companyAdmin = newCompanyAdmin;
      }

      // Update user profile to company_admin type
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: "company_admin" })
        .eq("id", request.user_id);

      if (profileError) throw profileError;

      // Update request status to approved
      const { error: updateError } = await supabase
        .from("admin_access_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      res.json({
        success: true,
        message: `Admin access request approved successfully. User ${request.request_type === "join_existing" ? "added as co-admin" : "created new company"}`,
        companyAdmin,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Reject Admin Access Request
app.post(
  "/api/super-admin/reject-admin-request/:requestId",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;

      // Get the request
      const { data: request, error: requestError } = await supabase
        .from("admin_access_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          error: "Only pending requests can be rejected",
        });
      }

      // Update request status to rejected
      const { error: updateError } = await supabase
        .from("admin_access_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      res.json({
        success: true,
        message: "Admin access request rejected",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get All Company Admins (Grouped by Company)
app.get(
  "/api/super-admin/company-admins",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { data: companyAdmins, error } = await supabase
        .from("company_admins")
        .select("id, company_name, company_email, user_id, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by company name and company email
      const companiesMap = new Map();

      for (const admin of companyAdmins) {
        const key = `${admin.company_name}|${admin.company_email}`;

        if (!companiesMap.has(key)) {
          companiesMap.set(key, {
            company_name: admin.company_name,
            company_email: admin.company_email,
            created_at: admin.created_at,
            admin_ids: [admin.id],
            user_ids: [admin.user_id],
          });
        } else {
          const company = companiesMap.get(key);
          company.admin_ids.push(admin.id);
          company.user_ids.push(admin.user_id);
        }
      }

      // Get aggregated data for each unique company
      const enrichedCompanies = await Promise.all(
        Array.from(companiesMap.values()).map(async (company) => {
          // Get total wallet balance from all admins of this company
          const walletPromises = company.user_ids.map(async (userId) => {
            const { data: wallet } = await supabase
              .from("wallets")
              .select("balance")
              .eq("user_id", userId)
              .single();
            return wallet?.balance || 0;
          });
          const walletBalances = await Promise.all(walletPromises);
          const totalWalletBalance = walletBalances.reduce(
            (sum, balance) => sum + balance,
            0,
          );

          // Count total organizations across all admins
          const { count: orgsCount } = await supabase
            .from("organizations")
            .select("*", { count: "exact", head: true })
            .in("company_admin_id", company.admin_ids);

          return {
            company_name: company.company_name,
            company_email: company.company_email,
            wallet_balance: totalWalletBalance,
            organizations_count: orgsCount || 0,
            admins_count: company.admin_ids.length,
            created_at: company.created_at,
          };
        }),
      );

      res.json({
        success: true,
        companyAdmins: enrichedCompanies,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get All Admins for a Specific Company
app.get(
  "/api/super-admin/company/:companyName/admins",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { companyName } = req.params;

      // Get all company_admins with this company name
      const { data: companyAdmins, error } = await supabase
        .from("company_admins")
        .select("id, user_id, created_at, company_email")
        .eq("company_name", companyName)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get user profiles for each admin
      const adminsWithProfiles = await Promise.all(
        (companyAdmins || []).map(async (admin, index) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", admin.user_id)
            .single();

          return {
            id: admin.id,
            email: profile?.email || "Unknown",
            full_name: profile?.full_name || "Unknown",
            role: index === 0 ? "Admin" : "Co-Admin",
            joined_at: admin.created_at,
          };
        }),
      );

      res.json({ success: true, admins: adminsWithProfiles });
    } catch (error) {
      next(error);
    }
  },
);

// Delete a Company
app.delete(
  "/api/super-admin/company/:companyName",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { companyName } = req.params;

      // Get all company admins for this company
      const { data: companyAdmins, error: adminError } = await supabase
        .from("company_admins")
        .select("id, user_id")
        .eq("company_name", companyName);

      if (adminError) throw adminError;

      if (!companyAdmins || companyAdmins.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Company not found",
        });
      }

      // Delete all company admins
      const { error: deleteAdminsError } = await supabase
        .from("company_admins")
        .delete()
        .eq("company_name", companyName);

      if (deleteAdminsError) throw deleteAdminsError;

      // Update user_type back to 'company' for all affected users
      for (const admin of companyAdmins) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ user_type: "company" })
          .eq("id", admin.user_id);

        if (updateError) {
          console.error("Error updating user type:", updateError);
        }
      }

      // Get all organizations owned by this company
      const { data: organizations, error: orgsError } = await supabase
        .from("organizations")
        .select("id")
        .in(
          "owner_id",
          companyAdmins.map((admin) => admin.user_id),
        );

      if (orgsError) throw orgsError;

      // Delete all organization-related data
      if (organizations && organizations.length > 0) {
        const orgIds = organizations.map((org) => org.id);

        // Delete organization members
        await supabase
          .from("organization_members")
          .delete()
          .in("organization_id", orgIds);

        // Delete organization invites
        await supabase
          .from("organization_invites")
          .delete()
          .in("organization_id", orgIds);

        // Delete organizations
        await supabase.from("organizations").delete().in("id", orgIds);
      }

      res.json({
        success: true,
        message: `Company "${companyName}" and all associated data have been deleted`,
        deletedAdmins: companyAdmins.length,
        deletedOrganizations: organizations?.length || 0,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get All Organizations
app.get(
  "/api/super-admin/organizations",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { data: organizations, error } = await supabase
        .from("organizations")
        .select(
          `
        id,
        name,
        shared_balance,
        owner_id,
        created_at,
        company_admins!inner(company_name)
      `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Count members and get owner wallet for each organization
      const enrichedOrgs = await Promise.all(
        organizations.map(async (org) => {
          const { count: membersCount } = await supabase
            .from("organization_members")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id);

          // Get owner's wallet balance
          const { data: ownerWallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", org.owner_id)
            .single();

          return {
            id: org.id,
            name: org.name,
            company_admin_name: org.company_admins.company_name,
            shared_balance: ownerWallet?.balance || 0,
            members_count: membersCount || 0,
            created_at: org.created_at,
          };
        }),
      );

      res.json({
        success: true,
        organizations: enrichedOrgs,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get All Normal Users
app.get(
  "/api/super-admin/users",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, user_type, created_at, country")
        .neq("user_type", "company")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get wallet balance for each user
      const enrichedUsers = await Promise.all(
        profiles.map(async (profile) => {
          const { data: wallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", profile.id)
            .single();

          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            wallet_balance: wallet?.balance || 0,
            created_at: profile.created_at,
            country: profile.country || "Unknown",
          };
        }),
      );

      res.json({
        success: true,
        users: enrichedUsers,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get Organization Members
app.get(
  "/api/super-admin/organizations/:id/members",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Get organization members
      const { data: members, error } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", id);

      if (error) throw error;

      // Get member details
      const memberDetails = await Promise.all(
        (members || []).map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", member.user_id)
            .single();

          return {
            email: profile?.email || "N/A",
            name: profile?.full_name || "N/A",
          };
        }),
      );

      res.json({
        success: true,
        members: memberDetails,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Update User Country (called when user logs in)
app.post("/api/user/update-country", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Detect country from IP using ipapi.co (free tier)
    let country = "Unknown";
    try {
      // Skip for localhost/private IPs - use ipapi without IP parameter to get server location
      if (
        !clientIp ||
        clientIp === "::1" ||
        clientIp.startsWith("127.") ||
        clientIp.startsWith("192.168.")
      ) {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        country = data.country_name || "Unknown";
      } else {
        const response = await fetch(`https://ipapi.co/${clientIp}/json/`);
        const data = await response.json();
        country = data.country_name || "Unknown";
      }
    } catch (error) {
      console.log("Could not detect country from IP:", error.message);
    }

    // Update profiles table with country
    const { error } = await supabase
      .from("profiles")
      .update({ country: country })
      .eq("id", userId);

    if (error) throw error;

    res.json({
      success: true,
      country: country,
    });
  } catch (error) {
    next(error);
  }
});

// Populate country for all existing users (Super Admin only)
app.post(
  "/api/super-admin/populate-countries",
  authenticateSuperAdmin,
  async (req, res, next) => {
    try {
      // Try to get country from request body first, then detect from multiple APIs
      let detectedCountry = req.body?.country || "Unknown";

      if (detectedCountry === "Unknown") {
        // Try multiple geo APIs as fallback
        const geoApis = [
          "https://ipapi.co/json/",
          "https://ip-api.com/json/",
          "https://ipwhois.app/json/",
        ];

        for (const api of geoApis) {
          try {
            const response = await fetch(api, { timeout: 5000 });
            const data = await response.json();
            detectedCountry = data.country_name || data.country || "Unknown";
            if (detectedCountry !== "Unknown") {
              console.log(`Detected country from ${api}:`, detectedCountry);
              break;
            }
          } catch (err) {
            console.log(`Failed to get country from ${api}:`, err.message);
          }
        }
      }

      // If still unknown, default to India (since that's where most users are)
      if (detectedCountry === "Unknown") {
        detectedCountry = "India";
      }

      console.log("Final country to set:", detectedCountry);

      // Update ALL profiles with detected country (force update)
      // Using neq on id with empty string to match ALL rows
      const { data: updated, error } = await supabase
        .from("profiles")
        .update({ country: detectedCountry })
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .select();

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      console.log("Updated profiles count:", updated?.length || 0);

      res.json({
        success: true,
        message: `Updated ${updated?.length || 0} users with country: ${detectedCountry}`,
        updated: updated?.length || 0,
        country: detectedCountry,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Server is ready to accept connections`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please use a different port.`,
    );
  }
  process.exit(1);
});
