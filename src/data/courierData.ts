// Comprehensive courier service data models and pricing logic

export interface ServiceZone {
  id: string
  name: string
  states: string[]
  cities: string[]
  isMetro?: boolean
  isPriority?: boolean
}

export interface CourierService {
  id: string
  name: string
  displayName: string
  logo: string
  description: string
  website: string
  isActive: boolean
  rating: number
  totalReviews: number
  establishedYear: number
  headquarters: string
  coverage: {
    states: number
    cities: number
    pincodes: number
  }
  specialties: string[]
  certifications: string[]
}

export interface ServiceType {
  id: string
  name: string
  displayName: string
  description: string
  maxWeight: number // in kg
  maxDimensions: {
    length: number
    width: number
    height: number
  }
  features: string[]
  isActive: boolean
}

export interface PricingRule {
  id: string
  courierId: string
  serviceTypeId: string
  zoneType: 'within_city' | 'within_state' | 'metro_to_metro' | 'metro_to_non_metro' | 'non_metro_to_metro' | 'non_metro_to_non_metro'
  weightSlabs: WeightSlab[]
  additionalCharges: AdditionalCharge[]
  discounts: Discount[]
  isActive: boolean
}

export interface WeightSlab {
  minWeight: number // in kg
  maxWeight: number // in kg
  basePrice: number // in INR
  additionalWeightPrice: number // per kg
  fuelSurcharge: number // percentage
}

export interface AdditionalCharge {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'per_kg'
  value: number
  description: string
  applicableConditions?: {
    minValue?: number
    maxValue?: number
    serviceTypes?: string[]
    zones?: string[]
  }
}

export interface Discount {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  description: string
  conditions: {
    minWeight?: number
    minValue?: number
    newCustomer?: boolean
    bulkShipment?: boolean
    validUntil?: string
  }
}

export interface DeliveryTimeframe {
  courierId: string
  serviceTypeId: string
  fromZone: string
  toZone: string
  minDays: number
  maxDays: number
  workingDaysOnly: boolean
  cutoffTime: string // in HH:MM format
}

export interface CourierQuote {
  id: string
  courierService: CourierService
  serviceType: ServiceType
  pricing: {
    basePrice: number
    additionalCharges: {
      name: string
      amount: number
      type: string
    }[]
    discounts: {
      name: string
      amount: number
      type: string
    }[]
    taxes: {
      name: string
      amount: number
      percentage: number
    }[]
    totalPrice: number
    currency: string
  }
  delivery: {
    estimatedDays: number
    minDays: number
    maxDays: number
    cutoffTime: string
    workingDaysOnly: boolean
  }
  features: string[]
  terms: string[]
  isRecommended: boolean
  confidence: number // 0-100
  lastUpdated: string
}

// Indian geographical zones for pricing
export const DELIVERY_ZONES: ServiceZone[] = [
  {
    id: 'metro_tier1',
    name: 'Metro Tier 1',
    states: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat'],
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'],
    isMetro: true,
    isPriority: true
  },
  {
    id: 'metro_tier2',
    name: 'Metro Tier 2',
    states: ['Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Haryana', 'Punjab'],
    cities: ['Lucknow', 'Jaipur', 'Indore', 'Gurgaon', 'Chandigarh', 'Ludhiana', 'Kanpur', 'Agra'],
    isMetro: false,
    isPriority: true
  },
  {
    id: 'tier3_cities',
    name: 'Tier 3 Cities',
    states: ['Bihar', 'Jharkhand', 'Odisha', 'Assam', 'Kerala', 'Uttarakhand'],
    cities: ['Patna', 'Ranchi', 'Bhubaneswar', 'Guwahati', 'Kochi', 'Dehradun'],
    isMetro: false,
    isPriority: false
  },
  {
    id: 'remote_areas',
    name: 'Remote Areas',
    states: ['Himachal Pradesh', 'Jammu and Kashmir', 'Manipur', 'Tripura', 'Sikkim'],
    cities: ['Shimla', 'Srinagar', 'Imphal', 'Agartala', 'Gangtok'],
    isMetro: false,
    isPriority: false
  }
]

