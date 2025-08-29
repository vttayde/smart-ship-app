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

        // Get courier partners with their order statistics
        const courierPartners = await prisma.courierPartner.findMany({
            include: {
                orders: {
                    where: {
                        createdAt: {
                            gte: startDate
                        }
                    }
                }
            }
        });

        const courierPerformance = await Promise.all(
            courierPartners.map(async (courier) => {
                const totalShipments = courier.orders.length;

                if (totalShipments === 0) {
                    return {
                        courierName: courier.name,
                        totalShipments: 0,
                        onTimeRate: 0,
                        averageDeliveryTime: 0,
                        rating: 0,
                        cost: 0
                    };
                }

                // Calculate on-time deliveries (delivered within estimated time)
                const deliveredOrders = courier.orders.filter(order => order.status === 'delivered');
                const onTimeDeliveries = deliveredOrders.filter(order => {
                    if (!order.estimatedDelivery || !order.actualDelivery) return false;
                    return order.actualDelivery <= order.estimatedDelivery;
                });

                const onTimeRate = deliveredOrders.length > 0
                    ? Math.round((onTimeDeliveries.length / deliveredOrders.length) * 100)
                    : 0;

                // Calculate average delivery time
                let averageDeliveryTime = 0;
                if (deliveredOrders.length > 0) {
                    const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
                        if (!order.actualDelivery) return sum;
                        const deliveryTime = order.actualDelivery.getTime() - order.createdAt.getTime();
                        return sum + (deliveryTime / (1000 * 60 * 60)); // Convert to hours
                    }, 0);
                    averageDeliveryTime = Math.round(totalDeliveryTime / deliveredOrders.length);
                }

                // Calculate total cost (revenue for this courier)
                const totalCost = courier.orders.reduce((sum, order) => sum + order.totalAmount, 0);

                // Calculate rating based on performance metrics
                let rating = 5.0;
                if (onTimeRate < 80) rating -= 1.0;
                if (onTimeRate < 60) rating -= 1.0;
                if (averageDeliveryTime > 72) rating -= 0.5; // More than 3 days
                if (averageDeliveryTime > 120) rating -= 0.5; // More than 5 days

                return {
                    courierName: courier.name,
                    totalShipments,
                    onTimeRate,
                    averageDeliveryTime,
                    rating: Math.max(1.0, rating), // Minimum 1.0 rating
                    cost: totalCost
                };
            })
        );

        // Filter out couriers with no shipments and sort by total shipments
        const filteredPerformance = courierPerformance
            .filter(courier => courier.totalShipments > 0)
            .sort((a, b) => b.totalShipments - a.totalShipments);

        return NextResponse.json(filteredPerformance);
    } catch (error) {
        console.error('Courier performance error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courier performance data' },
            { status: 500 }
        );
    }
}
