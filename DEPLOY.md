# 🚀 Production Deployment

## Prerequisites

### 1. Database Setup

For production, you'll need a PostgreSQL database. Recommended options:

- **Vercel Postgres** (easiest)
- **Supabase** (free tier available)
- **Railway** (simple setup)
- **Neon** (serverless PostgreSQL)

### 2. Get Database URL

```bash
# Example formats:
# Vercel Postgres: postgresql://user:password@host:5432/vercel_db
# Supabase: postgresql://postgres:password@host:5432/postgres
```

## Quick Deploy to Vercel

1. **Login to Vercel**

   ```bash
   npx vercel login
   ```

2. **Create Vercel Postgres Database** (Optional - easiest option)
   - Go to Vercel Dashboard > Storage > Create Database
   - Choose PostgreSQL
   - Copy the connection string

3. **Set Environment Variables** in Vercel Dashboard:

   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/database"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="your-random-32-char-secret"
   RAZORPAY_KEY_ID="your-razorpay-key"
   RAZORPAY_KEY_SECRET="your-razorpay-secret"
   RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"
   ```

4. **Deploy**

   ```bash
   # Option 1: Use script
   .\deploy-production.ps1

   # Option 2: Direct deploy
   npx vercel --prod
   ```

5. **Initialize Database** (After first deployment)

   ```bash
   # Initialize demo users
   curl -X POST https://your-app.vercel.app/api/init-db
   ```

6. **Test Health Check**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

## Required Environment Variables

- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Random 32+ character string

Generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

That's it! 🎉
