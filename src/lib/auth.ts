import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from "next-auth/providers/google"
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { prisma } from "@/lib/prisma"
// import bcryptjs from "bcryptjs"

// Note: NextAuth type extensions are handled automatically

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Disabled for development
  providers: [
    // Google OAuth Provider (disabled for now)
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   profile(profile) {
    //     return {
    //       id: profile.sub,
    //       name: profile.name,
    //       email: profile.email,
    //       image: profile.picture,
    //       role: "USER",
    //       emailVerified: profile.email_verified ? new Date() : null,
    //     }
    //   },
    // }),

    // Email/Password Provider with demo users
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password', placeholder: 'Your password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Demo users for development
        const demoUsers = [
          {
            id: '1',
            email: 'demo@smartship.com',
            password: 'demo123',
            name: 'Demo User',
            role: 'USER',
          },
          {
            id: '2',
            email: 'admin@smartship.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'ADMIN',
          },
        ];

        const user = demoUsers.find(u => u.email === credentials.email.toLowerCase());

        if (!user || user.password !== credentials.password) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          role: user.role,
          emailVerified: new Date(),
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role as string;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // Extend session.user with additional properties
        Object.assign(session.user, {
          id: token.id,
          role: token.role,
        });
      }
      return session;
    },

    async signIn({ user, account }) {
      // Always allow OAuth sign-ins
      if (account?.provider !== 'credentials') {
        return true;
      }
      return !!user;
    },

    async redirect({ url, baseUrl }) {
      // Ensure baseUrl has a fallback during build
      const fallbackBaseUrl = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';

      // Prevent redirect loops
      if (url === fallbackBaseUrl) return fallbackBaseUrl;

      // If redirecting to login page, go to dashboard instead
      if (url.includes('/auth/login')) return `${fallbackBaseUrl}/dashboard`;

      // Allows relative callback URLs
      if (url.startsWith('/')) return `${fallbackBaseUrl}${url}`;

      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === fallbackBaseUrl) return url;
      } catch {
        // If URL parsing fails, return fallback
        console.warn('Invalid URL in redirect callback:', url);
        return `${fallbackBaseUrl}/dashboard`;
      }

      // Default redirect to dashboard after sign in
      return `${fallbackBaseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  events: {
    async signIn({ user, account }) {
      /* eslint-disable */
      console.log('User signed in:', {
        userId: user.id,
        provider: account?.provider,
      });
    },

    async signOut({ session, token }) {
      console.log('User signed out:', {
        userId: token?.id || session?.user?.id,
      });
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
