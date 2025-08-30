import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active courier partners
    const courierPartners = await prisma.courierPartner.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        pricingModel: true,
        coverageAreas: true,
        rating: true,
        apiEndpoint: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ courierPartners });
  } catch (error) {
    console.error('Error fetching courier partners:', error);
    return NextResponse.json({ error: 'Failed to fetch courier partners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, pricingModel, coverageAreas, apiKey, apiEndpoint, rating } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        {
          error: 'Name is required',
        },
        { status: 400 }
      );
    }

    // Create new courier partner
    const courierPartner = await prisma.courierPartner.create({
      data: {
        name,
        code: name.toLowerCase().replace(/[^a-z0-9]/g, '_'), // Generate code from name
        pricingModel: pricingModel || null,
        coverageAreas: coverageAreas || null,
        apiKey: apiKey || null,
        apiEndpoint: apiEndpoint || null,
        rating: rating || 0,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Courier partner created successfully',
        courierPartner,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating courier partner:', error);
    return NextResponse.json({ error: 'Failed to create courier partner' }, { status: 500 });
  }
}
