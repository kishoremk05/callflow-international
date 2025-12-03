import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { AppError } from "../middleware/errorHandler.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = "USD", provider = "stripe" } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError("Invalid amount", 400);
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
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

    if (paymentError)
      throw new AppError("Failed to create payment record", 500);

    if (provider === "stripe") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userId: req.user.id,
          paymentId: payment.id,
        },
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
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency: "INR",
        receipt: payment.id,
        notes: {
          userId: req.user.id,
          paymentId: payment.id,
        },
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
    } else {
      throw new AppError("Invalid payment provider", 400);
    }
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (req, res, next) => {
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

      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "completed",
          credits_added: paymentIntent.amount / 100,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      // Add credits to wallet
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
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      throw new AppError("Invalid signature", 400);
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      const paymentId = payment.notes.paymentId;
      const userId = payment.notes.userId;

      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "completed",
          credits_added: payment.amount / 100,
          provider_payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      // Add credits to wallet
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
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError("Failed to fetch payment history", 500);

    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};
