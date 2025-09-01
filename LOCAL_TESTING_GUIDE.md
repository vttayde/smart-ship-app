# 🧪 Local Testing Guide with Staging Database

## 📋 Overview

This guide helps you test all recent changes locally using the staging database, so you can see real data and test functionality before deploying to production.

## 🔍 Recent Changes Summary

### ✅ **Deployment Optimizations**
- **Path-based deployment skipping** for `.md` files and documentation
- **Commit message deployment control** with `[skip-deploy]` keyword
- **Reduced deployment frequency** by 70-80%
- **Intelligent CI/CD triggers** to stay within Vercel free tier limits

### ✅ **New Documentation**
- `DEPLOYMENT_OPTIMIZATION.md` - Strategy guide for efficient deployments
- `DEVELOPMENT_WORKFLOW.md` - Best practices for daily development
- `ENVIRONMENTS.md` - Environment access and management
- `GITHUB_ABOUT_UPDATE.md` - Repository presentation guide

### ✅ **Environment Enhancements**
- **Multi-environment visibility** in README and documentation
- **Environment selector page** at `/` route
- **Professional repository presentation**

## 🚀 Quick Start Testing

### **Method 1: Using NPM Scripts (Recommended)**

```bash
# 1. Test with local database (normal development)
npm run test:local

# 2. Test with staging database (real data testing)
npm run test:staging

# 3. Restore original environment
npm run test:restore
```

### **Method 2: Manual Setup**

```bash
# 1. Backup your current environment
cp .env.local .env.local.backup

# 2. Copy staging configuration
cp .env.staging-local .env.local

# 3. Start development
npm run dev

# 4. Restore when done
cp .env.local.backup .env.local
```

## 🛠️ **Step-by-Step Testing Process**

### **Step 1: Prepare Staging Database URL**

1. **Get your staging database URL** from Vercel dashboard or Neon console
2. **Update `.env.staging-local`** with the correct staging database URL:

```bash
# Replace with your actual staging database URL
DATABASE_URL="postgresql://username:password@ep-staging-host.aws.neon.tech/smart_ship_staging"
```

### **Step 2: Install Dependencies & Generate Prisma**

```bash
# Ensure dependencies are installed
npm install

# Generate Prisma client
npx prisma generate
```

### **Step 3: Start Local Testing with Staging Data**

```bash
# Start testing with staging database
npm run test:staging
```

This will:
- ✅ Backup your current `.env.local`
- ✅ Switch to staging database configuration
- ✅ Generate Prisma client for staging schema
- ✅ Start development server at `http://localhost:3003`

### **Step 4: Test Key Features**

#### **🔐 Authentication Testing**
```bash
# Visit: http://localhost:3003/auth/login
# Test: Login with staging database credentials
# Verify: User sessions work correctly
```

#### **📊 Dashboard Testing**
```bash
# Visit: http://localhost:3003/dashboard
# Test: Orders API with real staging data
# Verify: No 500 errors, data loads correctly
```

#### **🚀 PWA Testing**
```bash
# Test: Service worker functionality
# Test: Manifest.json accessibility
# Verify: No 404 errors for icons or resources
```

#### **📱 Responsive Testing**
```bash
# Test: Mobile layout and navigation
# Test: All interactive components
# Verify: Proper responsive behavior
```

### **Step 5: Test Deployment Optimizations**

#### **Test Documentation Updates (Should Skip Deployment)**
```bash
# Make a documentation change
echo "# Test update" >> TEST_DOC.md

# Commit with skip-deploy
git add TEST_DOC.md
git commit -m "Test documentation update [skip-deploy]"

# Push (should NOT trigger deployment)
git push origin main

# Clean up
git reset HEAD~1
rm TEST_DOC.md
```

#### **Test Code Changes (Should Deploy)**
```bash
# Make a code change
# Commit without [skip-deploy]
git commit -m "Test code change"

# Push (SHOULD trigger deployment)
git push origin main
```

## 🔧 **Environment Configuration**

### **Local Development (.env.local)**
```bash
DATABASE_URL="postgresql://local-db-url"
NEXTAUTH_URL="http://localhost:3003"
NODE_ENV="development"
```

### **Local + Staging DB (.env.staging-local)**
```bash
DATABASE_URL="postgresql://staging-db-url"
NEXTAUTH_URL="http://localhost:3003"
NODE_ENV="development"
ENV_NAME="local-with-staging-db"
DEBUG_MODE="true"
```

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **Issue: Database Connection Error**
```bash
# Solution: Check staging database URL
npx prisma db pull  # Test connection
npx prisma generate # Regenerate client
```

#### **Issue: Authentication Not Working**
```bash
# Solution: Verify NEXTAUTH_SECRET and URL
# Check .env.local configuration
```

#### **Issue: Build Errors**
```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run dev
```

#### **Issue: Prisma Schema Mismatch**
```bash
# Solution: Sync with staging database
npx prisma db pull
npx prisma generate
```

## 📊 **Testing Checklist**

### **✅ Functional Testing**
- [ ] User authentication works
- [ ] Dashboard loads without errors
- [ ] Orders API returns data
- [ ] PWA resources load correctly
- [ ] Navigation works properly
- [ ] Responsive design functions

### **✅ Performance Testing**
- [ ] Page load times acceptable
- [ ] Database queries efficient
- [ ] No memory leaks
- [ ] Service worker caching works

### **✅ Deployment Testing**
- [ ] Documentation changes skip deployment
- [ ] Code changes trigger deployment
- [ ] Workflow optimizations work
- [ ] Build process completes successfully

## 🎯 **Next Steps After Testing**

1. **✅ Verify all functionality works** with staging data
2. **✅ Test deployment optimizations** are effective
3. **✅ Confirm no regressions** in existing features
4. **✅ Document any issues** found during testing
5. **✅ Restore original environment** when done

```bash
# When testing is complete
npm run test:restore
```

## 🚀 **Ready to Deploy**

Once local testing with staging data is successful:

1. **Commit any final changes**
2. **Push to staging branch** for final staging verification
3. **Create PR to main** for production deployment
4. **Monitor deployment** using optimized workflow

Your application is now optimized for efficient development and deployment! 🎉
