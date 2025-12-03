import { supabase } from "../config/supabase.js";
import { AppError } from "../middleware/errorHandler.js";

export const createEnterprise = async (req, res, next) => {
  try {
    const { name, maxMembers = 50 } = req.body;

    if (!name) {
      throw new AppError("Enterprise name is required", 400);
    }

    // Create enterprise account
    const { data: enterprise, error } = await supabase
      .from("enterprise_accounts")
      .insert({
        name,
        admin_id: req.user.id,
        max_members: maxMembers,
        shared_balance: 0,
      })
      .select()
      .single();

    if (error) throw new AppError("Failed to create enterprise", 500);

    // Update user role to enterprise_admin
    await supabase.from("user_roles").insert({
      user_id: req.user.id,
      role: "enterprise_admin",
    });

    res.json({
      success: true,
      enterprise,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnterpriseDetails = async (req, res, next) => {
  try {
    const { enterpriseId } = req.params;

    // Check if user is admin or member
    const { data: enterprise, error } = await supabase
      .from("enterprise_accounts")
      .select(
        `
        *,
        enterprise_members (
          id,
          user_id,
          credit_limit,
          used_credits,
          can_make_calls,
          can_purchase_numbers,
          joined_at,
          profiles:user_id (
            full_name,
            email
          )
        )
      `
      )
      .eq("id", enterpriseId)
      .single();

    if (error || !enterprise) {
      throw new AppError("Enterprise not found", 404);
    }

    // Check permissions
    const isAdmin = enterprise.admin_id === req.user.id;
    const isMember = enterprise.enterprise_members.some(
      (m) => m.user_id === req.user.id
    );

    if (!isAdmin && !isMember) {
      throw new AppError("Access denied", 403);
    }

    res.json({
      success: true,
      enterprise,
      isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { enterpriseId } = req.params;
    const {
      email,
      creditLimit = 0,
      canMakeCalls = true,
      canPurchaseNumbers = false,
    } = req.body;

    // Verify admin access
    const { data: enterprise } = await supabase
      .from("enterprise_accounts")
      .select("admin_id, max_members")
      .eq("id", enterpriseId)
      .single();

    if (!enterprise || enterprise.admin_id !== req.user.id) {
      throw new AppError("Access denied", 403);
    }

    // Check member count
    const { count } = await supabase
      .from("enterprise_members")
      .select("*", { count: "exact", head: true })
      .eq("enterprise_id", enterpriseId);

    if (count >= enterprise.max_members) {
      throw new AppError("Maximum member limit reached", 400);
    }

    // Find user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      throw new AppError("User not found", 404);
    }

    // Add member
    const { data: member, error } = await supabase
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

    if (error) throw new AppError("Failed to add member", 500);

    // Update user role
    await supabase.from("user_roles").insert({
      user_id: profile.id,
      role: "enterprise_member",
    });

    res.json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { enterpriseId, memberId } = req.params;

    // Verify admin access
    const { data: enterprise } = await supabase
      .from("enterprise_accounts")
      .select("admin_id")
      .eq("id", enterpriseId)
      .single();

    if (!enterprise || enterprise.admin_id !== req.user.id) {
      throw new AppError("Access denied", 403);
    }

    const { error } = await supabase
      .from("enterprise_members")
      .delete()
      .eq("id", memberId)
      .eq("enterprise_id", enterpriseId);

    if (error) throw new AppError("Failed to remove member", 500);

    res.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberPermissions = async (req, res, next) => {
  try {
    const { enterpriseId, memberId } = req.params;
    const { creditLimit, canMakeCalls, canPurchaseNumbers } = req.body;

    // Verify admin access
    const { data: enterprise } = await supabase
      .from("enterprise_accounts")
      .select("admin_id")
      .eq("id", enterpriseId)
      .single();

    if (!enterprise || enterprise.admin_id !== req.user.id) {
      throw new AppError("Access denied", 403);
    }

    const updates = {};
    if (creditLimit !== undefined) updates.credit_limit = creditLimit;
    if (canMakeCalls !== undefined) updates.can_make_calls = canMakeCalls;
    if (canPurchaseNumbers !== undefined)
      updates.can_purchase_numbers = canPurchaseNumbers;

    const { error } = await supabase
      .from("enterprise_members")
      .update(updates)
      .eq("id", memberId)
      .eq("enterprise_id", enterpriseId);

    if (error) throw new AppError("Failed to update permissions", 500);

    res.json({
      success: true,
      message: "Permissions updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const shareCredits = async (req, res, next) => {
  try {
    const { enterpriseId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError("Invalid amount", 400);
    }

    // Verify admin access and check balance
    const { data: enterprise } = await supabase
      .from("enterprise_accounts")
      .select("admin_id, shared_balance")
      .eq("id", enterpriseId)
      .single();

    if (!enterprise || enterprise.admin_id !== req.user.id) {
      throw new AppError("Access denied", 403);
    }

    // Get admin wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (!wallet || wallet.balance < amount) {
      throw new AppError("Insufficient balance", 400);
    }

    // Transfer credits
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
};

export const getEnterpriseUsage = async (req, res, next) => {
  try {
    const { enterpriseId } = req.params;

    // Verify access
    const { data: enterprise } = await supabase
      .from("enterprise_accounts")
      .select("admin_id")
      .eq("id", enterpriseId)
      .single();

    if (!enterprise || enterprise.admin_id !== req.user.id) {
      throw new AppError("Access denied", 403);
    }

    // Get call logs for enterprise
    const { data: calls } = await supabase
      .from("call_logs")
      .select("user_id, duration_seconds, billed_amount")
      .eq("enterprise_id", enterpriseId);

    // Aggregate by user
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

    res.json({
      success: true,
      usage: usageByUser,
    });
  } catch (error) {
    next(error);
  }
};
