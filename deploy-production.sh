#!/bin/bash

# Smart Ship App - Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting Smart Ship App Production Deployment"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're on the production-deployment branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "production-deployment" ]; then
    print_error "Not on production-deployment branch. Current branch: $CURRENT_BRANCH"
    echo "Please switch to production-deployment branch first:"
    echo "git checkout production-deployment"
    exit 1
fi

print_status "On production-deployment branch"

# Check if all changes are committed
if ! git diff-index --quiet HEAD --; then
    print_error "Uncommitted changes detected. Please commit all changes before deployment."
    echo "Run: git add . && git commit -m 'Pre-deployment commit'"
    exit 1
fi

print_status "Working tree is clean"

# Install dependencies
echo -e "\n📦 Installing dependencies..."
npm ci --production=false

# Run type checking
echo -e "\n🔍 Running TypeScript type checking..."
npm run type-check || {
    print_error "TypeScript type checking failed"
    exit 1
}

print_status "TypeScript type checking passed"

# Run linting
echo -e "\n🔍 Running ESLint..."
npm run lint || {
    print_error "Linting failed"
    exit 1
}

print_status "Linting passed"

# Build the application
echo -e "\n🏗️ Building application..."
npm run build || {
    print_error "Build failed"
    exit 1
}

print_status "Build completed successfully"

# Run tests if they exist
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo -e "\n🧪 Running tests..."
    npm test || {
        print_error "Tests failed"
        exit 1
    }
    print_status "Tests passed"
else
    print_warning "No tests found to run"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo -e "\n🚀 Deploying to Vercel..."
print_warning "Make sure you have set all required environment variables in Vercel dashboard"
print_warning "Required variables: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, etc."

echo "Starting deployment..."
vercel --prod || {
    print_error "Deployment failed"
    exit 1
}

print_status "Deployment completed successfully"

# Post-deployment checks
echo -e "\n🔍 Post-deployment verification..."
echo "Please manually verify the following:"
echo "1. Application loads correctly"
echo "2. Authentication works"
echo "3. Database connection is active"
echo "4. All environment variables are set"
echo "5. SSL certificate is valid"
echo "6. Performance metrics are acceptable"

echo -e "\n✅ Production deployment completed!"
echo "=================================================="
echo "🌐 Your application should now be live"
echo "📊 Monitor the deployment in Vercel dashboard"
echo "📈 Check analytics and error tracking"
echo "🔔 Set up monitoring alerts if not already done"

# Optional: Open the deployment URL
read -p "Open deployment URL in browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod --yes 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1 | xargs open
fi

echo "Deployment script completed successfully! 🎉"
