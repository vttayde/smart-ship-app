import { prisma } from '@/lib/prisma';
import { DelhiveryService } from './delhivery';
import {
  CourierAPIError,
  CourierCredentials,
  CourierService,
  RateQuote,
  ShipmentAddress,
  ShipmentBooking,
  ShipmentDetails,
  TrackingUpdate,
} from './types';

export interface CourierManagerConfig {
  encryptionKey?: string; // For encrypting API credentials
}

export class CourierManager {
  private services: Map<string, CourierService> = new Map();
  private encryptionKey: string;

  constructor(config?: CourierManagerConfig) {
    this.encryptionKey = config?.encryptionKey || process.env.ENCRYPTION_KEY || 'default-key';
  }

  // Initialize all active courier services
  async initialize(): Promise<void> {
    try {
      const activeConfigs = await prisma.courierAPIConfig.findMany({
        where: { isActive: true },
      });

      for (const config of activeConfigs) {
        await this.initializeCourierService(config);
      }

      // console.log(`Initialized ${this.services.size} courier services`);
    } catch (error) {
      console.error('Error initializing courier services:', error);
      throw error;
    }
  }

  // Initialize a specific courier service
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async initializeCourierService(config: any): Promise<void> {
    try {
      const credentials: CourierCredentials = {
        apiKey: this.decryptValue(config.apiKey),
        apiSecret: this.decryptValue(config.apiSecret),
        authToken: this.decryptValue(config.authToken),
        clientId: config.clientId,
        clientSecret: this.decryptValue(config.clientSecret),
        baseUrl: config.apiUrl,
      };

      const isProduction = config.environment === 'production';

      let service: CourierService;

      switch (config.courierCode) {
        case 'delhivery':
          service = new DelhiveryService(credentials, isProduction);
          break;
        // Add other courier services here as they are implemented
        // case 'shiprocket':
        //   service = new ShiprocketService(credentials, isProduction);
        //   break;
        default:
          console.warn(`Unknown courier service: ${config.courierCode}`);
          return;
      }

      this.services.set(config.courierCode, service);
      // console.log(`Initialized ${config.courierName} service`);
    } catch (error) {
      console.error(`Error initializing ${config.courierCode} service:`, error);
    }
  }

  // Get all available rates from active courier services
  async getAllRates(
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails
  ): Promise<RateQuote[]> {
    const allRates: RateQuote[] = [];
    const promises: Promise<RateQuote[]>[] = [];

    // Check delivery availability and get rates from all services
    for (const [courierCode, service] of this.services) {
      promises.push(
        service.canDeliver(delivery.pincode).then(async canDeliver => {
          if (canDeliver) {
            try {
              return await service.calculateRate(pickup, delivery, shipment);
            } catch (error) {
              console.error(`Error getting rates from ${courierCode}:`, error);
              return [];
            }
          }
          return [];
        })
      );
    }

    const results = await Promise.all(promises);
    results.forEach(rates => allRates.push(...rates));

    // Sort by total amount (cheapest first)
    return allRates.sort((a, b) => a.totalAmount - b.totalAmount);
  }

  // Book shipment with a specific courier
  async bookShipment(
    courierCode: string,
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails,
    serviceType: string,
    orderId: string
  ): Promise<ShipmentBooking> {
    const service = this.services.get(courierCode);
    if (!service) {
      throw new CourierAPIError(`Courier service ${courierCode} not available`, courierCode);
    }

    try {
      const booking = await service.bookShipment(pickup, delivery, shipment, serviceType, orderId);

      // Update order in database with courier details
      await prisma.order.update({
        where: { id: orderId },
        data: {
          courierOrderId: booking.courierOrderId,
          courierTrackingId: booking.courierTrackingId,
          courierStatus: 'booked',
          courierResponse: booking.rawResponse
            ? JSON.parse(JSON.stringify(booking.rawResponse))
            : null,
          bookedAt: new Date(),
          estimatedDelivery: booking.estimatedDelivery,
          status: 'confirmed',
        },
      });

      return booking;
    } catch (error) {
      console.error(`Error booking shipment with ${courierCode}:`, error);
      throw error;
    }
  }

  // Track shipment across all courier services
  async trackShipment(trackingId: string, courierCode?: string): Promise<TrackingUpdate[]> {
    if (courierCode) {
      const service = this.services.get(courierCode);
      if (!service) {
        throw new CourierAPIError(`Courier service ${courierCode} not available`, courierCode);
      }
      return await service.trackShipment(trackingId);
    }

    // Try all services if courierCode not specified
    for (const [code, service] of this.services) {
      try {
        const updates = await service.trackShipment(trackingId);
        if (updates.length > 0) {
          return updates;
        }
      } catch (error) {
        console.error(`Error tracking with ${code}:`, error);
        // Continue with next service
      }
    }

    return [];
  }

