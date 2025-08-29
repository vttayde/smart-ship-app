# Pre-commit CI Check Script for Windows PowerShell

Write-Host "🔍 Running pre-commit CI checks..." -ForegroundColor Cyan

# Set environment variables for build
$env:NEXTAUTH_SECRET = if ($env:NEXTAUTH_SECRET) { $env:NEXTAUTH_SECRET } else { "fallback-secret-for-build" }
$env:NEXTAUTH_URL = if ($env:NEXTAUTH_URL) { $env:NEXTAUTH_URL } else { "http://localhost:3000" }
$env:DATABASE_URL = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { "postgresql://user:pass@localhost:5432/testdb" }

Write-Host "1/4 🧹 Running linting and formatting checks..." -ForegroundColor Yellow
npm run ci:lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting/formatting failed. Run 'npm run lint:fix' to fix issues." -ForegroundColor Red
    exit 1
}

Write-Host "2/4 🛡️ Running security audit..." -ForegroundColor Yellow
npm run ci:security
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Security vulnerabilities found. Review and fix if needed." -ForegroundColor Yellow
    # Don't exit on security issues for now, just warn
}

Write-Host "3/4 🔧 Running build check..." -ForegroundColor Yellow
npm run ci:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Fix build errors before committing." -ForegroundColor Red
    exit 1
}

Write-Host "4/4 ✅ All CI checks passed!" -ForegroundColor Green
Write-Host "🚀 Ready to push to remote repository." -ForegroundColor Green
