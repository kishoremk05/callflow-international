# Quick Git Setup for CallFlow International

Write-Host "Setting up Git for CallFlow International" -ForegroundColor Green
Write-Host ""

# Initialize git if needed
if (-not (Test-Path .git))
{
    Write-Host "Initializing Git..." -ForegroundColor Yellow
    git init
    Write-Host "Git initialized" -ForegroundColor Green
}
else
{
    Write-Host "Git already initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "Initial commit - CallFlow International"

Write-Host ""
Write-Host "Adding remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/kishoremk05/callflow-international.git

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Repository: https://github.com/kishoremk05/callflow-international" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy frontend to Vercel: https://vercel.com/new"
Write-Host "2. Deploy backend to Render: https://render.com/new/webservice"
Write-Host "3. See DEPLOY.md for detailed instructions"
Write-Host ""