  // Update tracking information in database
  async updateTrackingInfo(orderId: string): Promise<void> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { courierPartner: true },
      });

      if (!order || !order.courierTrackingId) {
        return;
      }

      const courierCode = order.courierPartner.code;
      const updates = await this.trackShipment(order.courierTrackingId, courierCode);

      if (updates.length > 0) {
        const latestUpdate = updates[0];

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: latestUpdate.status,
            courierStatus: latestUpdate.courierStatus,
            estimatedDelivery: latestUpdate.expectedDelivery || order.estimatedDelivery,
            deliveredAt: latestUpdate.status === 'delivered' ? latestUpdate.timestamp : null,
          },
        });

        // Insert new tracking updates
        for (const update of updates) {
          await prisma.orderTracking.upsert({
            where: {
              orderId_timestamp: {
                orderId: orderId,
                timestamp: update.timestamp,
              },
            },
            create: {
              orderId: orderId,
              status: update.status,
              location: update.location,
              message: update.description,
              timestamp: update.timestamp,
              courierStatus: update.courierStatus,
              courierLocation: update.location,
              courierData: update.rawData ? JSON.parse(JSON.stringify(update.rawData)) : null,
              description: update.description,
              expectedDelivery: update.expectedDelivery,
            },
            update: {
              status: update.status,
              location: update.location,
              message: update.description,
              courierStatus: update.courierStatus,
              courierLocation: update.location,
              courierData: update.rawData ? JSON.parse(JSON.stringify(update.rawData)) : null,
              description: update.description,
              expectedDelivery: update.expectedDelivery,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Error updating tracking info for order ${orderId}:`, error);
    }
  }

  // Cancel shipment with courier
  async cancelShipment(orderId: string): Promise<boolean> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { courierPartner: true },
      });

      if (!order || !order.courierOrderId) {
        return false;
      }

      const service = this.services.get(order.courierPartner.code);
      if (!service) {
        return false;
      }

      const cancelled = await service.cancelShipment(order.courierOrderId);

      if (cancelled) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'cancelled',
            courierStatus: 'cancelled',
          },
        });
      }

      return cancelled;
    } catch (error) {
      console.error(`Error cancelling shipment for order ${orderId}:`, error);
      return false;
    }
  }

  // Generate shipping label
  async generateLabel(orderId: string): Promise<string> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { courierPartner: true },
      });

      if (!order || !order.courierOrderId) {
        throw new Error('Order not found or not booked with courier');
      }

      const service = this.services.get(order.courierPartner.code);
      if (!service) {
        throw new Error(`Courier service not available: ${order.courierPartner.code}`);
      }

      return await service.generateLabel(order.courierOrderId);
    } catch (error) {
      console.error(`Error generating label for order ${orderId}:`, error);
      throw error;
    }
  }

  // Schedule pickup
  async schedulePickup(orderId: string, pickupDate: Date): Promise<boolean> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { courierPartner: true },
      });

      if (!order || !order.courierOrderId) {
        return false;
      }

      const service = this.services.get(order.courierPartner.code);
      if (!service) {
        return false;
      }

      const scheduled = await service.schedulePickup(order.courierOrderId, pickupDate);

      if (scheduled) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'pickup_scheduled',
            dispatchedAt: pickupDate,
          },
        });
      }

      return scheduled;
    } catch (error) {
      console.error(`Error scheduling pickup for order ${orderId}:`, error);
      return false;
    }
  }

  // Utility methods
  private encryptValue(value: string): string {
    // Simple encryption - in production, use proper encryption library
    return Buffer.from(value).toString('base64');
  }

  private decryptValue(encryptedValue: string): string {
    // Simple decryption - in production, use proper decryption library
    if (!encryptedValue) return '';
    try {
      return Buffer.from(encryptedValue, 'base64').toString('utf-8');
    } catch {
      return encryptedValue; // Return as-is if not encrypted
    }
  }

  // Get available courier services
  getAvailableServices(): string[] {
    return Array.from(this.services.keys());
  }

  // Check if courier service is available
  isServiceAvailable(courierCode: string): boolean {
    return this.services.has(courierCode);
  }

  // Get service instance
  getService(courierCode: string): CourierService | undefined {
    return this.services.get(courierCode);
  }
}
