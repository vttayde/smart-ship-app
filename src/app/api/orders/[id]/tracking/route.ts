import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, location, message, estimatedDelivery, actualDelivery } = body;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if order exists and belongs to user
    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create tracking update
    const trackingUpdate = await prisma.orderTracking.create({
      data: {
        orderId: id,
        status: status || existingOrder.status,
        message: message || `Order status: ${status || existingOrder.status}`,
        location: location || '',
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        ...(actualDelivery && { actualDelivery: new Date(actualDelivery) }),
      },
    });

    // Update order if status changed
    let updatedOrder = existingOrder;
    if (status && status !== existingOrder.status) {
      updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
          ...(actualDelivery &&
            status === 'DELIVERED' && {
              actualDeliveryDate: new Date(actualDelivery),
            }),
        },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          courierPartner: true,
          trackingUpdates: {
            orderBy: { timestamp: 'desc' },
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Tracking updated successfully',
      tracking: trackingUpdate,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating tracking:', error);
    return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all tracking updates for the order
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        estimatedDelivery: true,
        actualDelivery: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const trackingUpdates = await prisma.orderTracking.findMany({
      where: { orderId: id },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      order,
      trackingUpdates,
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return NextResponse.json({ error: 'Failed to fetch tracking' }, { status: 500 });
  }
}
