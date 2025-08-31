import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.error('Starting schema migration...');

    // Check if orders table exists and get its current structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `;

    console.error('Current orders table structure:', tableInfo);

    // Drop and recreate the orders table with the correct schema
    await prisma.$executeRaw`DROP TABLE IF EXISTS "orders" CASCADE;`;

    // Create orders table with correct schema matching Prisma model
    await prisma.$executeRaw`
      CREATE TABLE "orders" (
        "id" TEXT NOT NULL,
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
        "isInsured" BOOLEAN NOT NULL DEFAULT false,
        "insuranceAmount" DECIMAL(65,30),
        "codAmount" DECIMAL(65,30),
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
      );
    `;

    // Add unique constraint for trackingNumber
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "orders_trackingNumber_key" ON "orders"("trackingNumber");
    `;

    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "orders" ADD CONSTRAINT "orders_courierPartnerId_fkey" FOREIGN KEY ("courierPartnerId") REFERENCES "courier_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "orders" ADD CONSTRAINT "orders_pickupAddressId_fkey" FOREIGN KEY ("pickupAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `;

    // Check the updated table structure
    const updatedTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `;

    console.error('Updated orders table structure:', updatedTableInfo);

    return NextResponse.json({
      success: true,
      message: 'Orders table schema migrated successfully',
      oldStructure: tableInfo,
      newStructure: updatedTableInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Schema migration error:', error);
    return NextResponse.json(
      {
        error: 'Schema migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
