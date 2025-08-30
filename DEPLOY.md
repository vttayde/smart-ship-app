# 🚀 Production Deployment

## Quick Deploy

1. **Login to Vercel**
   ```bash
   npx vercel login
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `NEXTAUTH_URL=https://your-app.vercel.app`
   - `NEXTAUTH_SECRET=your-secret-here`

3. **Deploy**
   ```bash
   # Option 1: Use script
   .\deploy-production.ps1
   
   # Option 2: Direct deploy
   npx vercel --prod
   ```

## Required Environment Variables

- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Random 32+ character string

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

That's it! 🎉
