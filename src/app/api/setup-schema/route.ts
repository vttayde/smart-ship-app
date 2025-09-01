import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use Prisma's programmatic schema push
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Test basic connection first
    await prisma.$connect();

    // Create enum types first
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Try to create tables using raw SQL based on our schema
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "phone" TEXT UNIQUE,
        "firstName" TEXT,
        "lastName" TEXT,
        "company" TEXT,
        "gstin" TEXT,
        "passwordHash" TEXT,
        "phoneVerified" BOOLEAN DEFAULT false,
        "role" "UserRole" DEFAULT 'USER',
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastLoginAt" TIMESTAMP(3)
      );
    `; // Create other required tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        UNIQUE("identifier", "token")
      );
    `;

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to setup database',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
