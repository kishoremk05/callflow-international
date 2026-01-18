import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twilio client for cost fetching
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Get real call cost from Twilio API using CallSid
 * @param {string} callSid - Twilio Call SID
 * @returns {Promise<{actualCost: number, duration: number, status: string}>}
 */
export const getRealCallCostFromTwilio = async (callSid, maxRetries = 3) => {
  try {
    if (!callSid) {
      throw new Error("CallSid is required to fetch call cost");
    }

    console.log(`🔍 Fetching real cost for call: ${callSid}`);

    // Retry with increasing delays because Twilio pricing can take time to finalize
    const delays = [5000, 10000, 15000]; // 5s, 10s, 15s delays

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = delays[attempt - 1] || 15000;
        console.log(
          `⏳ Attempt ${attempt + 1}/${maxRetries} - waiting ${
            delay / 1000
          }s for Twilio to finalize pricing...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Fetch call details from Twilio API
      const call = await twilioClient.calls(callSid).fetch();

      console.log(
        `💰 Twilio API Response (attempt ${attempt + 1}) for ${callSid}:`,
        {
          rawPrice: call.price,
          duration: `${call.duration}s`,
          status: call.status,
          priceUnit: call.priceUnit,
        }
      );

      // If we have a price, return it
      if (call.price !== null && call.price !== undefined) {
        const actualCost = Math.abs(parseFloat(call.price));
        const duration = parseInt(call.duration) || 0;

        console.log(`✅ Price available: $${actualCost}`);

        return {
          actualCost,
          duration,
          status: call.status,
          twilioPrice: call.price,
          priceUnit: call.priceUnit || "USD",
        };
      }

      console.log(
        `⚠️ Price not yet available (null) - attempt ${
          attempt + 1
        }/${maxRetries}`
      );
    }

    // After all retries, price is still null
    console.error(
      `❌ Twilio price still null after ${maxRetries} attempts for ${callSid}`
    );
    throw new Error(
      `Twilio pricing not available yet - price is null after ${maxRetries} retries`
    );
  } catch (error) {
    console.error(
      `❌ Error fetching real cost for call ${callSid}:`,
      error.message
    );

    // If it's a "not found" error, the call might be too recent
    if (error.message.includes("not found")) {
      console.log(
        `⏰ Call ${callSid} not found - might be too recent, retrying in 3 seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const call = await twilioClient.calls(callSid).fetch();
        const actualCost = call.price ? Math.abs(parseFloat(call.price)) : 0;

        console.log(`💰 Retry successful for ${callSid}: $${actualCost}`);
        return {
          actualCost,
          duration: parseInt(call.duration) || 0,
          status: call.status,
          twilioPrice: call.price,
          priceUnit: call.priceUnit || "USD",
        };
      } catch (retryError) {
        console.error(
          `❌ Retry failed for call ${callSid}:`,
          retryError.message
        );
        throw new Error(
          `Failed to fetch call cost after retry: ${retryError.message}`
        );
      }
    }

    throw new Error(`Failed to fetch call cost from Twilio: ${error.message}`);
  }
};

/**
 * Calculate user charge based on actual Twilio cost
 * @param {number} actualTwilioCost - Real cost from Twilio
 * @param {number} markupPercentage - Markup percentage (default: 0% - exact cost)
 * @returns {number}
 */
export const calculateUserCharge = (actualTwilioCost, markupPercentage = 0) => {
  const markup = (markupPercentage / 100) * actualTwilioCost;
  return actualTwilioCost + markup;
};
