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

    // Check orders table columns
    const ordersColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `;

    // Try to fix the orders table if weight column is missing
    const weightColumnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
        AND column_name = 'weight'
      );
    `;

    // Check for missing columns that should exist according to Prisma schema
    const bookedAtExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
        AND column_name = 'bookedAt'
      );
    `;

    let fixAttempted = false;
    const weightExists =
      Array.isArray(weightColumnExists) &&
      weightColumnExists.length > 0 &&
      (weightColumnExists[0] as { exists: boolean }).exists;

    const bookedAtColumnExists =
      Array.isArray(bookedAtExists) &&
      bookedAtExists.length > 0 &&
      (bookedAtExists[0] as { exists: boolean }).exists;

    // Fix the table if either weight or bookedAt columns are missing
    if (!weightExists || !bookedAtColumnExists) {
      try {
        // Drop and recreate orders table with correct schema
        await prisma.$executeRaw`DROP TABLE IF EXISTS "orders" CASCADE;`;

        await prisma.$executeRaw`
          CREATE TABLE "orders" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "courierPartnerId" TEXT NOT NULL,
            "pickupAddressId" TEXT NOT NULL,
            "deliveryAddressId" TEXT NOT NULL,
            "trackingNumber" TEXT,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "totalAmount" DECIMAL(65,30) NOT NULL,
            "weight" DECIMAL(65,30) NOT NULL,
            "packageType" TEXT NOT NULL,
            "declaredValue" DECIMAL(65,30),
            "courierOrderId" TEXT,
            "courierTrackingId" TEXT,
            "courierStatus" TEXT,
            "courierResponse" JSONB,
            "actualWeight" DECIMAL(65,30),
            "volumetricWeight" DECIMAL(65,30),
            "chargedWeight" DECIMAL(65,30),
            "serviceType" TEXT,
            "parcelContents" TEXT,
            "dimensions" JSONB,
            "estimatedDelivery" TIMESTAMP(3),
            "actualDelivery" TIMESTAMP(3),
            "deliveryInstructions" TEXT,
            "bookedAt" TIMESTAMP(3),
            "dispatchedAt" TIMESTAMP(3),
            "deliveredAt" TIMESTAMP(3),
            "isInsured" BOOLEAN NOT NULL DEFAULT false,
            "insuranceAmount" DECIMAL(65,30),
            "codAmount" DECIMAL(65,30),
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `;

        // Add foreign key constraints
        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        `;

        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD CONSTRAINT "orders_courierPartnerId_fkey" 
          FOREIGN KEY ("courierPartnerId") REFERENCES "courier_partners"("id") ON DELETE RESTRICT;
        `;

        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD CONSTRAINT "orders_pickupAddressId_fkey" 
          FOREIGN KEY ("pickupAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT;
        `;

        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryAddressId_fkey" 
          FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT;
        `;

        fixAttempted = true;
      } catch (fixError) {
        return NextResponse.json(
          {
            error: 'Table fix failed',
            debug: 'Attempted to fix orders table but failed',
            details: fixError instanceof Error ? fixError.message : 'Unknown error',
            user: { id: user.id, email: user.email },
            tables: tablesResult,
            ordersColumns: ordersColumns,
            weightExists: weightExists,
            bookedAtExists: bookedAtColumnExists,
          },
          { status: 500 }
        );
      }
    }

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
          ordersColumns: ordersColumns,
          weightExists: weightExists,
          bookedAtExists: bookedAtColumnExists,
          fixAttempted: fixAttempted,
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
      ordersColumns: ordersColumns,
      weightExists: weightExists,
      bookedAtExists: bookedAtColumnExists,
      fixAttempted: fixAttempted,
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
