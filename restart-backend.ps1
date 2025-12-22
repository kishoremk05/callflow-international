Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           Backend Server Auto-Restart Script              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Kill existing Node processes
Write-Host "🔴 Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process node -ErrorAction Stop | Stop-Process -Force
    Write-Host "✅ All Node processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No running Node processes found" -ForegroundColor Gray
}

Write-Host ""
Start-Sleep -Seconds 1

# Navigate to backend directory
Write-Host "📁 Navigating to backend directory..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend folder not found!" -ForegroundColor Red
    Write-Host "   Current location: $PSScriptRoot" -ForegroundColor Red
    Write-Host "   Expected: $backendPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    pause
    exit 1
}

Set-Location $backendPath
Write-Host "✅ In backend folder: $backendPath" -ForegroundColor Green
Write-Host ""

# Check if server-single.js exists
if (-not (Test-Path "server-single.js")) {
    Write-Host "❌ server-single.js not found in backend folder!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                 🚀 STARTING BACKEND SERVER 🚀                 ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Server will start on: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  KEEP THIS WINDOW OPEN!" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Start the server
node server-single.js

# If server exits, pause
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "Server stopped." -ForegroundColor Red
pause
