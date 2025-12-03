import twilio from "twilio";
import { twilioConfig } from "../config/twilio.js";
import { supabase } from "../config/supabase.js";
import { AppError } from "../middleware/errorHandler.js";

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export const getTwilioToken = async (req, res, next) => {
  try {
    const identity = req.user.id;

    const token = new AccessToken(
      twilioConfig.accountSid,
      twilioConfig.apiKey,
      twilioConfig.apiSecret,
      { identity }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twilioConfig.twimlAppSid,
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
};

export const getPublicNumber = async (req, res, next) => {
  try {
    // Get public number with least usage
    const { data: publicNumber, error } = await supabase
      .from("public_numbers")
      .select("*")
      .eq("is_active", true)
      .order("usage_count", { ascending: true })
      .limit(1)
      .single();

    if (error || !publicNumber) {
      throw new AppError("No public numbers available", 404);
    }

    // Increment usage count
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
};

export const validateNumber = async (req, res, next) => {
  try {
    const { phoneNumber, countryCode } = req.body;

    if (!phoneNumber) {
      throw new AppError("Phone number is required", 400);
    }

    // Basic validation - you can enhance this
    const isValid = /^\+?[1-9]\d{1,14}$/.test(phoneNumber);

    res.json({
      success: true,
      isValid,
      formattedNumber: phoneNumber,
    });
  } catch (error) {
    next(error);
  }
};
