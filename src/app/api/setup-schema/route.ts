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

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'NETBANKING', 'WALLET', 'UPI', 'COD');
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

    // Drop and recreate orders table with complete schema
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
        "isInsured" BOOLEAN NOT NULL DEFAULT false,
        "insuranceAmount" DECIMAL(65,30),
        "codAmount" DECIMAL(65,30),
        "notes" TEXT,
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

    // Create payments table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'INR',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "method" TEXT,
        "transactionId" TEXT,
        "gatewayResponse" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add foreign key for payments
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "payments" 
        ADD CONSTRAINT "payments_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create tracking updates table (OrderTracking model)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "order_tracking" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "location" TEXT,
        "description" TEXT,
        "timestamp" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add foreign key for tracking updates
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "order_tracking" 
        ADD CONSTRAINT "order_tracking_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE;
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
