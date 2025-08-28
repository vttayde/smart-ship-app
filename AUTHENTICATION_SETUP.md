# Week 4: Authentication System Setup

## Overview
This guide will help you set up the authentication system for Smart Ship App using NextAuth.js, Prisma, and PostgreSQL.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git repository access

## Database Setup

### 1. Install PostgreSQL
- **Local Development**: Install PostgreSQL on your machine
- **Cloud Option**: Use services like Neon, Supabase, or PlanetScale

### 2. Create Database
```sql
CREATE DATABASE smart_ship_db;
CREATE USER smart_ship_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_ship_db TO smart_ship_user;
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://smart_ship_user:your_password@localhost:5432/smart_ship_db"

# NextAuth.js - Generate a secure secret
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Database Migration

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Run Database Migrations
```bash
npx prisma db push
```

### 3. (Optional) Seed Database
```bash
npm run db:seed
```

## Google OAuth Setup (Optional)

### 1. Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 2. Update Environment
Add your Google OAuth credentials to `.env.local`

## Development Server

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Application
- App: http://localhost:3000
- Login: http://localhost:3000/auth/login
- Signup: http://localhost:3000/auth/signup
- Dashboard: http://localhost:3000/dashboard

## Testing Authentication

### 1. Create Test User
1. Navigate to `/auth/signup`
2. Fill out registration form
3. Complete signup process

### 2. Test Login
1. Navigate to `/auth/login`
2. Use email/password or Google OAuth
3. Verify redirect to dashboard

### 3. Protected Routes
- Try accessing `/dashboard` without login
- Should redirect to `/auth/login`
- After login, should access dashboard successfully

## Database Schema

The authentication system includes:

### User Management
- **User**: Core user profile and authentication
- **Account**: OAuth provider accounts (Google, Facebook, etc.)
- **Session**: Active user sessions
- **VerificationToken**: Email/phone verification

### Address Management
- **Address**: User addresses for shipping
- Support for multiple address types (home, office, warehouse)

### Order Management
- **Order**: Shipment orders and tracking
- **Booking**: Quote-to-booking workflow
- **Payment**: Transaction management
- **TrackingEvent**: Real-time tracking updates

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (handled by NextAuth)
- `POST /api/auth/signout` - User logout (handled by NextAuth)

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/addresses` - Get user addresses
- `POST /api/user/addresses` - Create new address

## Security Features

### Password Security
- Minimum 8 characters
- Requires uppercase, lowercase, number, and special character
- BCrypt hashing with salt rounds

### Session Management
- JWT-based sessions
- 30-day expiration
- Automatic refresh

### Route Protection
- Middleware-based protection
- Role-based access control
- Automatic redirects

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL in .env.local
   - Ensure PostgreSQL is running
   - Check database credentials

2. **NextAuth Configuration Error**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure all required environment variables are set

3. **OAuth Issues**
   - Verify OAuth credentials in Google Console
   - Check redirect URIs match exactly
   - Ensure OAuth APIs are enabled

### Debug Mode
Set `debug: true` in NextAuth configuration for detailed logs

## Next Steps
- Add email verification system
- Implement password reset functionality
- Add multi-factor authentication
- Set up user profile management
- Implement address book functionality

## Support
For issues or questions, refer to:
- NextAuth.js documentation
- Prisma documentation
- Project README.md
