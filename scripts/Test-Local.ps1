# 🧪 Smart Ship Local Testing Script (PowerShell)
# Usage: .\scripts\Test-Local.ps1 -Mode local|staging|restore

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "staging", "restore")]
    [string]$Mode
)

Write-Host "🚀 Smart Ship Local Testing Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Function to start local development
function Start-LocalDev {
    Write-Host "🟢 Starting local development server..." -ForegroundColor Green
    Write-Host "📍 Environment: Local Development" -ForegroundColor Yellow
    Write-Host "🌐 URL: http://localhost:3003" -ForegroundColor Blue
    Write-Host ""
    
    # Check if dependencies are installed
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Generate Prisma client
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    # Start development server
    Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Green
    npm run dev
}

# Function to test with staging database
function Test-WithStaging {
    Write-Host "🟡 Setting up local testing with staging database..." -ForegroundColor Yellow
    Write-Host "📍 Environment: Local + Staging DB" -ForegroundColor Yellow
    Write-Host "🌐 URL: http://localhost:3003" -ForegroundColor Blue
    Write-Host ""
    
    # Backup current .env.local
    if (Test-Path ".env.local") {
        Copy-Item ".env.local" ".env.local.backup"
        Write-Host "💾 Backed up current .env.local" -ForegroundColor Green
    }
    
    # Copy staging environment
    if (Test-Path ".env.staging-local") {
        Copy-Item ".env.staging-local" ".env.local"
        Write-Host "🔄 Switched to staging database configuration" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.staging-local not found!" -ForegroundColor Red
        Write-Host "📋 Please configure staging database URL first" -ForegroundColor Yellow
        exit 1
    }
    
    # Generate Prisma client with staging schema
    Write-Host "🔧 Generating Prisma client for staging..." -ForegroundColor Yellow
    npx prisma generate
    
    Write-Host "✅ Ready to test with staging data!" -ForegroundColor Green
    Write-Host ""
    Start-LocalDev
}

# Function to restore original environment
function Restore-Environment {
    if (Test-Path ".env.local.backup") {
        Copy-Item ".env.local.backup" ".env.local"
        Remove-Item ".env.local.backup"
        Write-Host "✅ Restored original .env.local" -ForegroundColor Green
    } else {
        Write-Host "❌ No backup found" -ForegroundColor Red
    }
}

# Main script logic
switch ($Mode) {
    "local" {
        Start-LocalDev
    }
    "staging" {
        Test-WithStaging
    }
    "restore" {
        Restore-Environment
    }
}
