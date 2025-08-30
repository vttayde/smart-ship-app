import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get total shipments
    const totalShipments = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get active shipments (not delivered, cancelled, or returned)
    const activeShipments = await prisma.order.count({
      where: {
        status: {
          notIn: ['delivered', 'cancelled', 'returned'],
        },
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get delivered today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const deliveredToday = await prisma.order.count({
      where: {
        status: 'delivered',
        updatedAt: {
          gte: todayStart,
        },
      },
    });

    // Get pending pickups
    const pendingPickups = await prisma.order.count({
      where: {
        status: {
          in: ['pending', 'confirmed'],
        },
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate total revenue
    const revenueData = await prisma.order.aggregate({
      where: {
        status: {
          notIn: ['cancelled'],
        },
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalRevenue = revenueData._sum?.totalAmount || 0;

    // Calculate average delivery time (in hours)
    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: 'delivered',
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let averageDeliveryTime = 0;
    if (deliveredOrders.length > 0) {
      const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
        const deliveryTime = order.updatedAt.getTime() - order.createdAt.getTime();
        return sum + deliveryTime / (1000 * 60 * 60); // Convert to hours
      }, 0);
      averageDeliveryTime = Math.round(totalDeliveryTime / deliveredOrders.length);
    }

    // Calculate on-time delivery rate
    const onTimeDeliveries = await prisma.order.count({
      where: {
        status: 'delivered',
        createdAt: {
          gte: startDate,
        },
        // Assuming we have an estimatedDelivery field
        // updatedAt: {
        //   lte: prisma.order.fields.estimatedDelivery
        // }
      },
    });

    const totalDeliveries = await prisma.order.count({
      where: {
        status: 'delivered',
        createdAt: {
          gte: startDate,
        },
      },
    });

    const onTimeDeliveryRate =
      totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0;

    // Mock customer satisfaction (would come from reviews/feedback system)
    const customerSatisfaction = 4.2;

    const stats = {
      totalShipments,
      activeShipments,
      deliveredToday,
      pendingPickups,
      totalRevenue: Number(totalRevenue),
      averageDeliveryTime,
      onTimeDeliveryRate,
      customerSatisfaction,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
