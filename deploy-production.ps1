# Smart Ship App - Simple Production Deployment
# Run: .\deploy-production.ps1

Write-Host "🚀 Deploying Smart Ship App to Production" -ForegroundColor Green

# Quick checks
Write-Host "Checking build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful" -ForegroundColor Green

# Deploy
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
npx vercel --prod

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Check your Vercel dashboard for the live URL" -ForegroundColor Cyan
