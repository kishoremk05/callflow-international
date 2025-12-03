import { supabase } from "../config/supabase.js";
import { AppError } from "../middleware/errorHandler.js";

export const getWalletBalance = async (req, res, next) => {
  try {
    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("balance, currency")
      .eq("user_id", req.user.id)
      .single();

    if (error) throw new AppError("Failed to fetch wallet balance", 500);

    res.json({ success: true, wallet });
  } catch (error) {
    next(error);
  }
};

export const addCredits = async (req, res, next) => {
  try {
    const { amount, paymentId } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError("Invalid amount", 400);
    }

    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (error) throw new AppError("Wallet not found", 404);

    const newBalance = parseFloat(wallet.balance) + parseFloat(amount);

    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", req.user.id);

    if (updateError) throw new AppError("Failed to update balance", 500);

    res.json({
      success: true,
      balance: newBalance,
      message: "Credits added successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deductCredits = async (req, res, next) => {
  try {
    const { amount, callId } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError("Invalid amount", 400);
    }

    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (error) throw new AppError("Wallet not found", 404);

    const currentBalance = parseFloat(wallet.balance);

    if (currentBalance < amount) {
      throw new AppError("Insufficient balance", 400);
    }

    const newBalance = currentBalance - parseFloat(amount);

    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", req.user.id);

    if (updateError) throw new AppError("Failed to deduct credits", 500);

    res.json({
      success: true,
      balance: newBalance,
      deducted: amount,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req, res, next) => {
  try {
    const { data: transactions, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw new AppError("Failed to fetch transactions", 500);

    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};
