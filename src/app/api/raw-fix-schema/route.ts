import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$connect();

    // First, check what's in the orders table structure
    const tableStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `;

    // Check if problematic columns exist
    const missingColumns = [];
    const requiredColumns = ['bookedAt', 'dispatchedAt', 'deliveredAt'];

    for (const col of requiredColumns) {
      const exists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'orders'
          AND column_name = ${col}
        );
      `;

      const hasColumn =
        Array.isArray(exists) && exists.length > 0 && (exists[0] as { exists: boolean }).exists;

      if (!hasColumn) {
        missingColumns.push(col);
      }
    }

    // Add missing columns one by one
    const addResults = [];
    for (const col of missingColumns) {
      try {
        await prisma.$executeRaw`
          ALTER TABLE "orders" ADD COLUMN "${col}" TIMESTAMP(3);
        `;
        addResults.push(`✅ Added ${col} column`);
      } catch (error) {
        addResults.push(
          `❌ Failed to add ${col}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Verify final structure
    const finalStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
      ORDER BY ordinal_position;
    `;

    // Test a simple orders query with raw SQL
    let testQuery = null;
    try {
      testQuery = await prisma.$queryRaw`
        SELECT id, "userId", "trackingNumber", "status", "createdAt", "bookedAt"
        FROM orders 
        LIMIT 1;
      `;
    } catch (queryError) {
      testQuery = { error: queryError instanceof Error ? queryError.message : 'Unknown error' };
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Raw schema fix completed',
      initialStructure: tableStructure,
      missingColumns: missingColumns,
      addResults: addResults,
      finalStructure: finalStructure,
      testQuery: testQuery,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Raw fix error:', error);
    return NextResponse.json(
      {
        error: 'Raw schema fix failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