// Courier services database
export const COURIER_SERVICES: CourierService[] = [
  {
    id: 'delhivery',
    name: 'delhivery',
    displayName: 'Delhivery',
    logo: '🚚',
    description: 'India\'s largest and fastest-growing supply chain services company',
    website: 'https://www.delhivery.com',
    isActive: true,
    rating: 4.3,
    totalReviews: 125430,
    establishedYear: 2011,
    headquarters: 'Gurgaon, India',
    coverage: {
      states: 29,
      cities: 2300,
      pincodes: 17500
    },
    specialties: ['E-commerce logistics', 'B2B shipments', 'Reverse logistics', 'Warehousing'],
    certifications: ['ISO 9001:2015', 'ISO 27001:2013']
  },
  {
    id: 'shadowfax',
    name: 'shadowfax',
    displayName: 'Shadowfax',
    logo: '⚡',
    description: 'Hyperlocal logistics platform for fast and reliable deliveries',
    website: 'https://www.shadowfax.in',
    isActive: true,
    rating: 4.5,
    totalReviews: 89200,
    establishedYear: 2015,
    headquarters: 'Bangalore, India',
    coverage: {
      states: 28,
      cities: 1800,
      pincodes: 12000
    },
    specialties: ['Hyperlocal delivery', 'Same-day delivery', 'Food delivery', 'Medicine delivery'],
    certifications: ['ISO 9001:2015', 'GDPR Compliant']
  },
  {
    id: 'ekart',
    name: 'ekart',
    displayName: 'Ekart Logistics',
    logo: '📦',
    description: 'Flipkart\'s logistics arm offering reliable delivery solutions',
    website: 'https://ekartlogistics.com',
    isActive: true,
    rating: 4.1,
    totalReviews: 156780,
    establishedYear: 2009,
    headquarters: 'Bangalore, India',
    coverage: {
      states: 29,
      cities: 2800,
      pincodes: 19000
    },
    specialties: ['E-commerce fulfillment', 'COD services', 'Return management', 'Large appliances'],
    certifications: ['ISO 9001:2015', 'ISO 14001:2015']
  },
  {
    id: 'bluedart',
    name: 'bluedart',
    displayName: 'Blue Dart Express',
    logo: '🌟',
    description: 'Premium express logistics and supply chain solutions',
    website: 'https://www.bluedart.com',
    isActive: true,
    rating: 4.6,
    totalReviews: 78900,
    establishedYear: 1983,
    headquarters: 'Mumbai, India',
    coverage: {
      states: 29,
      cities: 1200,
      pincodes: 15000
    },
    specialties: ['Express delivery', 'International shipping', 'Time-definite delivery', 'Premium services'],
    certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'IATA certified']
  },
  {
    id: 'dtdc',
    name: 'dtdc',
    displayName: 'DTDC Express',
    logo: '🏃‍♂️',
    description: 'Comprehensive logistics and courier solutions across India',
    website: 'https://www.dtdc.in',
    isActive: true,
    rating: 4.0,
    totalReviews: 94300,
    establishedYear: 1990,
    headquarters: 'Bangalore, India',
    coverage: {
      states: 29,
      cities: 2400,
      pincodes: 18500
    },
    specialties: ['Document delivery', 'Parcel services', 'Franchise model', 'Rural delivery'],
    certifications: ['ISO 9001:2015']
  }
]

