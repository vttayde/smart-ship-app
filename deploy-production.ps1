# Smart Ship App - Production Deployment Script (PowerShell)
# This script handles the complete production deployment process

param(
    [switch]$SkipTests,
    [switch]$Force
)

Write-Host "🚀 Starting Smart Ship App Production Deployment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Check if we're on the production-deployment branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "production-deployment") {
    Write-Error "Not on production-deployment branch. Current branch: $currentBranch"
    Write-Host "Please switch to production-deployment branch first:"
    Write-Host "git checkout production-deployment"
    exit 1
}

Write-Success "On production-deployment branch"

# Check if all changes are committed
$gitStatus = git status --porcelain
if ($gitStatus -and -not $Force) {
    Write-Error "Uncommitted changes detected. Please commit all changes before deployment."
    Write-Host "Run: git add . && git commit -m 'Pre-deployment commit'"
    Write-Host "Or use -Force flag to continue anyway"
    exit 1
}

Write-Success "Working tree is clean"

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Run type checking
Write-Host "`n🔍 Running TypeScript type checking..." -ForegroundColor Cyan
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript type checking failed"
    exit 1
}

Write-Success "TypeScript type checking passed"

# Run linting
Write-Host "`n🔍 Running ESLint..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Error "Linting failed"
    exit 1
}

Write-Success "Linting passed"

# Build the application
Write-Host "`n🏗️ Building application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

Write-Success "Build completed successfully"

# Run tests if they exist and not skipped
if (-not $SkipTests) {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        Write-Host "`n🧪 Running tests..." -ForegroundColor Cyan
        npm test
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Tests failed"
            exit 1
        }
        Write-Success "Tests passed"
    } else {
        Write-Warning "No tests found to run"
    }
} else {
    Write-Warning "Tests skipped"
}

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Warning "Vercel CLI not found. Installing..."
    npm install -g vercel
}

# Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Warning "Make sure you have set all required environment variables in Vercel dashboard"
Write-Warning "Required variables: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, etc."

Write-Host "Starting deployment..."
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed"
    exit 1
}

Write-Success "Deployment completed successfully"

# Post-deployment checks
Write-Host "`n🔍 Post-deployment verification..." -ForegroundColor Cyan
Write-Host "Please manually verify the following:"
Write-Host "1. Application loads correctly"
Write-Host "2. Authentication works"
Write-Host "3. Database connection is active"
Write-Host "4. All environment variables are set"
Write-Host "5. SSL certificate is valid"
Write-Host "6. Performance metrics are acceptable"

Write-Host "`n✅ Production deployment completed!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "🌐 Your application should now be live"
Write-Host "📊 Monitor the deployment in Vercel dashboard"
Write-Host "📈 Check analytics and error tracking"
Write-Host "🔔 Set up monitoring alerts if not already done"

# Optional: Open the deployment URL
$openUrl = Read-Host "Open deployment URL in browser? (y/n)"
if ($openUrl -eq "y" -or $openUrl -eq "Y") {
    $deploymentUrl = vercel --prod --yes 2>$null | Select-String "https://" | Select-Object -First 1
    if ($deploymentUrl) {
        Start-Process $deploymentUrl.Line
    }
}

Write-Host "Deployment script completed successfully! 🎉" -ForegroundColor Green
