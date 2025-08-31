import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Database connectivity test with updated environment variables
    await prisma.$queryRaw`SELECT 1`;

    // Check if demo users exist
    const userCount = await prisma.user.count();
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@smartship.com' },
    });

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      hasDemoUser: !!demoUser,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
