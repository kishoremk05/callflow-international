import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory (one level up from backend)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase credentials");
  console.error("Please set the following environment variables:");
  console.error("  VITE_SUPABASE_URL");
  console.error(
    "  SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY)",
  );
  console.error("\nFound in .env:");
  console.error("  VITE_SUPABASE_URL:", supabaseUrl || "❌ Not set");
  console.error(
    "  Keys available:",
    process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "SERVICE_ROLE_KEY"
      : process.env.VITE_SUPABASE_ANON_KEY
        ? "ANON_KEY"
        : process.env.VITE_SUPABASE_PUBLISHABLE_KEY
          ? "PUBLISHABLE_KEY"
          : "❌ None",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse CSV file
function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Handle complex CSV parsing (with quoted fields)
    const values = parseCSVLine(lines[i]);

    if (values.length >= 4) {
      const iso = values[0]?.trim();
      const country = values[1]?.trim();
      const description = values[2]?.trim();
      const priceStr = values[3]?.trim();
      const destinationPrefixes = values[5]?.trim();

      // Parse price
      const price = parseFloat(priceStr);
      if (isNaN(price)) continue;

      // Determine phone number type
      let phoneType = "landline";
      const descLower = description.toLowerCase();
      if (descLower.includes("mobile")) {
        phoneType = "mobile";
      } else if (descLower.includes("fixed")) {
        phoneType = "landline";
      } else if (descLower.includes("premium")) {
        phoneType = "premium";
      } else if (descLower.includes("voip")) {
        phoneType = "voip";
      }

      // Parse destination prefixes
      let prefixes = null;
      if (destinationPrefixes) {
        prefixes = destinationPrefixes
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);
      }

      data.push({
        iso_country_code: iso,
        country_name: country,
        description: description,
        price_per_minute: price,
        destination_prefixes: prefixes,
        phone_number_type: phoneType,
        currency: "USD",
        markup_percentage: 15.0, // 15% markup
        is_active: true,
      });
    }
  }

  return data;
}

// Parse a single CSV line (handles quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Import data in batches
async function importPricingData(data) {
  const batchSize = 500;
  let imported = 0;
  let failed = 0;

  console.log(`Starting import of ${data.length} pricing records...`);

  // First, deactivate all existing pricing
  console.log("Deactivating existing pricing data...");
  const { error: deactivateError } = await supabase
    .from("call_pricing")
    .update({ is_active: false })
    .eq("is_active", true);

  if (deactivateError) {
    console.warn("Warning deactivating old data:", deactivateError.message);
  }

  // Import in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const { data: inserted, error } = await supabase
      .from("call_pricing")
      .insert(batch)
      .select("id");

    if (error) {
      console.error(
        `Error importing batch ${i / batchSize + 1}:`,
        error.message,
      );
      failed += batch.length;
    } else {
      imported += inserted?.length || batch.length;
      console.log(
        `Imported batch ${i / batchSize + 1}: ${inserted?.length || batch.length} records`,
      );
    }
  }

  console.log("\n=== Import Summary ===");
  console.log(`Total records: ${data.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((imported / data.length) * 100).toFixed(2)}%`);
}

// Verify import
async function verifyImport() {
  console.log("\n=== Verification ===");

  // Count total records
  const { count: totalCount, error: countError } = await supabase
    .from("call_pricing")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (countError) {
    console.error("Error counting records:", countError.message);
  } else {
    console.log(`Total active pricing records: ${totalCount}`);
  }

  // Sample some records
  const { data: samples, error: sampleError } = await supabase
    .from("call_pricing")
    .select("country_name, phone_number_type, price_per_minute")
    .eq("is_active", true)
    .limit(5);

  if (sampleError) {
    console.error("Error fetching samples:", sampleError.message);
  } else {
    console.log("\nSample records:");
    samples.forEach((record, idx) => {
      console.log(
        `${idx + 1}. ${record.country_name} (${record.phone_number_type}): $${record.price_per_minute}/min`,
      );
    });
  }

  // Test pricing lookup function
  console.log("\n=== Testing Pricing Lookup Function ===");
  const testNumbers = [
    "+14155551234", // US
    "+442071234567", // UK
    "+919876543210", // India Mobile
    "+6598765432", // Singapore
  ];

  for (const number of testNumbers) {
    const { data, error } = await supabase.rpc("get_call_pricing", {
      destination_number: number.replace("+", ""),
    });

    if (error) {
      console.error(`Error looking up ${number}:`, error.message);
    } else if (data && data.length > 0) {
      const pricing = data[0];
      console.log(
        `${number}: ${pricing.country_name} (${pricing.phone_type}) - $${pricing.final_rate}/min (base: $${pricing.rate_per_minute} + ${pricing.markup_percentage}% markup)`,
      );
    } else {
      console.log(`${number}: No pricing found (will use fallback rate)`);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log("=== Twilio Pricing Data Import ===\n");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase Key:", supabaseKey ? "✓ Present" : "✗ Missing");
    console.log("");

    // Read and parse CSV
    const csvPath = path.join(
      __dirname,
      "..",
      "public",
      "OutboundVoicePricing.csv",
    );

    if (!fs.existsSync(csvPath)) {
      console.error(`Error: CSV file not found at ${csvPath}`);
      process.exit(1);
    }

    console.log(`Reading CSV from: ${csvPath}`);
    const pricingData = parseCSV(csvPath);

    console.log(`Parsed ${pricingData.length} pricing records\n`);

    // Import data
    await importPricingData(pricingData);

    // Verify import
    await verifyImport();

    console.log("\n✅ Import completed successfully!");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url.startsWith("file:")) {
  const modulePath = fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    main();
  }
}

export { parseCSV, importPricingData };
