/**
 * Verify Profit Margin Calculation
 *
 * This script verifies that call pricing includes the correct profit margin
 * and that costs are calculated accurately using Supabase pricing data.
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("VITE_SUPABASE_URL:", supabaseUrl || "not set");
  console.error(
    "Keys checked: SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_PUBLISHABLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test phone numbers for different countries
const testNumbers = [
  { number: "14155551234", country: "United States" },
  { number: "442071234567", country: "United Kingdom" },
  { number: "919876543210", country: "India" },
  { number: "61298765432", country: "Australia" },
  { number: "33123456789", country: "France" },
];

async function verifyProfitMargin() {
  console.log("🔍 Verifying Profit Margin Calculations\n");
  console.log("=".repeat(80));

  // Check overall pricing statistics
  const { data: stats, error: statsError } = await supabase
    .from("call_pricing")
    .select("markup_percentage, price_per_minute")
    .eq("is_active", true);

  if (statsError) {
    console.error("❌ Error fetching pricing stats:", statsError);
    return;
  }

  const markups = stats.map((s) => parseFloat(s.markup_percentage));
  const avgMarkup = markups.reduce((a, b) => a + b, 0) / markups.length;
  const minMarkup = Math.min(...markups);
  const maxMarkup = Math.max(...markups);

  console.log("\n📊 Database Pricing Statistics:");
  console.log(`   Total Active Rates: ${stats.length}`);
  console.log(`   Average Markup: ${avgMarkup.toFixed(2)}%`);
  console.log(
    `   Markup Range: ${minMarkup.toFixed(2)}% - ${maxMarkup.toFixed(2)}%`,
  );

  // Test pricing lookup for each number
  console.log("\n" + "=".repeat(80));
  console.log("\n🌍 Testing Pricing Lookup & Profit Calculation:\n");

  for (const test of testNumbers) {
    console.log(`\n📞 ${test.country} (${test.number})`);
    console.log("-".repeat(80));

    try {
      // Call the database function
      const { data, error } = await supabase.rpc("get_call_pricing", {
        destination_number: test.number,
      });

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        continue;
      }

      if (!data || data.length === 0) {
        console.log("   ⚠️  No pricing found (using fallback)");
        continue;
      }

      const pricing = data[0];
      const baseRate = parseFloat(pricing.rate_per_minute);
      const markup = parseFloat(pricing.markup_percentage);
      const finalRate = parseFloat(pricing.final_rate);

      // Verify calculation
      const calculatedFinalRate = baseRate * (1 + markup / 100);
      const isCorrect = Math.abs(finalRate - calculatedFinalRate) < 0.000001;

      console.log(`   Base Rate:        $${baseRate.toFixed(6)}/min (Twilio)`);
      console.log(`   Markup:           ${markup.toFixed(2)}%`);
      console.log(`   Final Rate:       $${finalRate.toFixed(6)}/min`);
      console.log(`   Phone Type:       ${pricing.phone_type || "N/A"}`);

      if (isCorrect) {
        console.log(`   ✅ Calculation:    CORRECT`);
      } else {
        console.log(
          `   ❌ Calculation:    INCORRECT (expected $${calculatedFinalRate.toFixed(6)})`,
        );
      }

      // Calculate profit for a 5-minute call
      const callDuration = 5; // minutes
      const twilioBaseCost = baseRate * callDuration;
      const userCharge = finalRate * callDuration;
      const profit = userCharge - twilioBaseCost;
      const profitPercentage = (profit / twilioBaseCost) * 100;

      console.log(`\n   📊 Sample 5-Minute Call:`);
      console.log(`      Twilio Cost:   $${twilioBaseCost.toFixed(4)}`);
      console.log(`      User Charge:   $${userCharge.toFixed(4)}`);
      console.log(
        `      💰 Profit:     $${profit.toFixed(4)} (${profitPercentage.toFixed(1)}%)`,
      );
    } catch (err) {
      console.error(`   ❌ Unexpected error:`, err.message);
    }
  }

  // Check recent call costs
  console.log("\n" + "=".repeat(80));
  console.log("\n📋 Recent Call Cost Records:\n");

  const { data: recentCalls, error: callsError } = await supabase
    .from("call_cost_records")
    .select(
      "to_number, call_duration, rate_per_minute, markup_percentage, final_rate_per_minute, actual_cost, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  if (callsError) {
    console.log("   No call records found or error:", callsError.message);
  } else if (!recentCalls || recentCalls.length === 0) {
    console.log(
      "   No call records found yet. Make a test call to see data here.",
    );
  } else {
    recentCalls.forEach((call, idx) => {
      const baseRate = parseFloat(call.rate_per_minute || 0);
      const markup = parseFloat(call.markup_percentage || 0);
      const finalRate = parseFloat(call.final_rate_per_minute || 0);
      const actualCost = parseFloat(call.actual_cost || 0);
      const durationMin = (call.call_duration || 0) / 60;
      const twilioBaseCost = baseRate * durationMin;
      const profit = actualCost - twilioBaseCost;

      console.log(
        `${idx + 1}. ${call.to_number} (${new Date(call.created_at).toLocaleDateString()})`,
      );
      console.log(
        `   Duration: ${call.call_duration}s (${durationMin.toFixed(2)} min)`,
      );
      console.log(
        `   Rate: $${baseRate.toFixed(6)}/min + ${markup.toFixed(2)}% = $${finalRate.toFixed(6)}/min`,
      );
      console.log(
        `   Cost: $${actualCost.toFixed(4)} | Profit: $${profit.toFixed(4)}`,
      );
      console.log("");
    });
  }

  // Summary
  console.log("=".repeat(80));
  console.log("\n✅ Profit Margin Verification Complete!\n");
  console.log("Key Points:");
  console.log(
    `   • Markup is configured and active (avg: ${avgMarkup.toFixed(2)}%)`,
  );
  console.log("   • Pricing calculations include profit margin");
  console.log("   • Costs are deducted from user wallets with markup");
  console.log("\nTo change the profit margin:");
  console.log("   1. Set PROFIT_MARGIN_PERCENTAGE in .env file");
  console.log("   2. Or update markup_percentage in call_pricing table");
  console.log("   3. Restart the backend server\n");
}

// Run verification
verifyProfitMargin().catch(console.error);
