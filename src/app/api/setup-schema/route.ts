import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$connect();

    // Create enum types first
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create the essential tables for dashboard to work
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "courier_partners" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "code" TEXT NOT NULL UNIQUE,
        "apiEndpoint" TEXT,
        "apiKey" TEXT,
        "authType" TEXT,
        "isSandbox" BOOLEAN NOT NULL DEFAULT true,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "avgDeliveryDays" INTEGER NOT NULL DEFAULT 3,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "addresses" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "addressLine1" TEXT NOT NULL,
        "addressLine2" TEXT,
        "city" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "pincode" TEXT NOT NULL,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add foreign key constraints
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "addresses" 
        ADD CONSTRAINT "addresses_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "courierPartnerId" TEXT NOT NULL,
        "pickupAddressId" TEXT NOT NULL,
        "deliveryAddressId" TEXT NOT NULL,
        "trackingNumber" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "serviceType" TEXT NOT NULL,
        "parcelContents" TEXT NOT NULL,
        "dimensions" JSONB NOT NULL,
        "declaredValue" DOUBLE PRECISION NOT NULL,
        "totalAmount" DOUBLE PRECISION NOT NULL,
        "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "estimatedDelivery" TIMESTAMP(3),
        "actualDelivery" TIMESTAMP(3),
        "deliveryInstructions" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add foreign key constraints for orders
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_courierPartnerId_fkey" 
        FOREIGN KEY ("courierPartnerId") REFERENCES "courier_partners"("id") ON DELETE RESTRICT;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_pickupAddressId_fkey" 
        FOREIGN KEY ("pickupAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_deliveryAddressId_fkey" 
        FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses"("id") ON DELETE RESTRICT;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Complete database schema created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Schema setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create schema',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
