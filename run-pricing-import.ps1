# Import Pricing Data - PowerShell Wrapper
# This script sets environment variables and runs the import

Write-Host "🚀 Starting Pricing Data Import..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location $PSScriptRoot\backend

# Check if .env exists in root
if (Test-Path "$PSScriptRoot\.env") {
    Write-Host "✅ Found .env file" -ForegroundColor Green
    
    # Parse .env file and set environment variables
    Get-Content "$PSScriptRoot\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim() -replace '^"','' -replace '"$',''
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
            Write-Host "  Set $key" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "📦 Running import script..." -ForegroundColor Cyan
    Write-Host ""
    
    # Run the import
    node import-pricing-data.js
    
} else {
    Write-Host "❌ .env file not found in root directory" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
