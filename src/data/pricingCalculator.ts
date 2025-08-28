// Advanced pricing calculator with sophisticated algorithms

import {
  COURIER_SERVICES,
  SERVICE_TYPES,
  PRICING_RULES,
  DELIVERY_TIMEFRAMES,
  DELIVERY_ZONES,
  type CourierQuote,
  type WeightSlab,
  type Discount,
} from './courierData';

export interface ShippingRequest {
  fromCity: string;
  fromState: string;
  fromPincode: string;
  toCity: string;
  toState: string;
  toPincode: string;
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  declaredValue: number;
  isFragile: boolean;
  requiresCOD: boolean;
  deliveryType: 'standard' | 'express' | 'overnight';
  packageType: 'documents' | 'parcel' | 'fragile';
}

export interface PricingCalculation {
  basePrice: number;
  additionalWeightCharges: number;
  fuelSurcharge: number;
  codCharges: number;
  gstAmount: number;
  totalPrice: number;
  breakdown: {
    description: string;
    amount: number;
    type: 'base' | 'additional' | 'tax' | 'discount';
  }[];
}

export class PricingCalculator {
  private readonly GST_RATE = 18; // 18% GST
  private readonly VOLUMETRIC_FACTOR = 5000; // Standard volumetric weight factor

  calculateVolumetricWeight(dimensions: { length: number; width: number; height: number }): number {
    return (dimensions.length * dimensions.width * dimensions.height) / this.VOLUMETRIC_FACTOR;
  }

  getBillableWeight(
    actualWeight: number,
    dimensions: { length: number; width: number; height: number }
  ): number {
    const volumetricWeight = this.calculateVolumetricWeight(dimensions);
    return Math.max(actualWeight, volumetricWeight);
  }

  determineZoneType(fromCity: string, toCity: string): string {
    const fromZone = this.getCityZone(fromCity);
    const toZone = this.getCityZone(toCity);

    // Same city delivery
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      return 'within_city';
    }

    // Both metro cities
    if (fromZone?.isMetro && toZone?.isMetro) {
      return 'metro_to_metro';
    }

    // Metro to non-metro
    if (fromZone?.isMetro && !toZone?.isMetro) {
      return 'metro_to_non_metro';
    }

    // Non-metro to metro
    if (!fromZone?.isMetro && toZone?.isMetro) {
      return 'non_metro_to_metro';
    }

