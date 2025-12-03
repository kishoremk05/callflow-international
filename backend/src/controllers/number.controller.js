import { twilioClient } from "../config/twilio.js";
import { supabase } from "../config/supabase.js";
import { AppError } from "../middleware/errorHandler.js";

export const searchAvailableNumbers = async (req, res, next) => {
  try {
    const { countryCode = "US", areaCode, type = "local" } = req.query;

    const searchParams = {
      limit: 20,
    };

    if (areaCode) {
      searchParams.areaCode = areaCode;
    }

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
};

export const purchaseNumber = async (req, res, next) => {
  try {
    const { phoneNumber, countryCode } = req.body;

    if (!phoneNumber) {
      throw new AppError("Phone number is required", 400);
    }

    // Check wallet balance (assuming $5/month cost)
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", req.user.id)
      .single();

    if (!wallet || wallet.balance < 5) {
      throw new AppError("Insufficient balance to purchase number", 400);
    }

    // Purchase number from Twilio
    const incomingNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber,
      friendlyName: `User ${req.user.id}`,
    });

    // Save to database
    const { data: purchasedNumber, error } = await supabase
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

    if (error) throw new AppError("Failed to save purchased number", 500);

    // Deduct from wallet
    const newBalance = parseFloat(wallet.balance) - 5.0;
    await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", req.user.id);

    res.json({
      success: true,
      number: purchasedNumber,
      newBalance,
    });
  } catch (error) {
    next(error);
  }
};

export const releaseNumber = async (req, res, next) => {
  try {
    const { numberId } = req.params;

    // Get number details
    const { data: number, error: fetchError } = await supabase
      .from("purchased_numbers")
      .select("*")
      .eq("id", numberId)
      .eq("user_id", req.user.id)
      .single();

    if (fetchError || !number) {
      throw new AppError("Number not found", 404);
    }

    // Release from Twilio
    await twilioClient.incomingPhoneNumbers(number.twilio_sid).remove();

    // Update database
    const { error: updateError } = await supabase
      .from("purchased_numbers")
      .update({ is_active: false })
      .eq("id", numberId);

    if (updateError) throw new AppError("Failed to release number", 500);

    res.json({
      success: true,
      message: "Number released successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchasedNumbers = async (req, res, next) => {
  try {
    const { data: numbers, error } = await supabase
      .from("purchased_numbers")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("is_active", true)
      .order("purchased_at", { ascending: false });

    if (error) throw new AppError("Failed to fetch purchased numbers", 500);

    res.json({ success: true, numbers });
  } catch (error) {
    next(error);
  }
};
