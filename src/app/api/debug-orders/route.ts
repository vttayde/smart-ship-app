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

        // Try to get orders with minimal relations first
        let orders;
        try {
            orders = await prisma.order.findMany({
                where: { userId: user.id },
                take: 5,
                orderBy: { createdAt: 'desc' },
            });
        } catch (orderError) {
            return NextResponse.json(
                {
                    error: 'Orders table query failed',
                    debug: 'Basic orders query failed',
                    details: orderError instanceof Error ? orderError.message : 'Unknown error',
                    user: { id: user.id, email: user.email },
                    tables: tablesResult,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            debug: 'Orders API working',
            user: { id: user.id, email: user.email },
            ordersCount: orders.length,
            tables: tablesResult,
            orders: orders,
        });
    } catch (error) {
        console.error('Debug orders error:', error);
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
