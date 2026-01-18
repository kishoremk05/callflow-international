const { supabase } = require("../config/supabase");

/**
 * Get pricing for a destination number
 * @param {string} destinationNumber - The phone number to look up pricing for
 * @returns {Promise<Object>} Pricing information
 */
async function getCallPricing(destinationNumber) {
  try {
    // Remove + and any non-numeric characters
    const cleanNumber = destinationNumber.replace(/\D/g, "");

    // Call the database function
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

    // Fallback pricing
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
 * Calculate estimated cost for a call
 * @param {string} destinationNumber - The destination phone number
 * @param {number} estimatedDurationMinutes - Estimated call duration in minutes
 * @returns {Promise<Object>} Cost estimation
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
 * Reserve funds for a call before it starts
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID (optional)
 * @param {string} callSid - Twilio Call SID
 * @param {number} estimatedCost - Estimated cost of the call
 * @returns {Promise<Object>} Reserve transaction result
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
 * Settle actual call cost after the call ends
 * @param {string} callSid - Twilio Call SID
 * @param {number} actualCost - Actual cost of the call
 * @returns {Promise<Object>} Settle transaction result
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

/**
 * Create a call cost record
 * @param {Object} callData - Call information
 * @returns {Promise<Object>} Created record
 */
async function createCallCostRecord(callData) {
  try {
    const {
      callSid,
      userId,
      organizationId,
      fromNumber,
      toNumber,
      pricingId,
      ratePerMinute,
      markupPercentage,
      finalRatePerMinute,
      estimatedCost,
      reserveTransactionId,
    } = callData;

    // Extract destination info
    const cleanNumber = toNumber.replace(/\D/g, "");

    const record = {
      call_sid: callSid,
      user_id: userId,
      organization_id: organizationId,
      from_number: fromNumber,
      to_number: toNumber,
      destination_prefix: cleanNumber.substring(0, 5),
      pricing_id: pricingId,
      rate_per_minute: ratePerMinute,
      markup_percentage: markupPercentage,
      final_rate_per_minute: finalRatePerMinute,
      estimated_cost: estimatedCost,
      reserve_transaction_id: reserveTransactionId,
      call_started_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("call_cost_records")
      .insert([record])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      record: data,
    };
  } catch (error) {
    console.error("Error creating call cost record:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update call cost record with actual details
 * @param {string} callSid - Twilio Call SID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated record
 */
async function updateCallCostRecord(callSid, updateData) {
  try {
    const { data, error } = await supabase
      .from("call_cost_records")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("call_sid", callSid)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      record: data,
    };
  } catch (error) {
    console.error("Error updating call cost record:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get user's wallet balance
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Balance information
 */
async function getWalletBalance(userId, organizationId = null) {
  try {
    let query = supabase.from("wallets").select("wallet_balance, currency");

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) throw error;

    return {
      success: true,
      balance: parseFloat(data.wallet_balance || 0),
      currency: data.currency || "USD",
    };
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return {
      success: false,
      error: error.message,
      balance: 0,
    };
  }
}

/**
 * Check if user has sufficient balance for a call
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID (optional)
 * @param {number} requiredAmount - Required amount
 * @returns {Promise<Object>} Balance check result
 */
async function checkSufficientBalance(userId, organizationId, requiredAmount) {
  try {
    const balanceResult = await getWalletBalance(userId, organizationId);

    if (!balanceResult.success) {
      return {
        success: false,
        hasSufficientFunds: false,
        error: balanceResult.error,
      };
    }

    const hasSufficientFunds = balanceResult.balance >= requiredAmount;

    return {
      success: true,
      hasSufficientFunds,
      currentBalance: balanceResult.balance,
      requiredAmount,
      shortfall: hasSufficientFunds
        ? 0
        : requiredAmount - balanceResult.balance,
    };
  } catch (error) {
    console.error("Error checking balance:", error);
    return {
      success: false,
      hasSufficientFunds: false,
      error: error.message,
    };
  }
}

module.exports = {
  getCallPricing,
  estimateCallCost,
  reserveCallFunds,
  settleCallCost,
  createCallCostRecord,
  updateCallCostRecord,
  getWalletBalance,
  checkSufficientBalance,
};
