# Profit Margin Configuration Guide

## Overview

The system automatically adds a configurable profit margin on top of Twilio's base call rates. This ensures your business generates revenue from each call.

## Current Configuration

- **Default Profit Margin**: 15%
- **Location**: Configured in `backend/server-single.js` and stored in database
- **Environment Variable**: `PROFIT_MARGIN_PERCENTAGE` (optional)

## How It Works

### 1. Pricing Calculation

For every call, the system calculates:

```
Base Rate (Twilio)         = $0.0140/min
Markup Percentage          = 15%
Final Rate (Your Charge)   = $0.0161/min
```

**Formula**: `Final Rate = Base Rate × (1 + Markup% / 100)`

### 2. Cost Breakdown Example

For a 5-minute call to the United States:

```
Duration                   = 5 minutes
Billed Duration            = 5 minutes (rounded up from actual)
Base Rate                  = $0.0140/min (Twilio's cost)
Markup                     = 15%
Final Rate                 = $0.0161/min
─────────────────────────────────────────
Twilio Base Cost           = $0.0700 (5 min × $0.0140)
Your Profit Margin         = $0.0105 (15% markup)
Total Charged to User      = $0.0805 (5 min × $0.0161)
```

### 3. Free Call Policy

Calls under 30 seconds are **FREE**:

- Duration < 30s: $0.00 charged
- Duration ≥ 30s: Rounded up to next full minute

## Configuration Options

### Option 1: Environment Variable (Recommended)

Add to your `.env` file:

```env
# Set custom profit margin (percentage)
PROFIT_MARGIN_PERCENTAGE=20.0
```

This allows you to change the margin without modifying code.

### Option 2: Database Import

When importing pricing data, the markup is set in `backend/import-pricing-data.js`:

```javascript
markup_percentage: 15.0, // Line 108 - Change this value
```

After changing, re-import the pricing data:

```bash
cd backend
node import-pricing-data.js
```

### Option 3: Direct Database Update

Update all pricing records at once:

```sql
UPDATE call_pricing
SET markup_percentage = 20.0
WHERE is_active = true;
```

## Viewing Profit Information

### Backend Logs

After each call, the server logs detailed breakdown:

```
💰 Call Cost Breakdown:
   Duration: 300s (5 billed minutes)
   Base Rate: $0.014000/min (Twilio)
   Markup: 15.00%
   Final Rate: $0.016100/min
   Twilio Cost: $0.0700
   Profit Margin: $0.0105 (15.0%)
   💵 Total Charged: $0.0805
```

### Frontend Notification

Users see a toast notification after calls:

```
Call ended: 5 min × $0.0161/min = $0.0805 | Profit: $0.0105
```

### Console Logs

Detailed breakdown appears in browser console:

```javascript
{
  duration: "300s",
  billedMinutes: 5,
  baseRate: "$0.014000/min",
  markup: "15%",
  finalRate: "$0.016100/min",
  twilioBaseCost: "$0.0700",
  profit: "$0.0105",
  totalCharged: "$0.0805"
}
```

## Profit Margin Examples

### Different Markup Percentages

| Markup | Twilio Rate | Your Rate | Profit per Min |
| ------ | ----------- | --------- | -------------- |
| 10%    | $0.0140     | $0.0154   | $0.0014        |
| 15%    | $0.0140     | $0.0161   | $0.0021        |
| 20%    | $0.0140     | $0.0168   | $0.0028        |
| 25%    | $0.0140     | $0.0175   | $0.0035        |
| 30%    | $0.0140     | $0.0182   | $0.0042        |

### Revenue Projections

**At 15% markup:**

- 1,000 minutes/month → ~$161 revenue → ~$21 profit
- 10,000 minutes/month → ~$1,610 revenue → ~$210 profit
- 100,000 minutes/month → ~$16,100 revenue → ~$2,100 profit

## Database Schema

The pricing is stored in the `call_pricing` table:

```sql
CREATE TABLE call_pricing (
  id UUID PRIMARY KEY,
  price_per_minute DECIMAL(10, 6) NOT NULL,    -- Twilio's base rate
  markup_percentage DECIMAL(5, 2) DEFAULT 15.00, -- Your profit margin
  -- ... other fields
);
```

The `get_call_pricing()` function automatically calculates:

```sql
final_rate = price_per_minute * (1 + markup_percentage / 100)
```

## Cost Tracking

Every call creates a `call_cost_records` entry with:

- **rate_per_minute**: Twilio's base rate
- **markup_percentage**: Your markup (e.g., 15%)
- **final_rate_per_minute**: The rate charged to users
- **actual_cost**: Total amount charged
- **reserve_transaction_id**: Pre-authorization record
- **settle_transaction_id**: Final settlement record

## Testing

To verify profit margins are applied:

1. **Make a test call** to any number
2. **Check backend logs** for the cost breakdown
3. **Verify in database**:
   ```sql
   SELECT
     to_number,
     call_duration,
     rate_per_minute,
     markup_percentage,
     final_rate_per_minute,
     actual_cost
   FROM call_cost_records
   ORDER BY created_at DESC
   LIMIT 10;
   ```

## Recommendations

### Suggested Markup by Market

- **Budget Market**: 10-15% (competitive pricing)
- **Standard Market**: 15-20% (balanced)
- **Premium Market**: 20-30% (value-added services)
- **Enterprise Market**: Custom rates (volume discounts)

### Dynamic Pricing (Future Enhancement)

Consider implementing:

- **Volume discounts**: Lower markup for high-usage customers
- **Peak pricing**: Higher markup during peak hours
- **Country-specific margins**: Different markup per region
- **Customer tier pricing**: Different rates for different user types

## Troubleshooting

### Profit margin not showing?

1. Check `.env` has `PROFIT_MARGIN_PERCENTAGE` set
2. Restart backend server: `node backend/server-single.js`
3. Verify database has markup_percentage column populated
4. Check import script used correct markup value

### Wrong profit amount?

1. Verify `call_cost_records` has correct `markup_percentage`
2. Check `final_rate_per_minute` = `rate_per_minute` × (1 + markup/100)
3. Review backend logs for calculation breakdown

### Different rates for different destinations?

You can set different markup per country/prefix:

```sql
-- Higher markup for premium destinations
UPDATE call_pricing
SET markup_percentage = 25.0
WHERE country_name = 'International Premium';

-- Lower markup for common destinations
UPDATE call_pricing
SET markup_percentage = 10.0
WHERE iso_country_code IN ('US', 'CA', 'GB');
```

## Support

For issues or questions about profit margin configuration:

1. Check backend server logs for cost calculations
2. Review call_cost_records table for actual charges
3. Verify call_pricing table has markup_percentage populated
4. Ensure PROFIT_MARGIN_PERCENTAGE env var is set (if using)

---

**Last Updated**: January 18, 2026  
**Current Margin**: 15%  
**Status**: ✅ Active and calculating correctly