    // Both non-metro
    return 'non_metro_to_non_metro';
  }

  private getCityZone(city: string) {
    return DELIVERY_ZONES.find(zone =>
      zone.cities.some(c => c.toLowerCase() === city.toLowerCase())
    );
  }

  private findApplicableWeightSlab(weight: number, weightSlabs: WeightSlab[]): WeightSlab | null {
    return weightSlabs.find(slab => weight >= slab.minWeight && weight <= slab.maxWeight) || null;
  }

  calculateCourierPrice(
    courierId: string,
    serviceTypeId: string,
    request: ShippingRequest
  ): PricingCalculation {
    const billableWeight = this.getBillableWeight(request.weight, request.dimensions);
    const zoneType = this.determineZoneType(request.fromCity, request.toCity);

    // Find applicable pricing rule
    const pricingRule = PRICING_RULES.find(
      rule =>
        rule.courierId === courierId &&
        rule.serviceTypeId === serviceTypeId &&
        rule.zoneType === zoneType &&
        rule.isActive
    );

    if (!pricingRule) {
      throw new Error(`No pricing rule found for ${courierId} - ${serviceTypeId} - ${zoneType}`);
    }

    // Find weight slab
    const weightSlab = this.findApplicableWeightSlab(billableWeight, pricingRule.weightSlabs);
    if (!weightSlab) {
      throw new Error(`No weight slab found for weight: ${billableWeight}kg`);
    }

    const breakdown: {
      description: string;
      amount: number;
      type: 'base' | 'additional' | 'tax' | 'discount';
    }[] = [];

    // Calculate base price
    const basePrice = weightSlab.basePrice;
    breakdown.push({ description: 'Base Price', amount: basePrice, type: 'base' });

    // Calculate additional weight charges
    let additionalWeightCharges = 0;
    if (billableWeight > weightSlab.minWeight) {
      const extraWeight = billableWeight - weightSlab.minWeight;
      additionalWeightCharges = extraWeight * weightSlab.additionalWeightPrice;
      breakdown.push({
        description: `Additional Weight (${extraWeight}kg)`,
        amount: additionalWeightCharges,
        type: 'additional',
      });
    }

    // Calculate fuel surcharge
    const fuelSurcharge = (basePrice + additionalWeightCharges) * (weightSlab.fuelSurcharge / 100);
    breakdown.push({ description: 'Fuel Surcharge', amount: fuelSurcharge, type: 'additional' });

    // Calculate COD charges
    let codCharges = 0;
    if (request.requiresCOD) {
      const codRule = pricingRule.additionalCharges.find(charge => charge.id === 'cod');
      if (codRule) {
        if (codRule.type === 'percentage') {
          codCharges = request.declaredValue * (codRule.value / 100);
        } else if (codRule.type === 'fixed') {
          codCharges = codRule.value;
        }
        breakdown.push({ description: 'COD Charges', amount: codCharges, type: 'additional' });
      }
    }

    // Apply discounts
    let discountAmount = 0;
    for (const discount of pricingRule.discounts) {
      if (this.isDiscountApplicable(discount, request, billableWeight)) {
        if (discount.type === 'percentage') {
          discountAmount += (basePrice + additionalWeightCharges) * (discount.value / 100);
        } else {
          discountAmount += discount.value;
        }
        breakdown.push({ description: discount.name, amount: -discountAmount, type: 'discount' });
      }
    }

    // Calculate subtotal before tax
    const subtotal =
      basePrice + additionalWeightCharges + fuelSurcharge + codCharges - discountAmount;

    // Calculate GST
    const gstAmount = subtotal * (this.GST_RATE / 100);
    breakdown.push({ description: 'GST (18%)', amount: gstAmount, type: 'tax' });

    // Total price
    const totalPrice = subtotal + gstAmount;

    return {
      basePrice,
      additionalWeightCharges,
      fuelSurcharge,
      codCharges,
      gstAmount,
      totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      breakdown,
    };
  }

  private isDiscountApplicable(
    discount: Discount,
    request: ShippingRequest,
    billableWeight: number
  ): boolean {
    const conditions = discount.conditions;

    if (conditions.minWeight && billableWeight < conditions.minWeight) {
      return false;
    }

    if (conditions.minValue && request.declaredValue < conditions.minValue) {
      return false;
    }

    if (conditions.validUntil) {
      const validUntil = new Date(conditions.validUntil);
      if (new Date() > validUntil) {
        return false;
      }
    }

    return true;
  }

  getDeliveryEstimate(courierId: string, serviceTypeId: string, fromCity: string, toCity: string) {
    const fromZone = this.getCityZone(fromCity)?.id || 'remote_areas';
    const toZone = this.getCityZone(toCity)?.id || 'remote_areas';

    const timeframe = DELIVERY_TIMEFRAMES.find(
      tf =>
        tf.courierId === courierId &&
        tf.serviceTypeId === serviceTypeId &&
        (tf.fromZone === fromZone || tf.fromZone === 'all') &&
        (tf.toZone === toZone || tf.toZone === 'all')
    );

    return (
      timeframe || {
        courierId,
        serviceTypeId,
        fromZone,
        toZone,
        minDays: 3,
        maxDays: 7,
        workingDaysOnly: true,
        cutoffTime: '17:00',
      }
    );
  }

  generateQuotes(request: ShippingRequest): CourierQuote[] {
    const quotes: CourierQuote[] = [];

    // Map delivery type to service type
    const serviceTypeMap = {
      standard: 'surface',
      express: 'express',
      overnight: 'overnight',
    };

    const serviceTypeId = serviceTypeMap[request.deliveryType] || 'surface';
    const serviceType = SERVICE_TYPES.find(st => st.id === serviceTypeId);

    if (!serviceType) {
      throw new Error(`Service type not found: ${serviceTypeId}`);
    }

    for (const courier of COURIER_SERVICES) {
      if (!courier.isActive) continue;

      try {
        const pricing = this.calculateCourierPrice(courier.id, serviceTypeId, request);
        const delivery = this.getDeliveryEstimate(
          courier.id,
          serviceTypeId,
          request.fromCity,
          request.toCity
        );

        const quote: CourierQuote = {
          id: `${courier.id}_${serviceTypeId}_${Date.now()}`,
          courierService: courier,
          serviceType,
          pricing: {
            basePrice: pricing.basePrice,
            additionalCharges: pricing.breakdown
              .filter(item => item.type === 'additional')
              .map(item => ({ name: item.description, amount: item.amount, type: item.type })),
            discounts: pricing.breakdown
              .filter(item => item.type === 'discount')
              .map(item => ({
                name: item.description,
                amount: Math.abs(item.amount),
                type: item.type,
              })),
            taxes: pricing.breakdown
              .filter(item => item.type === 'tax')
              .map(item => ({
                name: item.description,
                amount: item.amount,
                percentage: this.GST_RATE,
              })),
            totalPrice: pricing.totalPrice,
            currency: 'INR',
          },
          delivery: {
            estimatedDays: Math.round((delivery.minDays + delivery.maxDays) / 2),
            minDays: delivery.minDays,
            maxDays: delivery.maxDays,
            cutoffTime: delivery.cutoffTime,
            workingDaysOnly: delivery.workingDaysOnly,
          },
          features: serviceType.features,
          terms: [
            'Tracking included',
            'Insurance up to declared value',
            'Free pickup available',
            'SMS notifications',
          ],
          isRecommended: false,
          confidence: 95,
          lastUpdated: new Date().toISOString(),
        };

        quotes.push(quote);
      } catch (error) {
        console.warn(`Failed to generate quote for ${courier.name}:`, error);
      }
    }

    // Sort by price and mark the best value as recommended
    quotes.sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice);

    if (quotes.length > 0) {
      // Mark the cheapest reliable courier as recommended
      const reliableCouriers = quotes.filter(q => q.courierService.rating >= 4.0);
      if (reliableCouriers.length > 0) {
        reliableCouriers[0].isRecommended = true;
      } else {
        quotes[0].isRecommended = true;
      }
    }

    return quotes;
  }
}

export const pricingCalculator = new PricingCalculator();
