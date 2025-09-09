import { prisma } from '@/lib/prisma';
import { CourierManager } from '@/services/courier/manager';
import { NextRequest, NextResponse } from 'next/server';

let courierManager: CourierManager | null = null;

// Initialize courier manager
async function getCourierManager(): Promise<CourierManager> {
  if (!courierManager) {
    courierManager = new CourierManager();
    await courierManager.initialize();
  }
  return courierManager;
}

interface TrackingResponse {
  success: boolean;
  shipment: {
    id: string;
    trackingNumber: string;
    currentStatus: string;
    courierName: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    origin: string;
    destination: string;
  };
  timeline: Array<{
    status: string;
    timestamp: Date;
    location?: string;
    description: string;
    isCurrentStatus: boolean;
  }>;
  liveUpdates?: Array<{
    status: string;
    timestamp: Date;
    location?: string;
    description: string;
    courierStatus: string;
  }>;
  metadata: {
    lastUpdated: Date;
    totalStops: number;
    isDelivered: boolean;
    canCancel: boolean;
    labelUrl?: string;
  };
}

// GET endpoint for tracking shipments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const orderId = searchParams.get('orderId');
    const includeRealTime = searchParams.get('includeRealTime') === 'true';

    if (!trackingNumber && !orderId) {
      return NextResponse.json(
        { error: 'Tracking number or order ID is required' },
        { status: 400 }
      );
    }

    // Find order by tracking number or order ID
    // Note: Using basic queries compatible with staging database schema
    let order;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          trackingNumber: true,
          courierTrackingId: true,
          status: true,
          estimatedDelivery: true,
          actualDelivery: true,
          updatedAt: true,
          createdAt: true,
          // Basic fields for compatibility
          userId: true,
          totalAmount: true,
          weight: true,
          packageType: true,
          serviceType: true,
        },
      });
    } else if (trackingNumber) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ trackingNumber: trackingNumber }, { courierTrackingId: trackingNumber }],
        },
        select: {
          id: true,
          trackingNumber: true,
          courierTrackingId: true,
          status: true,
          estimatedDelivery: true,
          actualDelivery: true,
          updatedAt: true,
          createdAt: true,
          // Basic fields for compatibility
          userId: true,
          totalAmount: true,
          weight: true,
          packageType: true,
          serviceType: true,
        },
      });
    }

    if (!order) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Prepare basic tracking response with staging database compatibility
    const response: TrackingResponse = {
      success: true,
      shipment: {
        id: order.id,
        trackingNumber: order.courierTrackingId || order.trackingNumber || '',
        currentStatus: order.status,
        courierName: 'Courier Service', // Default since courierPartner relation not available
        estimatedDelivery: order.estimatedDelivery || undefined,
        actualDelivery: order.actualDelivery || undefined,
        origin: 'Origin City', // Default since pickupAddress relation not available
        destination: 'Destination City', // Default since deliveryAddress relation not available
      },
      // Basic timeline from order status since trackingUpdates relation not available
      timeline: [
        {
          status: order.status,
          timestamp: order.updatedAt,
          location: 'In Transit',
          description: `Order ${order.status}`,
          isCurrentStatus: true,
        },
        {
          status: 'created',
          timestamp: order.createdAt,
          location: 'Origin',
          description: 'Order created and confirmed',
          isCurrentStatus: false,
        },
      ],
      metadata: {
        lastUpdated: order.updatedAt,
        totalStops: 2, // Basic count since trackingUpdates not available
        isDelivered: order.status === 'delivered',
        canCancel: ['pending', 'confirmed', 'pickup_scheduled'].includes(order.status),
        labelUrl: undefined,
      },
    };

    // Get real-time tracking if requested and courier info is available
    // Note: Simplified for staging database compatibility
    if (includeRealTime && order.courierTrackingId) {
      try {
        // Mock real-time updates for staging database compatibility
        response.liveUpdates = [
          {
            status: 'in_transit',
            timestamp: new Date(),
            location: 'Distribution Center',
            description: 'Package is in transit to destination',
            courierStatus: 'IN_TRANSIT',
          },
          {
            status: order.status,
            timestamp: order.updatedAt,
            location: 'Last Known Location',
            description: `Current status: ${order.status}`,
            courierStatus: order.status.toUpperCase(),
          },
        ];
      } catch (trackingError) {
        console.error('Error fetching real-time tracking:', trackingError);
        // Continue without real-time data on error
      }
    }

    // Add delivery progress percentage
    const statusProgress: { [key: string]: number } = {
      pending: 0,
      confirmed: 10,
      pickup_scheduled: 20,
      picked_up: 30,
      in_transit: 60,
      out_for_delivery: 85,
      delivered: 100,
      cancelled: 0,
      returned: 0,
    };

    const deliveryProgress = statusProgress[response.shipment.currentStatus] || 0;

    return NextResponse.json({
      ...response,
      deliveryProgress,
      statusDescription: getStatusDescription(response.shipment.currentStatus),
      nextSteps: getNextSteps(response.shipment.currentStatus, response.metadata.canCancel),
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json(
      {
        error: 'Failed to track shipment',
        message:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual tracking updates (admin/courier use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, _location, description, _courierData } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create tracking update (simplified for staging database compatibility)
    // Note: Using basic order update since tracking tables don't exist in staging DB
    const updateData: { status: string; updatedAt?: Date; actualDelivery?: Date } = {
      status: status,
      updatedAt: new Date(),
    };

    // Set delivery date if delivered
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      update: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        timestamp: updatedOrder.updatedAt,
        description: description || `Status updated to ${status}`,
      },
    });
  } catch (error) {
    console.error('Error adding tracking update:', error);
    return NextResponse.json({ error: 'Failed to add tracking update' }, { status: 500 });
  }
}

