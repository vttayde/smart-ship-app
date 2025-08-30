import { CourierManager } from '@/services/courier/manager';
import { NextRequest, NextResponse } from 'next/server';

let courierManager: CourierManager | null = null;

// Initialize courier manager if not already done
async function getCourierManager(): Promise<CourierManager> {
  if (!courierManager) {
    courierManager = new CourierManager();
    await courierManager.initialize();
  }
  return courierManager;
}

interface QuoteRequest {
  pickup: {
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
  preferredServices?: string[]; // Optional filter for specific courier services
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();

    // Validate request data
    if (!body.pickup || !body.delivery || !body.shipment) {
      return NextResponse.json(
        { error: 'Missing required fields: pickup, delivery, shipment' },
        { status: 400 }
      );
    }

    // Validate pincodes
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(body.pickup.pincode) || !pincodeRegex.test(body.delivery.pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Validate weight and dimensions
    if (body.shipment.weight <= 0 || body.shipment.weight > 50) {
      return NextResponse.json({ error: 'Weight must be between 0.1 and 50 kg' }, { status: 400 });
    }

    if (body.shipment.declaredValue <= 0) {
      return NextResponse.json({ error: 'Declared value must be greater than 0' }, { status: 400 });
    }

    // Get courier manager
    const manager = await getCourierManager();

    // Check if any courier services are available
    const availableServices = manager.getAvailableServices();
    if (availableServices.length === 0) {
      return NextResponse.json(
        { error: 'No courier services available at the moment' },
        { status: 503 }
      );
    }

    // Get real-time quotes from all available courier services
    const quotes = await manager.getAllRates(body.pickup, body.delivery, body.shipment);

    // Filter by preferred services if specified
    const filteredQuotes = body.preferredServices
      ? quotes.filter(quote => body.preferredServices!.includes(quote.courierCode))
      : quotes;

    if (filteredQuotes.length === 0) {
      return NextResponse.json(
        {
          error: 'No quotes available for the specified route',
          availableServices,
          message:
            'This might be due to service unavailability in the delivery area or temporary API issues',
        },
        { status: 404 }
      );
    }

    // Add delivery time calculations
    const enhancedQuotes = filteredQuotes.map(quote => ({
      ...quote,
      deliveryDate: quote.estimatedDelivery.toISOString().split('T')[0],
      isRecommended: quote.totalAmount === Math.min(...filteredQuotes.map(q => q.totalAmount)),
      savingsFromHighest: Math.max(...filteredQuotes.map(q => q.totalAmount)) - quote.totalAmount,
      courierRating: 4.2, // This would come from database in real implementation
      trackingAvailable: true,
      insuranceIncluded: quote.serviceType.features.includes('Insurance'),
      codAvailable: quote.serviceType.features.includes('COD'),
    }));

    // Add quote metadata
    const response = {
      success: true,
      quotes: enhancedQuotes,
      metadata: {
        totalQuotes: enhancedQuotes.length,
        cheapestPrice: Math.min(...enhancedQuotes.map(q => q.totalAmount)),
        fastestDelivery: Math.min(...enhancedQuotes.map(q => q.serviceType.estimatedDays)),
        availableServices: availableServices,
        timestamp: new Date().toISOString(),
        route: {
          from: `${body.pickup.city}, ${body.pickup.state} - ${body.pickup.pincode}`,
          to: `${body.delivery.city}, ${body.delivery.state} - ${body.delivery.pincode}`,
          distance: 'N/A', // Could be calculated using maps API
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting quotes:', error);

    // Check if it's a courier service specific error
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable due to high demand. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to get shipping quotes',
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

// GET endpoint for service availability check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json({ error: 'Pincode parameter is required' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Get courier manager
    const manager = await getCourierManager();
    const availableServices = manager.getAvailableServices();

    // Check delivery availability for each service
    const serviceAvailability: { [key: string]: boolean } = {};

    for (const serviceCode of availableServices) {
      const service = manager.getService(serviceCode);
      if (service) {
        try {
          serviceAvailability[serviceCode] = await service.canDeliver(pincode);
        } catch (error) {
          console.error(`Error checking ${serviceCode} availability:`, error);
          serviceAvailability[serviceCode] = false;
        }
      }
    }

    const availableCount = Object.values(serviceAvailability).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      pincode,
      serviceAvailability,
      summary: {
        totalServices: availableServices.length,
        availableServices: availableCount,
        deliveryAvailable: availableCount > 0,
      },
    });
  } catch (error) {
    console.error('Error checking service availability:', error);
    return NextResponse.json({ error: 'Failed to check service availability' }, { status: 500 });
  }
}
