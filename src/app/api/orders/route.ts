import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orders - Fetch user's orders
 * Returns simplified order data for staging database compatibility
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user efficiently
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch orders with only existing fields (staging DB compatible)
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        userId: true,
        trackingNumber: true,
        status: true,
        totalAmount: true,
        weight: true,
        packageType: true,
        declaredValue: true,
        courierOrderId: true,
        courierTrackingId: true,
        courierStatus: true,
        serviceType: true,
        parcelContents: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

/**
 * POST /api/orders - Create new order
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pickupAddressId,
      deliveryAddressId,
      courierPartnerId,
      packageType,
      weight,
      dimensions, // {length, width, height}
      declaredValue,
      parcelContents,
      deliveryInstructions,
    } = body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate addresses exist and belong to user
    const pickupAddress = await prisma.address.findFirst({
      where: { id: pickupAddressId, userId: user.id },
    });

    const deliveryAddress = await prisma.address.findFirst({
      where: { id: deliveryAddressId, userId: user.id },
    });

    if (!pickupAddress || !deliveryAddress) {
      return NextResponse.json({ error: 'Invalid address selection' }, { status: 400 });
    }

    // Validate courier partner exists
    const courierPartner = await prisma.courierPartner.findUnique({
      where: { id: courierPartnerId },
    });

    if (!courierPartner) {
      return NextResponse.json({ error: 'Invalid courier partner' }, { status: 400 });
    }

    // Generate tracking number
    const trackingNumber = `SS${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate estimated price (basic calculation)
    const basePrice = 50;
    const weightPrice = weight * 10;
    const totalAmount = basePrice + weightPrice;

    // Create new order
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        trackingNumber,
        pickupAddressId,
        deliveryAddressId,
        courierPartnerId,
        packageType,
        weight,
        dimensions,
        declaredValue,
        totalAmount,
        parcelContents,
        deliveryInstructions,
        status: 'PENDING',
      },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
        courierPartner: true,
      },
    });

    // Create initial tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: newOrder.id,
        status: 'PENDING',
        location: pickupAddress.city,
        message: 'Order created and pending pickup',
      },
    });

    return NextResponse.json({
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
