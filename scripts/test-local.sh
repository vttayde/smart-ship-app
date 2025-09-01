#!/bin/bash

# 🧪 Local Testing Script for Smart Ship App
# Usage: npm run test:local or npm run test:staging

echo "🚀 Smart Ship Local Testing Setup"
echo "================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    echo "📋 Please create .env.local file first"
    exit 1
fi

# Function to start local development
start_local() {
    echo "🟢 Starting local development server..."
    echo "📍 Environment: Local Development"
    echo "🌐 URL: http://localhost:3003"
    echo ""
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Start development server
    echo "🚀 Starting Next.js development server..."
    npm run dev
}

# Function to test with staging database
test_staging() {
    echo "🟡 Setting up local testing with staging database..."
    echo "📍 Environment: Local + Staging DB"
    echo "🌐 URL: http://localhost:3003"
    echo ""
    
    # Backup current .env.local
    if [ -f ".env.local" ]; then
        cp .env.local .env.local.backup
        echo "💾 Backed up current .env.local"
    fi
    
    # Copy staging environment
    if [ -f ".env.staging-local" ]; then
        cp .env.staging-local .env.local
        echo "🔄 Switched to staging database configuration"
    else
        echo "❌ .env.staging-local not found!"
        echo "📋 Please configure staging database URL first"
        exit 1
    fi
    
    # Generate Prisma client with staging schema
    echo "🔧 Generating Prisma client for staging..."
    npx prisma generate
    
    # Optional: Reset database schema (uncomment if needed)
    # echo "🗄️ Pushing schema to staging database..."
    # npx prisma db push
    
    echo "✅ Ready to test with staging data!"
    echo ""
    start_local
}

# Function to restore original environment
restore_env() {
    if [ -f ".env.local.backup" ]; then
        cp .env.local.backup .env.local
        rm .env.local.backup
        echo "✅ Restored original .env.local"
    else
        echo "❌ No backup found"
    fi
}

# Main script logic
case "$1" in
    "local")
        start_local
        ;;
    "staging")
        test_staging
        ;;
    "restore")
        restore_env
        ;;
    *)
        echo "Usage: $0 {local|staging|restore}"
        echo ""
        echo "Commands:"
        echo "  local   - Start with local database"
        echo "  staging - Start with staging database"
        echo "  restore - Restore original environment"
        exit 1
        ;;
esac