// Service types available
export const SERVICE_TYPES: ServiceType[] = [
  {
    id: 'surface',
    name: 'surface',
    displayName: 'Surface / Standard',
    description: 'Cost-effective delivery for non-urgent shipments',
    maxWeight: 50,
    maxDimensions: {
      length: 100,
      width: 100,
      height: 100
    },
    features: [
      'Cost-effective',
      'Reliable tracking',
      'Insurance included',
      'Suitable for bulk shipments'
    ],
    isActive: true
  },
  {
    id: 'express',
    name: 'express',
    displayName: 'Express',
    description: 'Faster delivery for time-sensitive shipments',
    maxWeight: 30,
    maxDimensions: {
      length: 80,
      width: 80,
      height: 80
    },
    features: [
      'Faster delivery',
      'Priority handling',
      'Real-time tracking',
      'SMS notifications'
    ],
    isActive: true
  },
  {
    id: 'overnight',
    name: 'overnight',
    displayName: 'Overnight / Same Day',
    description: 'Fastest delivery for urgent shipments',
    maxWeight: 20,
    maxDimensions: {
      length: 60,
      width: 60,
      height: 60
    },
    features: [
      'Same day delivery',
      'Dedicated vehicle',
      'Live tracking',
      'Premium support'
    ],
    isActive: true
  }
]

