import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          debug: 'No session or email found',
          session: session ? 'exists' : 'null',
        },
        { status: 401 }
      );
    }

    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
          debug: 'User with this email does not exist in database',
          email: session.user.email,
        },
        { status: 404 }
      );
    }

    // Check what tables exist
    const tablesResult = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;

    // Check if addresses table exists
    const addressesTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'addresses'
      );
    `;

    // Try to get user without addresses include first
    let userBasic;
    try {
      userBasic = await prisma.user.findUnique({
        where: { id: user.id },
      });
    } catch (userError) {
      return NextResponse.json(
        {
          error: 'User query failed',
          debug: 'Basic user query failed',
          details: userError instanceof Error ? userError.message : 'Unknown error',
          tables: tablesResult,
        },
        { status: 500 }
      );
    }

    // Try to get addresses directly if table exists
    let addresses = null;
    let addressesError = null;
    try {
      addresses = await prisma.address.findMany({
        where: { userId: user.id },
        take: 5,
      });
    } catch (error) {
      addressesError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Try the original query with include
    let userWithAddresses = null;
    let includeError = null;
    try {
      userWithAddresses = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          addresses: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      includeError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      debug: 'Addresses debug info',
      user: { id: user.id, email: user.email },
      tables: tablesResult,
      addressesTableExists: addressesTableExists,
      userBasic: userBasic,
      addressesDirect: {
        data: addresses,
        error: addressesError,
      },
      userWithInclude: {
        data: userWithAddresses ? { addressesCount: userWithAddresses.addresses?.length } : null,
        error: includeError,
      },
    });
  } catch (error) {
    console.error('Debug addresses error:', error);
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
