import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CourierManager } from '@/services/courier/manager';
import { auth } from '@/lib/auth'; // Assuming auth middleware exists

const prisma = new PrismaClient();
let courierManager: CourierManager | null = null;

// Initialize courier manager if not already done
async function getCourierManager(): Promise<CourierManager> {
  if (!courierManager) {
    courierManager = new CourierManager({ prisma });
    await courierManager.initialize();
  }
  return courierManager;
}

interface BookingRequest {
  courierCode: string;
  serviceType: string;
  pickup: {
    addressId?: string; // If using saved address
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  delivery: {
    addressId?: string; // If using saved address
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  shipment: {
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    declaredValue: number;
    packageType: string;
    contents: string;
    codAmount?: number;
  };
  deliveryInstructions?: string;
  preferredDeliveryDate?: string;
  schedulePickup?: {
    date: string;
    timeSlot: string; // morning, afternoon, evening
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth (implement based on your auth system)
    const userId = request.headers.get('x-user-id') || 'user-1'; // Temporary for development
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: BookingRequest = await request.json();

    // Validate request data
    if (!body.courierCode || !body.serviceType || !body.pickup || !body.delivery || !body.shipment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate pincodes
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(body.pickup.pincode) || !pincodeRegex.test(body.delivery.pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode format' },
        { status: 400 }
      );
    }

    // Validate weight and value
    if (body.shipment.weight <= 0 || body.shipment.weight > 50) {
      return NextResponse.json(
        { error: 'Weight must be between 0.1 and 50 kg' },
        { status: 400 }
      );
    }

    if (body.shipment.declaredValue <= 0) {
      return NextResponse.json(
        { error: 'Declared value must be greater than 0' },
        { status: 400 }
      );
    }

    // Get courier manager
    const manager = await getCourierManager();

    // Check if courier service is available
    if (!manager.isServiceAvailable(body.courierCode)) {
      return NextResponse.json(
        { error: `Courier service ${body.courierCode} is not available` },
        { status: 400 }
      );
    }

    // Check delivery availability
    const service = manager.getService(body.courierCode);
    if (!service) {
      return NextResponse.json(
        { error: 'Courier service not found' },
        { status: 404 }
      );
    }

    const canDeliver = await service.canDeliver(body.delivery.pincode);
    if (!canDeliver) {
      return NextResponse.json(
        { error: 'Delivery not available to this pincode' },
        { status: 400 }
      );
    }

    // Create or get addresses
    let pickupAddressId = body.pickup.addressId;
    let deliveryAddressId = body.delivery.addressId;

    if (!pickupAddressId) {
      const pickupAddress = await prisma.address.create({
        data: {
          userId: userId,
          name: body.pickup.name,
          phone: body.pickup.phone,
          email: body.pickup.email,
          addressLine1: body.pickup.addressLine1,
          addressLine2: body.pickup.addressLine2,
          city: body.pickup.city,
          state: body.pickup.state,
          pincode: body.pickup.pincode,
          country: 'India',
          type: 'pickup'
        }
      });
      pickupAddressId = pickupAddress.id;
    }

    if (!deliveryAddressId) {
      const deliveryAddress = await prisma.address.create({
        data: {
          userId: userId,
          name: body.delivery.name,
          phone: body.delivery.phone,
          email: body.delivery.email,
          addressLine1: body.delivery.addressLine1,
          addressLine2: body.delivery.addressLine2,
          city: body.delivery.city,
          state: body.delivery.state,
          pincode: body.delivery.pincode,
          country: 'India',
          type: 'delivery'
        }
      });
      deliveryAddressId = deliveryAddress.id;
    }

    // Get courier partner info
    const courierPartner = await prisma.courierPartner.findFirst({
      where: { code: body.courierCode }
    });

    if (!courierPartner) {
      return NextResponse.json(
        { error: 'Courier partner not found in database' },
        { status: 404 }
      );
    }

    // Calculate volumetric weight if dimensions provided
    let volumetricWeight = 0;
    if (body.shipment.dimensions) {
      volumetricWeight = (body.shipment.dimensions.length * 
                         body.shipment.dimensions.width * 
                         body.shipment.dimensions.height) / 5000;
    }

    const chargeableWeight = Math.max(body.shipment.weight, volumetricWeight);

    // Get real-time quote for this specific booking
    const quotes = await service.calculateRate(
      body.pickup,
      body.delivery,
      body.shipment,
      body.serviceType
    );

    if (quotes.length === 0) {
      return NextResponse.json(
        { error: 'Unable to calculate shipping cost for this booking' },
        { status: 400 }
      );
    }

    const quote = quotes[0];

    // Create order in database first
    const order = await prisma.order.create({
      data: {
        userId: userId,
        courierPartnerId: courierPartner.id,
        pickupAddressId: pickupAddressId,
        deliveryAddressId: deliveryAddressId,
        totalAmount: quote.totalAmount,
        weight: body.shipment.weight,
        packageType: body.shipment.packageType,
        declaredValue: body.shipment.declaredValue,
        parcelContents: body.shipment.contents,
        dimensions: body.shipment.dimensions,
        deliveryInstructions: body.deliveryInstructions,
        estimatedDelivery: quote.estimatedDelivery,
        actualWeight: body.shipment.weight,
        volumetricWeight: volumetricWeight,
        chargedWeight: chargeableWeight,
        serviceType: body.serviceType,
        status: 'pending'
      }
    });

    try {
      // Book with actual courier service
      const booking = await manager.bookShipment(
        body.courierCode,
        body.pickup,
        body.delivery,
        body.shipment,
        body.serviceType,
        order.id
      );

      // Schedule pickup if requested
      if (body.schedulePickup && booking.courierOrderId) {
        const pickupDate = new Date(body.schedulePickup.date);
        // Set time based on time slot
        switch (body.schedulePickup.timeSlot) {
          case 'morning':
            pickupDate.setHours(10, 0, 0, 0);
            break;
          case 'afternoon':
            pickupDate.setHours(14, 0, 0, 0);
            break;
          case 'evening':
            pickupDate.setHours(17, 0, 0, 0);
            break;
        }

        await manager.schedulePickup(order.id, pickupDate);
      }

      // Create order log
      await prisma.orderLog.create({
        data: {
          orderId: order.id,
          status: 'booked',
          message: `Order booked with ${body.courierCode}`,
          createdBy: userId
        }
      });

      // Create initial tracking entry
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'booked',
          message: 'Order successfully booked with courier',
          courierStatus: 'BOOKED',
          description: `Shipment booked with ${quote.courierName}`,
          timestamp: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          trackingNumber: booking.courierTrackingId,
          courierOrderId: booking.courierOrderId,
          estimatedDelivery: booking.estimatedDelivery,
          totalAmount: quote.totalAmount,
          courierName: quote.courierName,
          serviceType: quote.serviceType.name,
          labelUrl: booking.labelUrl,
          manifestUrl: booking.manifestUrl
        },
        booking: {
          courierCode: body.courierCode,
          courierName: quote.courierName,
          serviceType: quote.serviceType,
          trackingId: booking.courierTrackingId,
          estimatedDelivery: booking.estimatedDelivery,
          transitTime: quote.transitTime,
          features: quote.features
        },
        nextSteps: [
          'Your shipment has been booked successfully',
          'You will receive tracking updates via SMS and email',
          'Prepare your package for pickup',
          booking.labelUrl ? 'Print the shipping label and attach to package' : null,
          body.schedulePickup ? `Pickup scheduled for ${body.schedulePickup.date}` : 'Schedule pickup when ready'
        ].filter(Boolean)
      });

    } catch (bookingError) {
      // If courier booking fails, update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'failed' }
      });

      console.error('Courier booking failed:', bookingError);
      throw bookingError;
    }

  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        return NextResponse.json(
          { error: 'Courier authentication failed' },
          { status: 502 }
        );
      }
      
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        message: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve booking details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const trackingId = searchParams.get('trackingId');

    if (!orderId && !trackingId) {
      return NextResponse.json(
        { error: 'Order ID or tracking ID is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};
    if (orderId) {
      whereClause.id = orderId;
    } else if (trackingId) {
      whereClause.courierTrackingId = trackingId;
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        courierPartner: true,
        pickupAddress: true,
        deliveryAddress: true,
        trackingUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        orderLogs: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get real-time tracking updates if courier tracking ID exists
    let liveTracking = null;
    if (order.courierTrackingId && order.courierPartner.code) {
      try {
        const manager = await getCourierManager();
        liveTracking = await manager.trackShipment(
          order.courierTrackingId, 
          order.courierPartner.code
        );
      } catch (error) {
        console.error('Error fetching live tracking:', error);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        trackingNumber: order.courierTrackingId,
        courierOrderId: order.courierOrderId,
        totalAmount: order.totalAmount,
        weight: order.weight,
        packageType: order.packageType,
        declaredValue: order.declaredValue,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        createdAt: order.createdAt,
        bookedAt: order.bookedAt,
        courier: {
          name: order.courierPartner.name,
          code: order.courierPartner.code
        },
        pickup: order.pickupAddress,
        delivery: order.deliveryAddress
      },
      tracking: {
        stored: order.trackingUpdates,
        live: liveTracking
      },
      logs: order.orderLogs
    });

  } catch (error) {
    console.error('Error retrieving booking:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve booking details' },
      { status: 500 }
    );
  }
}