// Enhanced pricing rules with realistic Indian courier rates
export const PRICING_RULES: PricingRule[] = [
  // Delhivery pricing
  {
    id: 'delhivery_surface_metro',
    courierId: 'delhivery',
    serviceTypeId: 'surface',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 35, additionalWeightPrice: 12, fuelSurcharge: 15 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 45, additionalWeightPrice: 15, fuelSurcharge: 15 },
      { minWeight: 1, maxWeight: 5, basePrice: 65, additionalWeightPrice: 18, fuelSurcharge: 15 },
      { minWeight: 5, maxWeight: 10, basePrice: 95, additionalWeightPrice: 22, fuelSurcharge: 15 },
      { minWeight: 10, maxWeight: 50, basePrice: 145, additionalWeightPrice: 25, fuelSurcharge: 15 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 15, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [
      { 
        id: 'bulk', 
        name: 'Bulk Discount', 
        type: 'percentage', 
        value: 10, 
        description: 'Volume discount for multiple shipments',
        conditions: { minWeight: 10 }
      }
    ],
    isActive: true
  },
  {
    id: 'delhivery_express_metro',
    courierId: 'delhivery',
    serviceTypeId: 'express',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 55, additionalWeightPrice: 18, fuelSurcharge: 15 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 72, additionalWeightPrice: 22, fuelSurcharge: 15 },
      { minWeight: 1, maxWeight: 5, basePrice: 98, additionalWeightPrice: 25, fuelSurcharge: 15 },
      { minWeight: 5, maxWeight: 10, basePrice: 145, additionalWeightPrice: 32, fuelSurcharge: 15 },
      { minWeight: 10, maxWeight: 30, basePrice: 210, additionalWeightPrice: 38, fuelSurcharge: 15 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 15, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [],
    isActive: true
  },
  {
    id: 'delhivery_overnight_metro',
    courierId: 'delhivery',
    serviceTypeId: 'overnight',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 85, additionalWeightPrice: 30, fuelSurcharge: 15 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 115, additionalWeightPrice: 35, fuelSurcharge: 15 },
      { minWeight: 1, maxWeight: 5, basePrice: 165, additionalWeightPrice: 42, fuelSurcharge: 15 },
      { minWeight: 5, maxWeight: 10, basePrice: 235, additionalWeightPrice: 52, fuelSurcharge: 15 },
      { minWeight: 10, maxWeight: 20, basePrice: 335, additionalWeightPrice: 65, fuelSurcharge: 15 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 15, description: 'Fuel price fluctuation adjustment' },
      { id: 'priority', name: 'Priority Handling', type: 'fixed', value: 30, description: 'Priority processing fee' }
    ],
    discounts: [],
    isActive: true
  },

  // Shadowfax pricing rules
  {
    id: 'shadowfax_surface_metro',
    courierId: 'shadowfax',
    serviceTypeId: 'surface',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 32, additionalWeightPrice: 11, fuelSurcharge: 12 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 42, additionalWeightPrice: 14, fuelSurcharge: 12 },
      { minWeight: 1, maxWeight: 5, basePrice: 58, additionalWeightPrice: 16, fuelSurcharge: 12 },
      { minWeight: 5, maxWeight: 10, basePrice: 85, additionalWeightPrice: 20, fuelSurcharge: 12 },
      { minWeight: 10, maxWeight: 50, basePrice: 125, additionalWeightPrice: 23, fuelSurcharge: 12 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 1.5, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 12, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [
      { 
        id: 'same_day', 
        name: 'Same Day Discount', 
        type: 'percentage', 
        value: 5, 
        description: 'Discount for same-day delivery bookings',
        conditions: { }
      }
    ],
    isActive: true
  },
  {
    id: 'shadowfax_express_metro',
    courierId: 'shadowfax',
    serviceTypeId: 'express',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 45, additionalWeightPrice: 15, fuelSurcharge: 12 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 58, additionalWeightPrice: 18, fuelSurcharge: 12 },
      { minWeight: 1, maxWeight: 5, basePrice: 78, additionalWeightPrice: 22, fuelSurcharge: 12 },
      { minWeight: 5, maxWeight: 10, basePrice: 115, additionalWeightPrice: 28, fuelSurcharge: 12 },
      { minWeight: 10, maxWeight: 30, basePrice: 165, additionalWeightPrice: 32, fuelSurcharge: 12 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 1.5, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 12, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [],
    isActive: true
  },
  {
    id: 'shadowfax_overnight_metro',
    courierId: 'shadowfax',
    serviceTypeId: 'overnight',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 75, additionalWeightPrice: 25, fuelSurcharge: 12 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 95, additionalWeightPrice: 30, fuelSurcharge: 12 },
      { minWeight: 1, maxWeight: 5, basePrice: 135, additionalWeightPrice: 35, fuelSurcharge: 12 },
      { minWeight: 5, maxWeight: 10, basePrice: 195, additionalWeightPrice: 45, fuelSurcharge: 12 },
      { minWeight: 10, maxWeight: 20, basePrice: 275, additionalWeightPrice: 55, fuelSurcharge: 12 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 1.5, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 12, description: 'Fuel price fluctuation adjustment' },
      { id: 'priority', name: 'Priority Handling', type: 'fixed', value: 25, description: 'Priority processing fee' }
    ],
    discounts: [],
    isActive: true
  },

  // Ekart pricing rules
  {
    id: 'ekart_surface_metro',
    courierId: 'ekart',
    serviceTypeId: 'surface',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 38, additionalWeightPrice: 13, fuelSurcharge: 18 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 48, additionalWeightPrice: 16, fuelSurcharge: 18 },
      { minWeight: 1, maxWeight: 5, basePrice: 68, additionalWeightPrice: 19, fuelSurcharge: 18 },
      { minWeight: 5, maxWeight: 10, basePrice: 98, additionalWeightPrice: 24, fuelSurcharge: 18 },
      { minWeight: 10, maxWeight: 50, basePrice: 148, additionalWeightPrice: 27, fuelSurcharge: 18 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2.5, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 18, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [
      { 
        id: 'flipkart_seller', 
        name: 'Flipkart Seller Discount', 
        type: 'percentage', 
        value: 15, 
        description: 'Special discount for Flipkart sellers',
        conditions: { minWeight: 5 }
      }
    ],
    isActive: true
  },
  {
    id: 'ekart_express_metro',
    courierId: 'ekart',
    serviceTypeId: 'express',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 58, additionalWeightPrice: 20, fuelSurcharge: 18 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 75, additionalWeightPrice: 24, fuelSurcharge: 18 },
      { minWeight: 1, maxWeight: 5, basePrice: 105, additionalWeightPrice: 28, fuelSurcharge: 18 },
      { minWeight: 5, maxWeight: 10, basePrice: 155, additionalWeightPrice: 35, fuelSurcharge: 18 },
      { minWeight: 10, maxWeight: 30, basePrice: 225, additionalWeightPrice: 42, fuelSurcharge: 18 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2.5, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 18, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [],
    isActive: true
  },

  // Blue Dart pricing rules
  {
    id: 'bluedart_surface_metro',
    courierId: 'bluedart',
    serviceTypeId: 'surface',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 45, additionalWeightPrice: 18, fuelSurcharge: 20 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 62, additionalWeightPrice: 22, fuelSurcharge: 20 },
      { minWeight: 1, maxWeight: 5, basePrice: 95, additionalWeightPrice: 28, fuelSurcharge: 20 },
      { minWeight: 5, maxWeight: 10, basePrice: 145, additionalWeightPrice: 35, fuelSurcharge: 20 },
      { minWeight: 10, maxWeight: 50, basePrice: 225, additionalWeightPrice: 42, fuelSurcharge: 20 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 20, description: 'Fuel price fluctuation adjustment' },
      { id: 'premium', name: 'Premium Service', type: 'fixed', value: 15, description: 'Premium handling and tracking' }
    ],
    discounts: [
      { 
        id: 'corporate', 
        name: 'Corporate Account Discount', 
        type: 'percentage', 
        value: 12, 
        description: 'Discount for corporate customers',
        conditions: { minValue: 1000 }
      }
    ],
    isActive: true
  },
  {
    id: 'bluedart_express_metro',
    courierId: 'bluedart',
    serviceTypeId: 'express',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 65, additionalWeightPrice: 25, fuelSurcharge: 20 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 85, additionalWeightPrice: 32, fuelSurcharge: 20 },
      { minWeight: 1, maxWeight: 5, basePrice: 125, additionalWeightPrice: 38, fuelSurcharge: 20 },
      { minWeight: 5, maxWeight: 10, basePrice: 195, additionalWeightPrice: 48, fuelSurcharge: 20 },
      { minWeight: 10, maxWeight: 30, basePrice: 295, additionalWeightPrice: 58, fuelSurcharge: 20 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 20, description: 'Fuel price fluctuation adjustment' },
      { id: 'premium', name: 'Premium Service', type: 'fixed', value: 25, description: 'Premium handling and tracking' }
    ],
    discounts: [],
    isActive: true
  },
  {
    id: 'bluedart_overnight_metro',
    courierId: 'bluedart',
    serviceTypeId: 'overnight',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 95, additionalWeightPrice: 35, fuelSurcharge: 20 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 125, additionalWeightPrice: 42, fuelSurcharge: 20 },
      { minWeight: 1, maxWeight: 5, basePrice: 185, additionalWeightPrice: 52, fuelSurcharge: 20 },
      { minWeight: 5, maxWeight: 10, basePrice: 275, additionalWeightPrice: 65, fuelSurcharge: 20 },
      { minWeight: 10, maxWeight: 20, basePrice: 395, additionalWeightPrice: 78, fuelSurcharge: 20 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 20, description: 'Fuel price fluctuation adjustment' },
      { id: 'premium', name: 'Premium Service', type: 'fixed', value: 35, description: 'Premium handling and tracking' }
    ],
    discounts: [],
    isActive: true
  },

  // DTDC pricing rules
  {
    id: 'dtdc_surface_metro',
    courierId: 'dtdc',
    serviceTypeId: 'surface',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 30, additionalWeightPrice: 10, fuelSurcharge: 14 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 40, additionalWeightPrice: 13, fuelSurcharge: 14 },
      { minWeight: 1, maxWeight: 5, basePrice: 55, additionalWeightPrice: 15, fuelSurcharge: 14 },
      { minWeight: 5, maxWeight: 10, basePrice: 80, additionalWeightPrice: 18, fuelSurcharge: 14 },
      { minWeight: 10, maxWeight: 50, basePrice: 120, additionalWeightPrice: 21, fuelSurcharge: 14 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 14, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [
      { 
        id: 'franchise_discount', 
        name: 'Franchise Partner Discount', 
        type: 'percentage', 
        value: 8, 
        description: 'Discount through franchise network',
        conditions: { minWeight: 2 }
      }
    ],
    isActive: true
  },
  {
    id: 'dtdc_express_metro',
    courierId: 'dtdc',
    serviceTypeId: 'express',
    zoneType: 'metro_to_metro',
    weightSlabs: [
      { minWeight: 0, maxWeight: 0.5, basePrice: 48, additionalWeightPrice: 16, fuelSurcharge: 14 },
      { minWeight: 0.5, maxWeight: 1, basePrice: 62, additionalWeightPrice: 20, fuelSurcharge: 14 },
      { minWeight: 1, maxWeight: 5, basePrice: 85, additionalWeightPrice: 24, fuelSurcharge: 14 },
      { minWeight: 5, maxWeight: 10, basePrice: 125, additionalWeightPrice: 30, fuelSurcharge: 14 },
      { minWeight: 10, maxWeight: 30, basePrice: 185, additionalWeightPrice: 36, fuelSurcharge: 14 }
    ],
    additionalCharges: [
      { id: 'cod', name: 'COD Charges', type: 'percentage', value: 2, description: 'Cash on Delivery charges' },
      { id: 'fuel', name: 'Fuel Surcharge', type: 'percentage', value: 14, description: 'Fuel price fluctuation adjustment' }
    ],
    discounts: [],
    isActive: true
  }
]

