import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check current columns
    const currentColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `;

    // Check if bookedAt column exists
    const bookedAtExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
        AND column_name = 'bookedAt'
      );
    `;

    const hasBookedAt =
      Array.isArray(bookedAtExists) &&
      bookedAtExists.length > 0 &&
      (bookedAtExists[0] as { exists: boolean }).exists;

    const alterResults: string[] = [];

    if (!hasBookedAt) {
      // Add the missing columns
      try {
        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD COLUMN "bookedAt" TIMESTAMP(3);
        `;
        alterResults.push('Added bookedAt column');
      } catch (error) {
        alterResults.push(
          `Failed to add bookedAt: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      try {
        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD COLUMN "dispatchedAt" TIMESTAMP(3);
        `;
        alterResults.push('Added dispatchedAt column');
      } catch (error) {
        alterResults.push(
          `Failed to add dispatchedAt: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      try {
        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD COLUMN "deliveredAt" TIMESTAMP(3);
        `;
        alterResults.push('Added deliveredAt column');
      } catch (error) {
        alterResults.push(
          `Failed to add deliveredAt: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } else {
      alterResults.push('bookedAt column already exists');
    }

    // Check columns after modification
    const updatedColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `;

    return NextResponse.json({
      success: true,
      message: 'Orders table column fix completed',
      bookedAtExistedBefore: hasBookedAt,
      alterResults: alterResults,
      columnsBefore: currentColumns,
      columnsAfter: updatedColumns,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fix orders columns error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fix orders columns',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
