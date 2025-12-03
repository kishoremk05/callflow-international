import { supabase } from "../config/supabase.js";
import { twilioClient } from "../config/twilio.js";
import { AppError } from "../middleware/errorHandler.js";

export const initiateCall = async (req, res, next) => {
  try {
    const { toNumber, toCountryCode, callerIdType, callerIdNumber } = req.body;

    if (!toNumber || !toCountryCode) {
      throw new AppError("To number and country code are required", 400);
    }

    // Check wallet balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (!wallet || wallet.balance <= 0) {
      throw new AppError("Insufficient balance", 400);
    }

    // Get rate for country
    const { data: rate } = await supabase
      .from("rate_settings")
      .select("sell_rate_per_minute, cost_per_minute")
      .eq("country_code", toCountryCode)
      .single();

    if (!rate) {
      throw new AppError("Country not supported", 400);
    }

    // Create call log entry
    const { data: callLog, error: logError } = await supabase
      .from("call_logs")
      .insert({
        user_id: req.user.id,
        from_number: req.user.id, // User identity
        to_number: toNumber,
        to_country_code: toCountryCode,
        caller_id_type: callerIdType || "public",
        caller_id_number: callerIdNumber || "",
        status: "initiated",
      })
      .select()
      .single();

    if (logError) throw new AppError("Failed to create call log", 500);

    res.json({
      success: true,
      callId: callLog.id,
      ratePerMinute: rate.sell_rate_per_minute,
      estimatedCost: rate.sell_rate_per_minute * 1, // Estimate for 1 minute
    });
  } catch (error) {
    next(error);
  }
};

export const endCall = async (req, res, next) => {
  try {
    const { callId, durationSeconds, twilioCallSid, twilioError } = req.body;

    if (!callId) {
      throw new AppError("Call ID is required", 400);
    }

    // Get call log
    const { data: callLog } = await supabase
      .from("call_logs")
      .select("*, to_country_code")
      .eq("id", callId)
      .eq("user_id", req.user.id)
      .single();

    if (!callLog) {
      throw new AppError("Call log not found", 404);
    }

    // Get rate
    const { data: rate } = await supabase
      .from("rate_settings")
      .select("sell_rate_per_minute, cost_per_minute")
      .eq("country_code", callLog.to_country_code)
      .single();

    const durationMinutes = (durationSeconds || 0) / 60;
    const billedAmount = durationMinutes * (rate?.sell_rate_per_minute || 0);
    const twilioEstimatedCost = durationMinutes * (rate?.cost_per_minute || 0);
    const profitMargin = billedAmount - twilioEstimatedCost;

    // Update call log
    const { error: updateError } = await supabase
      .from("call_logs")
      .update({
        status: twilioError ? "failed" : "completed",
        duration_seconds: durationSeconds || 0,
        twilio_call_sid: twilioCallSid,
        billed_amount: billedAmount,
        twilio_cost: twilioEstimatedCost,
        profit_margin: profitMargin,
        ended_at: new Date().toISOString(),
      })
      .eq("id", callId);

    if (updateError) throw new AppError("Failed to update call log", 500);

    // Deduct from wallet if call completed
    if (!twilioError && durationSeconds > 0) {
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

    res.json({
      success: true,
      billedAmount,
      durationSeconds,
      profitMargin,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCallStatus = async (req, res, next) => {
  try {
    const { callId, status } = req.body;

    if (!callId || !status) {
      throw new AppError("Call ID and status are required", 400);
    }

    const { error } = await supabase
      .from("call_logs")
      .update({ status })
      .eq("id", callId)
      .eq("user_id", req.user.id);

    if (error) throw new AppError("Failed to update call status", 500);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getCallHistory = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: calls, error } = await supabase
      .from("call_logs")
      .select("*")
      .eq("user_id", req.user.id)
      .order("started_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError("Failed to fetch call history", 500);

    res.json({ success: true, calls });
  } catch (error) {
    next(error);
  }
};

export const getCallStats = async (req, res, next) => {
  try {
    const { data: calls, error } = await supabase
      .from("call_logs")
      .select("duration_seconds, billed_amount, started_at")
      .eq("user_id", req.user.id);

    if (error) throw new AppError("Failed to fetch call stats", 500);

    const totalCalls = calls.length;
    const totalMinutes =
      calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) / 60;
    const totalSpent = calls.reduce(
      (sum, call) => sum + (call.billed_amount || 0),
      0
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = calls
      .filter((call) => new Date(call.started_at) >= startOfMonth)
      .reduce((sum, call) => sum + (call.billed_amount || 0), 0);

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
};
