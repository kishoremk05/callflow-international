# Quick Deploy Script

Write-Host "🚀 CallFlow International - Deployment Helper" -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for deployment"
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Your GitHub Repository:" -ForegroundColor White
Write-Host "   https://github.com/kishoremk05/callflow-international"
Write-Host ""
Write-Host "2. Push to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/kishoremk05/callflow-international.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. Deploy Frontend (Vercel):" -ForegroundColor White
Write-Host "   - Go to https://vercel.com/new"
Write-Host "   - Import your GitHub repository"
Write-Host "   - Framework: Vite"
Write-Host "   - Build: npm run build"
Write-Host "   - Output: dist"
Write-Host ""
Write-Host "4. Deploy Backend (Render):" -ForegroundColor White
Write-Host "   - Go to https://render.com/new/webservice"
Write-Host "   - Connect GitHub repository"
Write-Host "   - Root Directory: backend"
Write-Host "   - Build: npm install"
Write-Host "   - Start: node server-single.js"
Write-Host ""
Write-Host "5. Add Environment Variables:" -ForegroundColor White
Write-Host "   - See DEPLOY.md for complete list"
Write-Host ""
Write-Host "📖 Full guide: See DEPLOY.md" -ForegroundColor Green
