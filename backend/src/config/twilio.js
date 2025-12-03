import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("Missing Twilio environment variables");
}

export const twilioClient = twilio(accountSid, authToken);

export const twilioConfig = {
  accountSid,
  authToken,
  apiKey: process.env.TWILIO_API_KEY,
  apiSecret: process.env.TWILIO_API_SECRET,
  twimlAppSid: process.env.TWILIO_TWIML_APP_SID,
};
