# Vercel Deployment Guide

This guide will help you deploy the Smart Ship application to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier available)
- GitHub repository connected to Vercel
- Environment variables configured

## Step 1: Local Setup

### Install Vercel CLI
```bash
npm install -g vercel
# or use npx for one-time usage
npx vercel --version
```

### Login to Vercel
```bash
npx vercel login
```
Choose your preferred login method (GitHub recommended).

## Step 2: Project Setup

### Link Project to Vercel
```bash
npx vercel
```
This will:
1. Ask you to link to an existing project or create a new one
2. Set up the project configuration
3. Deploy your application

### Alternative: Manual Setup
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings (Vercel will auto-detect Next.js)

## Step 3: Environment Variables

### Required Environment Variables
Add these in Vercel Dashboard > Project > Settings > Environment Variables:

```bash
# NextAuth.js (Required)
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-app-name.vercel.app

# Database (if using external DB)
DATABASE_URL=your-production-database-url

# Application
NODE_ENV=production
APP_URL=https://your-app-name.vercel.app
```

### Generating NEXTAUTH_SECRET
```bash
# Generate a secure secret
openssl rand -base64 32
# or online: https://generate-secret.vercel.app/32
```

## Step 4: Deployment

### Automatic Deployment
- **Production**: Push to `main` branch → automatic deployment
- **Preview**: Create PR or push to other branches → preview deployment

### Manual Deployment
```bash
# Deploy to production
npx vercel --prod

# Deploy preview
npx vercel
```

## Step 5: Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update NEXTAUTH_URL and APP_URL to use custom domain

## Deployment Configuration

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs"
}
```

### Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## CI/CD Integration

### GitHub Actions (Already Configured)
The project includes GitHub Actions workflows for:
- Automatic deployment on push to main
- Preview deployments for PRs
- Quality checks before deployment

### Vercel Integration
- Auto-deploys from GitHub
- Preview deployments for PRs
- Build logs and analytics
- Performance monitoring

## Environment-Specific Configuration

### Production Environment
```bash
NEXTAUTH_SECRET=production-secret
NEXTAUTH_URL=https://smart-ship.vercel.app
DATABASE_URL=postgresql://prod-db-url
NODE_ENV=production
```

### Staging Environment
```bash
NEXTAUTH_SECRET=staging-secret
NEXTAUTH_URL=https://smart-ship-staging.vercel.app
DATABASE_URL=postgresql://staging-db-url
NODE_ENV=staging
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in package.json
   - Ensure environment variables are set

2. **Environment Variable Issues**
   - Variables must be set in Vercel dashboard
   - Restart deployment after adding variables
   - Check variable names match exactly

3. **Authentication Issues**
   - Verify NEXTAUTH_URL matches deployed URL
   - Ensure NEXTAUTH_SECRET is set
   - Check OAuth provider settings (if using)

4. **Database Connection**
   - Verify DATABASE_URL is correct
   - Ensure database accepts connections from Vercel IPs
   - Check database is accessible from external networks

### Debug Commands
```bash
# Check deployment status
npx vercel ls

# View deployment logs
npx vercel logs [deployment-url]

# Check project info
npx vercel project ls
```

## Performance Optimization

### Automatic Optimizations
Vercel automatically provides:
- Global CDN
- Image optimization
- Static file compression
- Edge functions
- Analytics

### Manual Optimizations
- Use Next.js Image component
- Implement proper caching headers
- Optimize bundle size
- Use ISR for static content

## Monitoring

### Vercel Analytics
- Real User Metrics (RUM)
- Core Web Vitals
- Performance insights
- Error tracking

### Custom Monitoring
- Add analytics providers
- Implement error boundaries
- Set up health checks
- Monitor API endpoints

## Security

### Best Practices
- Use environment variables for secrets
- Enable Vercel's security headers
- Implement proper authentication
- Regular security updates

### Security Headers
Vercel automatically adds:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy (configurable)

## Cost Management

### Free Tier Limits
- 100GB bandwidth/month
- 100 deployments/day
- 10,000 function invocations/month
- 100 hours build time/month

### Optimization Tips
- Optimize bundle size
- Use ISR for static content
- Implement proper caching
- Monitor usage in dashboard

## Next Steps

1. **Deploy the application**
2. **Set up custom domain** (optional)
3. **Configure monitoring**
4. **Set up database** (if not using local)
5. **Configure OAuth providers** (if needed)
6. **Test authentication flow**
7. **Monitor performance**

## Quick Deployment Commands

```bash
# First time setup
npx vercel login
npx vercel

# Subsequent deployments
git push origin main  # Automatic via GitHub Actions

# Manual deployment
npx vercel --prod

# Preview deployment
npx vercel

# Check status
npx vercel ls
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
- [Community Discord](https://discord.gg/vercel)
