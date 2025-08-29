import { CourierManager } from '@/services/courier/manager';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();
let courierManager: CourierManager | null = null;

// Initialize courier manager
async function getCourierManager(): Promise<CourierManager> {
  if (!courierManager) {
    courierManager = new CourierManager({ prisma });
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
    let order;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          courierPartner: true,
          pickupAddress: true,
          deliveryAddress: true,
          trackingUpdates: {
            orderBy: { timestamp: 'desc' },
          },
        },
      });
    } else if (trackingNumber) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ trackingNumber: trackingNumber }, { courierTrackingId: trackingNumber }],
        },
        include: {
          courierPartner: true,
          pickupAddress: true,
          deliveryAddress: true,
          trackingUpdates: {
            orderBy: { timestamp: 'desc' },
          },
        },
      });
    }

    if (!order) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    // Prepare basic tracking response
    const response: TrackingResponse = {
      success: true,
      shipment: {
        id: order.id,
        trackingNumber: order.courierTrackingId || order.trackingNumber || '',
        currentStatus: order.status,
        courierName: order.courierPartner.name,
        estimatedDelivery: order.estimatedDelivery || undefined,
        actualDelivery: order.actualDelivery || undefined,
        origin: `${order.pickupAddress.city}, ${order.pickupAddress.state}`,
        destination: `${order.deliveryAddress.city}, ${order.deliveryAddress.state}`,
      },
      timeline: order.trackingUpdates.map((update, index) => ({
        status: update.status,
        timestamp: update.timestamp,
        location: update.location || undefined,
        description: update.message || update.status,
        isCurrentStatus: index === 0,
      })),
      metadata: {
        lastUpdated: order.updatedAt,
        totalStops: order.trackingUpdates.length,
        isDelivered: order.status === 'delivered',
        canCancel: ['pending', 'confirmed', 'pickup_scheduled'].includes(order.status),
        labelUrl: undefined, // Will be populated if available
      },
    };

    // Get real-time tracking if requested and courier info is available
    if (includeRealTime && order.courierTrackingId && order.courierPartner.code) {
      try {
        const manager = await getCourierManager();

        if (manager.isServiceAvailable(order.courierPartner.code)) {
          const liveUpdates = await manager.trackShipment(
            order.courierTrackingId,
            order.courierPartner.code
          );

          if (liveUpdates.length > 0) {
            response.liveUpdates = liveUpdates.map(update => ({
              status: update.status,
              timestamp: update.timestamp,
              location: update.location,
              description: update.description,
              courierStatus: update.courierStatus,
            }));

            // Update stored tracking data if we have new updates
            const latestStoredUpdate = order.trackingUpdates[0];
            const latestLiveUpdate = liveUpdates[0];

            if (!latestStoredUpdate || latestLiveUpdate.timestamp > latestStoredUpdate.timestamp) {
              // Update order status and tracking in background
              await manager.updateTrackingInfo(order.id);

              // Update current status in response
              response.shipment.currentStatus = latestLiveUpdate.status;
              if (latestLiveUpdate.expectedDelivery) {
                response.shipment.estimatedDelivery = latestLiveUpdate.expectedDelivery;
              }
            }
          }
        }
      } catch (trackingError) {
        console.error('Error fetching real-time tracking:', trackingError);
        // Don't fail the request if live tracking fails
        response.liveUpdates = [];
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
    const { orderId, status, location, description, courierData } = body;

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

    // Create tracking update
    const trackingUpdate = await prisma.orderTracking.create({
      data: {
        orderId: orderId,
        status: status,
        location: location,
        message: description || status,
        courierData: courierData || {},
        timestamp: new Date(),
      },
    });

    // Update order status if it's a significant change
    const significantStatuses = [
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (significantStatuses.includes(status)) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status,
          deliveredAt: status === 'delivered' ? new Date() : undefined,
        },
      });
    }

    // Create order log
    await prisma.orderLog.create({
      data: {
        orderId: orderId,
        status: status,
        message: description || `Status updated to ${status}`,
        createdBy: 'system',
      },
    });

    return NextResponse.json({
      success: true,
      update: {
        id: trackingUpdate.id,
        status: trackingUpdate.status,
        timestamp: trackingUpdate.timestamp,
        description: trackingUpdate.message,
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
      // Update all orders for a specific courier (bulk update)
      const orders = await prisma.order.findMany({
        where: {
          courierPartner: {
            code: courierCode,
          },
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
