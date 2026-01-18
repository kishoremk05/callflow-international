// Quick test script to verify database state
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

console.log("🔍 Checking Recent Call Costs...");

try {
  // Get recent calls with costs
  const { data: calls, error } = await supabase
    .from("call_logs")
    .select(
      "id, to_number, duration_seconds, billed_amount, twilio_cost, twilio_call_sid, status"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error fetching calls:", error);
  } else {
    console.log("📋 Recent Calls:");
    calls.forEach((call) => {
      console.log(`   Call to ${call.to_number}: ${call.status}`);
      console.log(`   Duration: ${call.duration_seconds}s`);
      console.log(`   Billed: $${call.billed_amount || 0}`);
      console.log(`   Twilio Cost: $${call.twilio_cost || 0}`);
      console.log(`   CallSid: ${call.twilio_call_sid || "Not set"}`);
      console.log("   ---");
    });
  }

  console.log("✅ Database check complete!");
} catch (error) {
  console.error("❌ Database connection error:", error);
}

process.exit(0);
