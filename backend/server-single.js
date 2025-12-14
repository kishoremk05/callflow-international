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

dotenv.config();

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
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
      process.env.TWILIO_AUTH_TOKEN
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
      if (origin && (
        origin.includes('.vercel.app') || 
        origin.includes('vercel.app') ||
        allowedOrigins.includes(origin)
      )) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, true); // Allow anyway in production to avoid blocking
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(
  "/api/payments/stripe-webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      { identity }
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
  <Dial callerId="${callerIdToUse}">${To}</Dial>
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
  }
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
  }
);

// ============================================================================
// CALL ROUTES
// ============================================================================

app.post("/api/calls/initiate", authenticate, async (req, res, next) => {
  try {
    const { toNumber, toCountryCode, callerIdType, callerIdNumber } = req.body;

    if (!toNumber || !toCountryCode) {
      return res
        .status(400)
        .json({ error: "To number and country code are required" });
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (!wallet || wallet.balance <= 0) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const { data: rate } = await supabase
      .from("rate_settings")
      .select("sell_rate_per_minute, cost_per_minute")
      .eq("country_code", toCountryCode)
      .single();

    if (!rate) {
      return res.status(400).json({ error: "Country not supported" });
    }

    const { data: callLog } = await supabase
      .from("call_logs")
      .insert({
        user_id: req.user.id,
        from_number: req.user.id,
        to_number: toNumber,
        to_country_code: toCountryCode,
        caller_id_type: callerIdType || "public",
        caller_id_number: callerIdNumber || "",
        status: "initiated",
      })
      .select()
      .single();

    res.json({
      success: true,
      callId: callLog.id,
      ratePerMinute: rate.sell_rate_per_minute,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/calls/end", authenticate, async (req, res, next) => {
  try {
    const { callId, durationSeconds } = req.body;

    const { data: callLog } = await supabase
      .from("call_logs")
      .select("*, to_country_code")
      .eq("id", callId)
      .eq("user_id", req.user.id)
      .single();

    if (!callLog) {
      return res.status(404).json({ error: "Call log not found" });
    }

    const { data: rate } = await supabase
      .from("rate_settings")
      .select("sell_rate_per_minute, cost_per_minute")
      .eq("country_code", callLog.to_country_code)
      .single();

    const durationMinutes = (durationSeconds || 0) / 60;
    const billedAmount = durationMinutes * (rate?.sell_rate_per_minute || 0);
    const twilioEstimatedCost = durationMinutes * (rate?.cost_per_minute || 0);
    const profitMargin = billedAmount - twilioEstimatedCost;

    await supabase
      .from("call_logs")
      .update({
        status: "completed",
        duration_seconds: durationSeconds || 0,
        billed_amount: billedAmount,
        twilio_cost: twilioEstimatedCost,
        profit_margin: profitMargin,
        ended_at: new Date().toISOString(),
      })
      .eq("id", callId);

    if (durationSeconds > 0) {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", req.user.id)
        .single();

      const newBalance = parseFloat(wallet.balance) - billedAmount;

      await supabase
        .from("wallets")
        .update({ balance: Math.max(0, newBalance) })
        .eq("user_id", req.user.id);
    }

    res.json({ success: true, billedAmount, durationSeconds, profitMargin });
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
  }
);

app.post("/api/payments/stripe-webhook", async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
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
  }
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
      `
        )
        .eq("id", enterpriseId)
        .single();

      if (!enterprise) {
        return res.status(404).json({ error: "Enterprise not found" });
      }

      const isAdmin = enterprise.admin_id === req.user.id;
      const isMember = enterprise.enterprise_members?.some(
        (m) => m.user_id === req.user.id
      );

      if (!isAdmin && !isMember) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json({ success: true, enterprise, isAdmin });
    } catch (error) {
      next(error);
    }
  }
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
  }
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
  }
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
  }
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

    // Verify user is part of an enterprise
    const { data: enterpriseMember } = await supabase
      .from("enterprise_members")
      .select("enterprise_id, enterprise_accounts(name)")
      .eq("user_id", req.user.id)
      .single();

    if (!enterpriseMember) {
      return res.status(403).json({
        error: "Internal calls are only available for enterprise users",
      });
    }

    // Create room ID scoped to enterprise
    const roomId = `${enterpriseMember.enterprise_id}-${roomName}`;

    // Generate LiveKit access token
    const at = new LiveKitAccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: req.user.id,
        name: participantName,
        ttl: "24h", // Token valid for 24 hours
      }
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
      .select("id")
      .eq("room_id", roomId)
      .eq("status", "active")
      .single();

    let callId = existingCall?.id;

    if (!existingCall) {
      // Create new call record
      const { data: newCall, error: callError } = await supabase
        .from("internal_calls")
        .insert({
          room_id: roomId,
          room_name: roomName,
          enterprise_id: enterpriseMember.enterprise_id,
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
      }
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
      enterpriseName: enterpriseMember.enterprise_accounts?.name,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    next(error);
  }
});

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
      `
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
  }
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
  }
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
                `📞 Calling contact: ${contact.name} at ${fullPhoneNumber}`
              );
            } catch (callError) {
              console.error(
                `Failed to call ${contact.name}:`,
                callError.message
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
  }
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
              } at ${fullPhoneNumber}`
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
  }
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
      `
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
  }
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
  }
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
  }
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
  }
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

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
  }
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
          `*, profiles:admin_id (full_name, email), enterprise_members (count)`
        )
        .order("created_at", { ascending: false });

      res.json({ success: true, enterprises });
    } catch (error) {
      next(error);
    }
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
      `Port ${PORT} is already in use. Please use a different port.`
    );
  }
  process.exit(1);
});
