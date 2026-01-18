# Pricing System Setup Guide

## 🎯 Overview

This pricing system uses actual Twilio pricing data from `OutboundVoicePricing.csv` to:

1. **Reserve** funds before calls (prevents insufficient balance during calls)
2. **Settle** actual costs after calls (refund difference or charge extra)
3. **Track** all transactions with full audit trail

## 📋 Setup Steps

### 1. Apply Database Migration

Run the migration in Supabase SQL Editor:

```bash
# Copy the content of this file to Supabase SQL Editor:
supabase/migrations/20260118000000_create_call_pricing_system.sql
```

Or if using Supabase CLI:

```bash
supabase db push
```

### 2. Import Pricing Data

```bash
cd backend
node import-pricing-data.js
```

This will:

- Parse the CSV file (612 pricing records)
- Import all pricing to `call_pricing` table
- Add 15% markup automatically
- Verify the import

## 🔄 How It Works

### When a Call Starts:

```
1. User initiates call to +14155551234
2. System looks up pricing → $0.0125/min (US Mobile)
3. Estimates cost: 5 min × $0.0144/min = $0.072 (with 15% markup)
4. Checks wallet balance → $10.00 available ✅
5. RESERVES $0.072 from wallet → New balance: $9.93
6. Call proceeds
```

### When Call Ends:

```
1. Call duration: 3 minutes 45 seconds = 4 billed minutes
2. Actual cost: 4 × $0.0144 = $0.0576
3. SETTLES: Reserved $0.072, Actual $0.0576
4. REFUNDS difference: $0.0144 back to wallet
5. Final balance: $9.93 + $0.0144 = $9.97
```

## 🛠️ API Endpoints

### Get Price Estimate

```http
GET /api/pricing/estimate?toNumber=+14155551234&estimatedMinutes=5
Authorization: Bearer <token>

Response:
{
  "success": true,
  "estimation": {
    "destinationNumber": "+14155551234",
    "countryName": "United States",
    "phoneType": "mobile",
    "ratePerMinute": 0.0144,
    "estimatedDurationMinutes": 5,
    "estimatedCost": 0.072,
    "pricingId": "uuid",
    "isFallback": false
  }
}
```

### Check Balance Before Call

```http
POST /api/pricing/check-balance
Authorization: Bearer <token>
Content-Type: application/json

{
  "toNumber": "+14155551234",
  "estimatedMinutes": 5
}

Response:
{
  "success": true,
  "hasSufficientFunds": true,
  "currentBalance": 10.00,
  "requiredAmount": 0.072,
  "shortfall": 0,
  "costEstimate": { ... }
}
```

### Look Up Pricing

```http
POST /api/pricing/lookup
Authorization: Bearer <token>
Content-Type: application/json

{
  "destinationNumber": "+442071234567"
}

Response:
{
  "success": true,
  "pricing": {
    "ratePerMinute": 0.0235,
    "finalRate": 0.027,
    "countryName": "United Kingdom",
    "phoneType": "landline",
    "markupPercentage": 15.00
  }
}
```

## 📊 Database Tables

### `call_pricing`

- Stores all Twilio pricing data
- Includes markup percentage (default 15%)
- Searchable by phone number prefixes

### `wallet_transactions`

- Records all wallet activity
- Types: 'reserve', 'settle', 'refund', 'purchase'
- Links to call_sid for traceability

### `call_cost_records`

- Tracks each call's cost calculation
- Links to pricing and transactions
- Stores estimated vs actual costs

## 🔧 Configuration

### Change Markup Percentage

Update in migration file or after import:

```sql
UPDATE call_pricing
SET markup_percentage = 20.00
WHERE is_active = true;
```

### Add Custom Pricing

```sql
INSERT INTO call_pricing (
  iso_country_code,
  country_name,
  description,
  price_per_minute,
  markup_percentage,
  phone_number_type
) VALUES (
  'US',
  'United States',
  'Premium Rate',
  0.50,
  25.00,
  'premium'
);
```

## 🧪 Testing

### Test the pricing lookup:

```bash
cd backend
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.rpc('get_call_pricing', { destination_number: '14155551234' }).then(r => console.log(r.data));
"
```

## 📈 Benefits

✅ **Accurate billing** - Real Twilio prices ensure profitability
✅ **No surprises** - Funds reserved before call starts
✅ **Fair refunds** - Unused credits returned automatically
✅ **Audit trail** - Every transaction tracked
✅ **Easy updates** - Re-import CSV to update prices
✅ **Fallback pricing** - Unknown destinations use default rate
✅ **Country detection** - Automatic based on phone prefix

## 🚨 Important Notes

1. **wallet_balance column**: Make sure wallets table uses `wallet_balance` (not `balance`)
2. **First import**: Takes ~30 seconds for 612 records
3. **Re-import**: Old pricing auto-deactivated, new pricing added
4. **Test mode**: System works even without Twilio configured

## 🔄 Updating Prices

When Twilio updates pricing:

1. Download new OutboundVoicePricing.csv
2. Replace file in `public/`
3. Run `node backend/import-pricing-data.js`
4. Old prices deactivated, new prices active

## 📞 Support

If you encounter issues:

- Check Supabase logs for database errors
- Verify migration was applied successfully
- Ensure CSV file exists in `public/OutboundVoicePricing.csv`
- Check that wallet_balance column exists in wallets table