// PUT endpoint for bulk tracking updates (for webhook integrations)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const courierCode = searchParams.get('courierCode');

    if (!orderId && !courierCode) {
      return NextResponse.json({ error: 'Order ID or courier code is required' }, { status: 400 });
    }

    const manager = await getCourierManager();

    let updatedOrders = 0;

    if (orderId) {
      // Update specific order
      await manager.updateTrackingInfo(orderId);
      updatedOrders = 1;
    } else if (courierCode) {
      // Update all orders for a specific courier (simplified for staging database)
      // Note: Using basic query since courierPartner relation doesn't exist in staging DB
      const orders = await prisma.order.findMany({
        where: {
          status: {
            not: 'delivered',
          },
          courierTrackingId: {
            not: null,
          },
        },
        select: { id: true },
      });

      for (const order of orders) {
        try {
          await manager.updateTrackingInfo(order.id);
          updatedOrders++;
        } catch (error) {
          console.error(`Error updating order ${order.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated tracking for ${updatedOrders} order(s)`,
      updatedOrders,
    });
  } catch (error) {
    console.error('Error bulk updating tracking:', error);
    return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 });
  }
}

// Utility functions
function getStatusDescription(status: string): string {
  const descriptions: { [key: string]: string } = {
    pending: 'Your order has been placed and is being processed',
    confirmed: 'Your order has been confirmed and will be picked up soon',
    pickup_scheduled: 'Pickup has been scheduled with the courier',
    picked_up: 'Your package has been picked up and is on its way',
    in_transit: 'Your package is in transit to the destination',
    out_for_delivery: 'Your package is out for delivery and will arrive soon',
    delivered: 'Your package has been successfully delivered',
    cancelled: 'Your order has been cancelled',
    returned: 'Your package is being returned to sender',
  };

  return descriptions[status] || 'Status update';
}

function getNextSteps(status: string, canCancel: boolean): string[] {
  const steps: { [key: string]: string[] } = {
    pending: [
      'We are processing your order',
      'You will receive confirmation soon',
      canCancel ? 'You can cancel this order if needed' : '',
    ],
    confirmed: [
      'Prepare your package for pickup',
      'Ensure someone is available during pickup hours',
      canCancel ? 'You can still cancel this order' : '',
    ],
    pickup_scheduled: [
      'Keep your package ready for pickup',
      'Ensure the pickup address is accessible',
      'You will receive pickup confirmation',
    ],
    picked_up: [
      'Your package is now with the courier',
      'Track real-time updates here',
      'Delivery updates will be sent via SMS/email',
    ],
    in_transit: [
      'Your package is on its way',
      'Check back for delivery updates',
      'Prepare for delivery at the destination',
    ],
    out_for_delivery: [
      'Your package will be delivered today',
      'Ensure someone is available to receive it',
      'Have ID ready if signature is required',
    ],
    delivered: [
      'Your package has been delivered successfully',
      'Please confirm receipt if requested',
      'Thank you for using our service',
    ],
    cancelled: [
      'Your order has been cancelled',
      'Refund will be processed if applicable',
      'Contact support for assistance',
    ],
  };

  return (steps[status] || []).filter(Boolean);
}
