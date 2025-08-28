// Enhanced mock data with more realistic pricing and comprehensive courier information

import type { PricingRule, DeliveryTimeframe } from './courierData'

// Additional comprehensive pricing rules for all courier-service combinations
export const ADDITIONAL_PRICING_RULES: PricingRule[] = [
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
  }
]

// Additional delivery timeframes for comprehensive coverage
export const ADDITIONAL_DELIVERY_TIMEFRAMES: DeliveryTimeframe[] = [
  // Shadowfax timeframes
  { courierId: 'shadowfax', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 3, workingDaysOnly: true, cutoffTime: '18:00' },
  { courierId: 'shadowfax', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 1, workingDaysOnly: false, cutoffTime: '16:00' },
  { courierId: 'shadowfax', serviceTypeId: 'overnight', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 0, workingDaysOnly: false, cutoffTime: '14:00' },
  
  // Ekart timeframes
  { courierId: 'ekart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 2, maxDays: 4, workingDaysOnly: true, cutoffTime: '17:30' },
  { courierId: 'ekart', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 2, workingDaysOnly: true, cutoffTime: '15:30' },
  
  // Blue Dart timeframes
  { courierId: 'bluedart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 3, workingDaysOnly: true, cutoffTime: '16:30' },
  { courierId: 'bluedart', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 1, workingDaysOnly: true, cutoffTime: '14:30' },
  { courierId: 'bluedart', serviceTypeId: 'overnight', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 0, maxDays: 1, workingDaysOnly: false, cutoffTime: '13:00' },
  
  // DTDC timeframes
  { courierId: 'dtdc', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 2, maxDays: 5, workingDaysOnly: true, cutoffTime: '17:00' },
  { courierId: 'dtdc', serviceTypeId: 'express', fromZone: 'metro_tier1', toZone: 'metro_tier1', minDays: 1, maxDays: 3, workingDaysOnly: true, cutoffTime: '15:00' },

  // Inter-zone timeframes for metro to non-metro
  { courierId: 'delhivery', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 3, maxDays: 5, workingDaysOnly: true, cutoffTime: '17:00' },
  { courierId: 'shadowfax', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 2, maxDays: 4, workingDaysOnly: true, cutoffTime: '18:00' },
  { courierId: 'ekart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 3, maxDays: 6, workingDaysOnly: true, cutoffTime: '17:30' },
  { courierId: 'bluedart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 2, maxDays: 4, workingDaysOnly: true, cutoffTime: '16:30' },
  { courierId: 'dtdc', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'metro_tier2', minDays: 3, maxDays: 6, workingDaysOnly: true, cutoffTime: '17:00' },

  // Remote area deliveries
  { courierId: 'delhivery', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'remote_areas', minDays: 5, maxDays: 8, workingDaysOnly: true, cutoffTime: '17:00' },
  { courierId: 'bluedart', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'remote_areas', minDays: 4, maxDays: 7, workingDaysOnly: true, cutoffTime: '16:30' },
  { courierId: 'dtdc', serviceTypeId: 'surface', fromZone: 'metro_tier1', toZone: 'remote_areas', minDays: 4, maxDays: 8, workingDaysOnly: true, cutoffTime: '17:00' }
]

// Sample shipping scenarios for testing
export const SAMPLE_SHIPPING_REQUESTS = [
  {
    id: 'sample_1',
    name: 'Mumbai to Delhi - Light Package',
    request: {
      fromCity: 'Mumbai',
      fromState: 'Maharashtra',
      fromPincode: '400001',
      toCity: 'Delhi',
      toState: 'Delhi',
      toPincode: '110001',
      weight: 0.5,
      dimensions: { length: 20, width: 15, height: 10 },
      declaredValue: 2000,
      isFragile: false,
      requiresCOD: false,
      deliveryType: 'standard' as const,
      packageType: 'parcel' as const
    }
  },
  {
    id: 'sample_2',
    name: 'Bangalore to Chennai - Express Documents',
    request: {
      fromCity: 'Bangalore',
      fromState: 'Karnataka',
      fromPincode: '560001',
      toCity: 'Chennai',
      toState: 'Tamil Nadu',
      toPincode: '600001',
      weight: 0.2,
      dimensions: { length: 30, width: 25, height: 5 },
      declaredValue: 500,
      isFragile: false,
      requiresCOD: false,
      deliveryType: 'express' as const,
      packageType: 'documents' as const
    }
  },
  {
    id: 'sample_3',
    name: 'Delhi to Mumbai - Heavy COD Package',
    request: {
      fromCity: 'Delhi',
      fromState: 'Delhi',
      fromPincode: '110001',
      toCity: 'Mumbai',
      toState: 'Maharashtra',
      toPincode: '400001',
      weight: 5.5,
      dimensions: { length: 50, width: 40, height: 30 },
      declaredValue: 15000,
      isFragile: true,
      requiresCOD: true,
      deliveryType: 'standard' as const,
      packageType: 'fragile' as const
    }
  },
  {
    id: 'sample_4',
    name: 'Pune to Hyderabad - Overnight Delivery',
    request: {
      fromCity: 'Pune',
      fromState: 'Maharashtra',
      fromPincode: '411001',
      toCity: 'Hyderabad',
      toState: 'Telangana',
      toPincode: '500001',
      weight: 1.2,
      dimensions: { length: 35, width: 25, height: 20 },
      declaredValue: 8000,
      isFragile: false,
      requiresCOD: false,
      deliveryType: 'overnight' as const,
      packageType: 'parcel' as const
    }
  }
]

const mockData = {
  ADDITIONAL_PRICING_RULES,
  ADDITIONAL_DELIVERY_TIMEFRAMES,
  SAMPLE_SHIPPING_REQUESTS
}

export default mockData