// Delivery timeframes
export const DELIVERY_TIMEFRAMES: DeliveryTimeframe[] = [
  // Delhivery timeframes
  { courierId: 'delhivery', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 2, maxDays: 4, workingDaysOnly: true, cutoffTime: '17:00' },
  { courierId: 'delhivery', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 2, workingDaysOnly: true, cutoffTime: '15:00' },
  { courierId: 'delhivery', serviceTypeId: 'overnight', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 1, workingDaysOnly: false, cutoffTime: '12:00' },
  { courierId: 'delhivery', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 3, maxDays: 5, workingDaysOnly: true, cutoffTime: '17:00' },
  { courierId: 'delhivery', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'remote_areas', minDays: 5, maxDays: 8, workingDaysOnly: true, cutoffTime: '17:00' },
  
  // Shadowfax timeframes
  { courierId: 'shadowfax', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 3, workingDaysOnly: true, cutoffTime: '18:00' },
  { courierId: 'shadowfax', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 1, workingDaysOnly: false, cutoffTime: '16:00' },
  { courierId: 'shadowfax', serviceTypeId: 'overnight', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 0, workingDaysOnly: false, cutoffTime: '14:00' },
  { courierId: 'shadowfax', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 2, maxDays: 4, workingDaysOnly: true, cutoffTime: '18:00' },
  
  // Ekart timeframes
  { courierId: 'ekart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 2, maxDays: 4, workingDaysOnly: true, cutoffTime: '17:30' },
  { courierId: 'ekart', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 2, workingDaysOnly: true, cutoffTime: '15:30' },
  { courierId: 'ekart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 3, maxDays: 6, workingDaysOnly: true, cutoffTime: '17:30' },
  
  // Blue Dart timeframes
  { courierId: 'bluedart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 3, workingDaysOnly: true, cutoffTime: '16:30' },
  { courierId: 'bluedart', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 1, workingDaysOnly: true, cutoffTime: '14:30' },
  { courierId: 'bluedart', serviceTypeId: 'overnight', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 1, workingDaysOnly: false, cutoffTime: '13:00' },
  { courierId: 'bluedart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 2, maxDays: 4, workingDaysOnly: true, cutoffTime: '16:30' },
  { courierId: 'bluedart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'remote_areas', minDays: 4, maxDays: 7, workingDaysOnly: true, cutoffTime: '16:30' },
  
  // DTDC timeframes
  { courierId: 'dtdc', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 2, maxDays: 5, workingDaysOnly: true, cutoffTime: '17:00' },
  { courierId: 'dtdc', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 3, workingDaysOnly: true, cutoffTime: '15:00' },
  { courierId: 'dtdc', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 3, maxDays: 6, workingDaysOnly: true, cutoffTime: '17:00' },
  { courierId: 'dtdc', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'remote_areas', minDays: 4, maxDays: 8, workingDaysOnly: true, cutoffTime: '17:00' }
]

const courierData = {
  DELIVERY_ZONES,
  COURIER_SERVICES,
  SERVICE_TYPES,
  PRICING_RULES,
  DELIVERY_TIMEFRAMES
}

export default courierData
