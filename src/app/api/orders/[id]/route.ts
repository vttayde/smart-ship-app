import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get specific order with all related data
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own orders
      },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
        courierPartner: true,
        payments: true,
        trackingUpdates: {
          orderBy: { timestamp: 'desc' },
        },
        orderLogs: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, deliveryInstructions } = body;

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

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(deliveryInstructions && { deliveryInstructions }),
        updatedAt: new Date(),
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

    // If status was updated, create a tracking update
    if (status && status !== existingOrder.status) {
      await prisma.orderTracking.create({
        data: {
          orderId: id,
          status,
          message: `Order status updated to ${status}`,
          location: '', // This would typically come from courier API
        },
      });
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only allow cancellation if order is still pending or confirmed
    if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
      return NextResponse.json(
        {
          error: 'Order cannot be cancelled in current status',
        },
        { status: 400 }
      );
    }

    // Update order status to cancelled instead of deleting
    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    // Create tracking update for cancellation
    await prisma.orderTracking.create({
      data: {
        orderId: id,
        status: 'CANCELLED',
        message: 'Order cancelled by user',
        location: '',
      },
    });

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: cancelledOrder,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
