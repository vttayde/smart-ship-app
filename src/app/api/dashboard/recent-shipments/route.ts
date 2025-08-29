import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const recentShipments = await prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        pickupAddress: {
          select: {
            city: true,
            state: true
          }
        },
        deliveryAddress: {
          select: {
            city: true,
            state: true
          }
        },
        courierPartner: {
          select: {
            name: true
          }
        }
      }
    });

    const formattedShipments = recentShipments.map(order => ({
      id: order.id,
      trackingNumber: order.trackingNumber || order.id.slice(-8).toUpperCase(),
      customerName: order.user.name || order.user.email,
      destination: `${order.deliveryAddress.city}, ${order.deliveryAddress.state}`,
      status: order.status,
      courierName: order.courierPartner.name,
      estimatedDelivery: order.estimatedDelivery,
      value: order.totalAmount,
      priority: determinePriority(order.packageType, order.declaredValue)
    }));

    return NextResponse.json(formattedShipments);
  } catch (error) {
    console.error('Recent shipments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent shipments' },
      { status: 500 }
    );
  }
}

function determinePriority(packageType: string | null, declaredValue: number | null): 'low' | 'medium' | 'high' | 'urgent' {
  if (packageType?.toLowerCase().includes('express') || packageType?.toLowerCase().includes('urgent')) {
    return 'urgent';
  }
  
  if (declaredValue && declaredValue > 50000) {
    return 'high';
  }
  
  if (declaredValue && declaredValue > 10000) {
    return 'medium';
  }
  
  return 'low';
}
