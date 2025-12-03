import { supabase } from "../config/supabase.js";
import { AppError } from "../middleware/errorHandler.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: users, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        wallets (balance, currency),
        user_roles (role)
      `
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw new AppError("Failed to fetch users", 500);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const getAllEnterprises = async (req, res, next) => {
  try {
    const { data: enterprises, error } = await supabase
      .from("enterprise_accounts")
      .select(
        `
        *,
        profiles:admin_id (full_name, email),
        enterprise_members (count)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw new AppError("Failed to fetch enterprises", 500);

    res.json({ success: true, enterprises });
  } catch (error) {
    next(error);
  }
};

export const getRates = async (req, res, next) => {
  try {
    const { data: rates, error } = await supabase
      .from("rate_settings")
      .select("*")
      .order("country_name");

    if (error) throw new AppError("Failed to fetch rates", 500);

    res.json({ success: true, rates });
  } catch (error) {
    next(error);
  }
};

export const updateRates = async (req, res, next) => {
  try {
    const { countryCode, costPerMinute, sellRatePerMinute } = req.body;

    if (!countryCode) {
      throw new AppError("Country code is required", 400);
    }

    const updates = {};
    if (costPerMinute !== undefined) updates.cost_per_minute = costPerMinute;
    if (sellRatePerMinute !== undefined)
      updates.sell_rate_per_minute = sellRatePerMinute;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("rate_settings")
      .update(updates)
      .eq("country_code", countryCode);

    if (error) throw new AppError("Failed to update rates", 500);

    res.json({
      success: true,
      message: "Rates updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCallLogs = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0, userId, status } = req.query;

    let query = supabase
      .from("call_logs")
      .select(
        `
        *,
        profiles:user_id (full_name, email)
      `
      )
      .range(offset, offset + limit - 1)
      .order("started_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: calls, error } = await query;

    if (error) throw new AppError("Failed to fetch call logs", 500);

    res.json({ success: true, calls });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        profiles:user_id (full_name, email)
      `
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw new AppError("Failed to fetch payments", 500);

    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

export const getPurchasedNumbers = async (req, res, next) => {
  try {
    const { data: numbers, error } = await supabase
      .from("purchased_numbers")
      .select(
        `
        *,
        profiles:user_id (full_name, email)
      `
      )
      .eq("is_active", true)
      .order("purchased_at", { ascending: false });

    if (error) throw new AppError("Failed to fetch purchased numbers", 500);

    res.json({ success: true, numbers });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get total enterprises
    const { count: totalEnterprises } = await supabase
      .from("enterprise_accounts")
      .select("*", { count: "exact", head: true });

    // Get total calls
    const { count: totalCalls } = await supabase
      .from("call_logs")
      .select("*", { count: "exact", head: true });

    // Get revenue stats
    const { data: callLogs } = await supabase
      .from("call_logs")
      .select("billed_amount, profit_margin");

    const totalRevenue =
      callLogs?.reduce((sum, call) => sum + (call.billed_amount || 0), 0) || 0;
    const totalProfit =
      callLogs?.reduce((sum, call) => sum + (call.profit_margin || 0), 0) || 0;

    // Get this month stats
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const { data: monthCalls } = await supabase
      .from("call_logs")
      .select("billed_amount")
      .gte("started_at", startOfMonth);

    const monthRevenue =
      monthCalls?.reduce((sum, call) => sum + (call.billed_amount || 0), 0) ||
      0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEnterprises,
        totalCalls,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        monthRevenue: parseFloat(monthRevenue.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};
