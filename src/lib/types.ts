// Manual type definitions for all models
export interface Address {
  id: string;
  userId: string;
  type: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  gstin?: string;
  passwordHash?: string;
  phoneVerified: boolean;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CourierPartner {
  id: string;
  name: string;
  apiEndpoint?: string;
  apiKey?: string;
  pricingModel?: Record<string, unknown>;
  coverageAreas: string[];
  isActive: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  courierPartnerId: string;
  pickupAddressId: string;
  deliveryAddressId: string;
  trackingNumber?: string;
  status: string;
  totalAmount: number;
  weight: number;
  packageType: string;
  declaredValue?: number;
  parcelContents?: string;
  dimensions?: Record<string, number>;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  deliveryInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  status: string;
  gateway: string;
  gatewayRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderTracking {
  id: string;
  orderId: string;
  status: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  timestamp: Date;
}

export interface OrderLog {
  id: string;
  orderId: string;
  status: string;
  message: string;
  createdBy?: string;
  timestamp: Date;
}

// Extended types for better TypeScript support
export interface UserWithAddresses extends User {
  addresses: Address[];
}

export interface OrderWithDetails extends Order {
  user: User;
  courierPartner: CourierPartner;
  pickupAddress: Address;
  deliveryAddress: Address;
  payments: Payment[];
  trackingUpdates: OrderTracking[];
}

export interface CourierServiceQuote {
  partnerId: string;
  partnerName: string;
  price: number;
  estimatedDays: string;
  rating: number;
  features: string[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface CreateUserData {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface CreateAddressData {
  type: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CreateOrderData {
  pickupAddressId: string;
  deliveryAddressId: string;
  courierPartnerId: string;
  weight: number;
  packageType: string;
  declaredValue?: number;
  parcelContents?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  deliveryInstructions?: string;
}
