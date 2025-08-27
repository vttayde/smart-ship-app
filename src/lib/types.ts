import { User, Address, Order, CourierPartner, Payment, OrderTracking, OrderLog } from '@prisma/client'

// Export Prisma types
export type {
  User,
  Address,
  Order,
  CourierPartner,
  Payment,
  OrderTracking,
  OrderLog
}

// Extended types for better TypeScript support
export interface UserWithAddresses extends User {
  addresses: Address[]
}

export interface OrderWithDetails extends Order {
  user: User
  courierPartner: CourierPartner
  pickupAddress: Address
  deliveryAddress: Address
  payments: Payment[]
  trackingUpdates: OrderTracking[]
}

export interface CourierServiceQuote {
  partnerId: string
  partnerName: string
  price: number
  estimatedDays: string
  rating: number
  features: string[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface CreateUserData {
  email: string
  phone?: string
  firstName: string
  lastName: string
  password: string
}

export interface CreateAddressData {
  type: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}

export interface CreateOrderData {
  pickupAddressId: string
  deliveryAddressId: string
  courierPartnerId: string
  weight: number
  packageType: string
  declaredValue?: number
  parcelContents?: string
  dimensions?: {
    length: number
    width: number
    height: number
  }
  deliveryInstructions?: string
}
