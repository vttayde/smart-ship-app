import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check basic environment variables
    const dbUrl = process.env.DATABASE_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;

    if (!dbUrl) {
      return NextResponse.json(
        {
          error: 'DATABASE_URL not found',
          env: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            VERCEL_ENV: process.env.VERCEL_ENV,
            DATABASE_URL: 'NOT SET',
          },
        },
        { status: 500 }
      );
    }

    // Test database connection with Prisma
    await prisma.$connect();

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    await prisma.$disconnect();

    return NextResponse.json({
      status: 'Database connection successful',
      testQuery: result,
      databaseInfo: {
        protocol: new URL(dbUrl).protocol,
        hostname: new URL(dbUrl).hostname,
        database: new URL(dbUrl).pathname.substring(1),
      },
      env: {
        DATABASE_URL: 'SET (length: ' + dbUrl.length + ')',
        NEXTAUTH_SECRET: nextAuthSecret ? 'SET' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : String(error),
        env: {
          DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
          NODE_ENV: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}
