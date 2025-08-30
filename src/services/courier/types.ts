// Courier Service Types and Interfaces for Real API Integration

export interface CourierCredentials {
  apiKey?: string;
  apiSecret?: string;
  authToken?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
}

export interface ShipmentAddress {
  name: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface ShipmentDetails {
  weight: number; // in kg
  dimensions?: {
    length: number; // in cm
    width: number;
    height: number;
  };
  declaredValue: number;
  packageType: string; // document, package, fragile
  contents: string;
  codAmount?: number; // Cash on Delivery amount
}

export interface ServiceType {
  code: string;
  name: string;
  description: string;
  estimatedDays: number;
  isExpressDelivery: boolean;
  features: string[];
}

export interface RateQuote {
  courierCode: string;
  courierName: string;
  serviceType: ServiceType;
  totalAmount: number;
  baseAmount: number;
  fuelSurcharge?: number;
  gstAmount?: number;
  otherCharges?: number;
  estimatedDelivery: Date;
  transitTime: string; // "1-2 days"
  features: string[];
}

export interface ShipmentBooking {
  courierOrderId: string;
  courierTrackingId: string;
  airwayBill?: string;
  labelUrl?: string;
  manifestUrl?: string;
  estimatedDelivery: Date;
  totalAmount: number;
  rawResponse: any; // Full API response
}

export interface TrackingUpdate {
  status: string;
  statusCode: string;
  location?: string;
  timestamp: Date;
  description: string;
  expectedDelivery?: Date;
  courierStatus: string;
  rawData: any;
}

export interface CourierCapability {
  canDeliver: (pincode: string) => Promise<boolean>;
  getServiceTypes: () => Promise<ServiceType[]>;
  calculateRate: (
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails,
    serviceType?: string
  ) => Promise<RateQuote[]>;
  bookShipment: (
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails,
    serviceType: string,
    orderId: string
  ) => Promise<ShipmentBooking>;
  trackShipment: (trackingId: string) => Promise<TrackingUpdate[]>;
  cancelShipment: (courierOrderId: string) => Promise<boolean>;
  generateLabel: (courierOrderId: string) => Promise<string>; // Returns label URL
  schedulePickup: (courierOrderId: string, pickupDate: Date) => Promise<boolean>;
}

// Base CourierService interface that all courier integrations must implement
export abstract class CourierService implements CourierCapability {
  protected credentials: CourierCredentials;
  protected isProduction: boolean;
  protected courierCode: string;
  protected courierName: string;

  constructor(
    credentials: CourierCredentials,
    isProduction: boolean = false,
    courierCode: string,
    courierName: string
  ) {
    this.credentials = credentials;
    this.isProduction = isProduction;
    this.courierCode = courierCode;
    this.courierName = courierName;
  }

  // Abstract methods that must be implemented by each courier service
  abstract canDeliver(pincode: string): Promise<boolean>;
  abstract getServiceTypes(): Promise<ServiceType[]>;
  abstract calculateRate(
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails,
    serviceType?: string
  ): Promise<RateQuote[]>;
  abstract bookShipment(
    pickup: ShipmentAddress,
    delivery: ShipmentAddress,
    shipment: ShipmentDetails,
    serviceType: string,
    orderId: string
  ): Promise<ShipmentBooking>;
  abstract trackShipment(trackingId: string): Promise<TrackingUpdate[]>;
  abstract cancelShipment(courierOrderId: string): Promise<boolean>;
  abstract generateLabel(courierOrderId: string): Promise<string>;
  abstract schedulePickup(courierOrderId: string, pickupDate: Date): Promise<boolean>;

  // Common utility methods
  protected validatePincode(pincode: string): boolean {
    return /^\d{6}$/.test(pincode);
  }

  protected calculateVolumetricWeight(dimensions: {
    length: number;
    width: number;
    height: number;
  }): number {
    // Standard volumetric weight calculation: (L × W × H) / 5000
    return (dimensions.length * dimensions.width * dimensions.height) / 5000;
  }

  protected getChargeableWeight(actualWeight: number, volumetricWeight: number): number {
    return Math.max(actualWeight, volumetricWeight);
  }

  protected formatPhoneNumber(phone: string): string {
    // Remove all non-digits and ensure 10 digits
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? cleaned : cleaned.substring(cleaned.length - 10);
  }

  // Getter methods
  getCourierCode(): string {
    return this.courierCode;
  }

  getCourierName(): string {
    return this.courierName;
  }

  isProductionMode(): boolean {
    return this.isProduction;
  }
}

// Error classes for courier operations
export class CourierAPIError extends Error {
  constructor(
    message: string,
    public courierCode: string,
    public statusCode?: number,
    public rawResponse?: any
  ) {
    super(message);
    this.name = 'CourierAPIError';
  }
}

export class CourierServiceUnavailableError extends CourierAPIError {
  constructor(courierCode: string, message: string = 'Courier service is temporarily unavailable') {
    super(message, courierCode);
    this.name = 'CourierServiceUnavailableError';
  }
}

export class CourierRateLimitError extends CourierAPIError {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(courierCode: string, retryAfter?: number) {
    super('Rate limit exceeded', courierCode);
    this.name = 'CourierRateLimitError';
  }
}

export class CourierAuthenticationError extends CourierAPIError {
  constructor(courierCode: string) {
    super('Authentication failed with courier API', courierCode);
    this.name = 'CourierAuthenticationError';
  }
}
