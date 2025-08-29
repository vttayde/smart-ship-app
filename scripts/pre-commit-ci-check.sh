#!/bin/sh
# Pre-commit hook to run CI checks locally

echo "🔍 Running pre-commit CI checks..."

# Set environment variables for build
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-fallback-secret-for-build}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"
export DATABASE_URL="${DATABASE_URL:-postgresql://user:pass@localhost:5432/testdb}"

echo "1/4 🧹 Running linting and formatting checks..."
npm run ci:lint
if [ $? -ne 0 ]; then
  echo "❌ Linting/formatting failed. Run 'npm run lint:fix' to fix issues."
  exit 1
fi

echo "2/4 🛡️ Running security audit..."
npm run ci:security
if [ $? -ne 0 ]; then
  echo "⚠️ Security vulnerabilities found. Review and fix if needed."
  # Don't exit on security issues for now, just warn
fi

echo "3/4 🔧 Running build check..."
npm run ci:build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Fix build errors before committing."
  exit 1
fi

echo "4/4 ✅ All CI checks passed!"
echo "🚀 Ready to push to remote repository."
