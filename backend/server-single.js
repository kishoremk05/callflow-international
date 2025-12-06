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

dotenv.config();

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Initialize Twilio (optional for development)
let twilioClient = null;
let AccessToken = null;
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
    AccessToken = twilio.jwt.AccessToken;
    VoiceGrant = AccessToken.VoiceGrant;
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
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
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
    if (!twilioClient || !AccessToken) {
      return res.status(503).json({ error: "Twilio not configured" });
    }
    const identity = req.user.id;
    const token = new AccessToken(
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
