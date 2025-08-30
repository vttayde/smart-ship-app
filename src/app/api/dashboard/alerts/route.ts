import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface AlertItem {
  id: string;
  type: 'delay' | 'failed_delivery' | 'exception' | 'urgent';
  message: string;
  shipmentId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const alerts: AlertItem[] = [];

    // Check for delayed deliveries
    const delayedOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['in_transit', 'out_for_delivery'],
        },
        estimatedDelivery: {
          lt: new Date(), // Past estimated delivery time
        },
      },
      include: {
        courierPartner: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
    });

    delayedOrders.forEach(order => {
      const daysPastDue = Math.floor(
        (new Date().getTime() - (order.estimatedDelivery?.getTime() || 0)) / (1000 * 60 * 60 * 24)
      );

      alerts.push({
        id: `delay-${order.id}`,
        type: 'delay' as const,
        message: `Shipment is ${daysPastDue} day(s) past estimated delivery`,
        shipmentId: order.trackingNumber || order.id,
        timestamp: new Date(),
        severity: daysPastDue > 3 ? ('high' as const) : ('medium' as const),
      });
    });

    // Check for failed deliveries (orders that should have been delivered but are stuck)
    const stuckOrders = await prisma.order.findMany({
      where: {
        status: 'in_transit',
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Older than 7 days
        },
      },
      take: 5,
    });

    stuckOrders.forEach(order => {
      alerts.push({
        id: `stuck-${order.id}`,
        type: 'exception' as const,
        message: `Shipment stuck in transit for more than 7 days`,
        shipmentId: order.trackingNumber || order.id,
        timestamp: new Date(),
        severity: 'high' as const,
      });
    });

    // Check for high-value urgent shipments
    const urgentOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['pending', 'confirmed'],
        },
        declaredValue: {
          gt: 100000, // High value orders
        },
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Created in last 24 hours
        },
      },
      take: 3,
    });

    urgentOrders.forEach(order => {
      alerts.push({
        id: `urgent-${order.id}`,
        type: 'urgent' as const,
        message: `High-value shipment requires immediate attention`,
        shipmentId: order.trackingNumber || order.id,
        timestamp: order.createdAt,
        severity: 'high' as const,
      });
    });

    // Sort alerts by severity and timestamp
    const sortedAlerts = alerts
      .sort((a, b) => {
        // Sort by severity first (high > medium > low)
        const severityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;

        // Then by timestamp (newest first)
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, limit);

    return NextResponse.json(sortedAlerts);
  } catch (error) {
    console.error('Alerts error:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
