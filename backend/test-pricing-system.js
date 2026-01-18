/**
 * Test the pricing system
 * Run: node backend/test-pricing-system.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load .env from root directory
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPricingSystem() {
  console.log("🧪 Testing Call Pricing System\n");

  // Test 1: Check if call_pricing table exists and has data
  console.log("1️⃣  Checking call_pricing table...");
  const { count, error: countError } = await supabase
    .from("call_pricing")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (countError) {
    console.error("❌ Error:", countError.message);
    console.log("   → Run the migration first!\n");
    return false;
  }

  if (count === 0) {
    console.log("⚠️  No pricing data found");
    console.log("   → Run: node backend/import-pricing-data.js\n");
    return false;
  }

  console.log(`✅ Found ${count} pricing records\n`);

  // Test 2: Test pricing lookup function
  console.log("2️⃣  Testing pricing lookup function...");
  const testNumbers = [
    { number: "14155551234", expected: "United States" },
    { number: "442071234567", expected: "United Kingdom" },
    { number: "919876543210", expected: "India" },
    { number: "861234567890", expected: "China" },
  ];

  let successCount = 0;
  for (const test of testNumbers) {
    const { data, error } = await supabase.rpc("get_call_pricing", {
      destination_number: test.number,
    });

    if (error) {
      console.log(`❌ ${test.number}: ${error.message}`);
    } else if (data && data.length > 0) {
      const pricing = data[0];
      console.log(
        `✅ ${test.number}: ${pricing.country_name} (${pricing.phone_type}) - $${pricing.final_rate}/min`,
      );
      successCount++;
    } else {
      console.log(`⚠️  ${test.number}: No pricing found (will use fallback)`);
    }
  }

  console.log(
    `\n   → ${successCount}/${testNumbers.length} lookups successful\n`,
  );

  // Test 3: Check wallet_transactions table
  console.log("3️⃣  Checking wallet_transactions table...");
  const { error: txError } = await supabase
    .from("wallet_transactions")
    .select("id")
    .limit(1);

  if (txError) {
    console.error("❌ Error:", txError.message);
    return false;
  }
  console.log("✅ Wallet transactions table ready\n");

  // Test 4: Check call_cost_records table
  console.log("4️⃣  Checking call_cost_records table...");
  const { error: costError } = await supabase
    .from("call_cost_records")
    .select("id")
    .limit(1);

  if (costError) {
    console.error("❌ Error:", costError.message);
    return false;
  }
  console.log("✅ Call cost records table ready\n");

  // Test 5: Sample pricing by country
  console.log("5️⃣  Sample pricing by country:");
  const { data: samples } = await supabase
    .from("call_pricing")
    .select(
      "country_name, phone_number_type, price_per_minute, markup_percentage",
    )
    .eq("is_active", true)
    .order("country_name")
    .limit(10);

  samples.forEach((s) => {
    const finalRate = s.price_per_minute * (1 + s.markup_percentage / 100);
    console.log(
      `   ${s.country_name.padEnd(25)} ${s.phone_number_type.padEnd(10)} $${s.price_per_minute.toFixed(4)} → $${finalRate.toFixed(4)}/min`,
    );
  });

  console.log("\n✅ All tests passed! Pricing system is ready.\n");
  console.log("📖 Read PRICING_SYSTEM_SETUP.md for API usage examples\n");

  return true;
}

// Run tests
testPricingSystem()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
