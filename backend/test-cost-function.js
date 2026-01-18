// Test the Twilio costing function directly
import { getRealCallCostFromTwilio } from "./src/utils/twilioCosting.js";

console.log("🧪 Testing Twilio Cost Fetching Function...");

// Test with a fake CallSid (should show error handling)
const testCallSid = "CA1234567890abcdef1234567890abcdef";

try {
  console.log(`Testing with fake CallSid: ${testCallSid}`);
  const result = await getRealCallCostFromTwilio(testCallSid);
  console.log("Unexpected success:", result);
} catch (error) {
  console.log("✅ Expected error for fake CallSid:", error.message);
}

console.log("\n📝 When testing with real calls:");
console.log("   1. Make a call through your app");
console.log("   2. Check backend logs for real CallSid");
console.log("   3. The system will automatically fetch real costs");
console.log("   4. Wallet will be charged exact Twilio amount");

console.log("\n🎯 Success indicators:");
console.log("   ✅ CallSid captured and stored");
console.log("   ✅ Real cost fetched from Twilio API");
console.log("   ✅ Wallet balance decreased by exact amount");
console.log("   ✅ Recent calls show real costs (not $0.00)");
