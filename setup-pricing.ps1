# Setup Pricing System
# Run this script to set up the complete pricing system

Write-Host "🚀 Setting up Call Pricing System..." -ForegroundColor Cyan
Write-Host ""

# Check if migration file exists
$migrationFile = "supabase\migrations\20260118000000_create_call_pricing_system.sql"
if (Test-Path $migrationFile) {
    Write-Host "✅ Migration file found" -ForegroundColor Green
} else {
    Write-Host "❌ Migration file not found at: $migrationFile" -ForegroundColor Red
    exit 1
}

# Check if CSV file exists
$csvFile = "public\OutboundVoicePricing.csv"
if (Test-Path $csvFile) {
    Write-Host "✅ Pricing CSV found" -ForegroundColor Green
} else {
    Write-Host "❌ Pricing CSV not found at: $csvFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Apply Database Migration:" -ForegroundColor White
Write-Host "   - Open Supabase Dashboard → SQL Editor" -ForegroundColor Gray
Write-Host "   - Copy & paste content from: $migrationFile" -ForegroundColor Gray
Write-Host "   - Run the query" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Import Pricing Data:" -ForegroundColor White
Write-Host "   Run: " -NoNewline -ForegroundColor Gray
Write-Host "node backend\import-pricing-data.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  Verify Setup:" -ForegroundColor White
Write-Host "   - Check Supabase tables: call_pricing, wallet_transactions, call_cost_records" -ForegroundColor Gray
Write-Host "   - Test pricing API: GET /api/pricing/estimate?toNumber=+14155551234" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Full documentation: PRICING_SYSTEM_SETUP.md" -ForegroundColor Cyan
Write-Host ""

# Prompt user to continue with import
$response = Read-Host "Do you want to run the pricing import now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "🔄 Running pricing import..." -ForegroundColor Cyan
    Write-Host ""
    
    Set-Location backend
    node import-pricing-data.js
    Set-Location ..
    
    Write-Host ""
    Write-Host "✅ Setup complete! Read PRICING_SYSTEM_SETUP.md for usage details." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⏸️  Import skipped. Run manually when ready:" -ForegroundColor Yellow
    Write-Host "   node backend\import-pricing-data.js" -ForegroundColor Cyan
}
