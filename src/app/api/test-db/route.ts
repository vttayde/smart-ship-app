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

    // Test basic database connection without using external libs
    // Just check if the DATABASE_URL is properly formatted
    const urlCheck = new URL(dbUrl);

    return NextResponse.json({
      status: 'Environment variables loaded successfully',
      databaseUrl: {
        protocol: urlCheck.protocol,
        hostname: urlCheck.hostname,
        database: urlCheck.pathname.substring(1),
        hasPassword: urlCheck.password ? true : false,
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
          DATABASE_URL: process.env.DATABASE_URL
            ? 'SET (length: ' + process.env.DATABASE_URL.length + ')'
            : 'NOT SET',
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
        },
      },
      { status: 500 }
    );
  }
}
