import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Get environment variables (safely)
        const envVars = {
            NODE_ENV: process.env.NODE_ENV || 'undefined',
            DATABASE_URL: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET',
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET',
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
            // Show all env vars starting with DATABASE or NEXTAUTH (without values for security)
            allEnvKeys: Object.keys(process.env).filter(key =>
                key.startsWith('DATABASE') || key.startsWith('NEXTAUTH') || key.startsWith('VERCEL')
            ),
        };

        return NextResponse.json({
            status: 'debug',
            environment: envVars,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Debug check failed',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
