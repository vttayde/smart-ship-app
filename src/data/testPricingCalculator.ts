// Test file to validate pricing calculator functionality

import { pricingCalculator } from '@/data/pricingCalculator';
import { SAMPLE_SHIPPING_REQUESTS } from '@/data/mockData';

// Test pricing calculator with sample requests
export function testPricingCalculator() {
  console.log('🧪 Testing Pricing Calculator...\n');

  SAMPLE_SHIPPING_REQUESTS.forEach((sample, index) => {
    console.log(`\n📋 Test ${index + 1}: ${sample.name}`);
    console.log('━'.repeat(50));

    try {
      const quotes = pricingCalculator.generateQuotes(sample.request);

      console.log(`✅ Generated ${quotes.length} quotes:`);

      quotes.forEach((quote, qIndex) => {
        console.log(
          `\n${qIndex + 1}. ${quote.courierService.displayName} ${quote.serviceType.displayName}`
        );
        console.log(`   💰 Price: ₹${quote.pricing.totalPrice}`);
        console.log(`   📅 Delivery: ${quote.delivery.minDays}-${quote.delivery.maxDays} days`);
        console.log(`   ⭐ Rating: ${quote.courierService.rating}`);
        console.log(`   ${quote.isRecommended ? '🏆 RECOMMENDED' : ''}`);

        // Show price breakdown
        console.log(`   📊 Breakdown:`);
        console.log(`      Base: ₹${quote.pricing.basePrice}`);
        quote.pricing.additionalCharges.forEach(charge => {
          console.log(`      ${charge.name}: +₹${charge.amount}`);
        });
        quote.pricing.discounts.forEach(discount => {
          console.log(`      ${discount.name}: -₹${discount.amount}`);
        });
        quote.pricing.taxes.forEach(tax => {
          console.log(`      ${tax.name}: +₹${tax.amount}`);
        });
      });
    } catch (error) {
      console.error(`❌ Error generating quotes: ${error}`);
    }
  });
}

// Test volumetric weight calculation
export function testVolumetricWeight() {
  console.log('\n🧪 Testing Volumetric Weight Calculation...\n');

  const testCases = [
    { dimensions: { length: 30, width: 20, height: 10 }, actualWeight: 1, expected: 1.2 },
    { dimensions: { length: 50, width: 40, height: 30 }, actualWeight: 2, expected: 12 },
    { dimensions: { length: 10, width: 10, height: 10 }, actualWeight: 5, expected: 5 },
  ];

  testCases.forEach((testCase, index) => {
    const volumetricWeight = pricingCalculator.calculateVolumetricWeight(testCase.dimensions);
    const billableWeight = pricingCalculator.getBillableWeight(
      testCase.actualWeight,
      testCase.dimensions
    );

    console.log(`Test ${index + 1}:`);
    console.log(
      `  Dimensions: ${testCase.dimensions.length}×${testCase.dimensions.width}×${testCase.dimensions.height} cm`
    );
    console.log(`  Actual Weight: ${testCase.actualWeight} kg`);
    console.log(`  Volumetric Weight: ${volumetricWeight} kg`);
    console.log(`  Billable Weight: ${billableWeight} kg`);
    console.log(
      `  Expected: ${testCase.expected} kg ${billableWeight === testCase.expected ? '✅' : '❌'}`
    );
    console.log('');
  });
}

// Test zone determination
export function testZoneMapping() {
  console.log('\n🧪 Testing Zone Mapping...\n');

  const testRoutes = [
    { from: 'Mumbai', to: 'Delhi', expected: 'metro_to_metro' },
    { from: 'Mumbai', to: 'Mumbai', expected: 'within_city' },
    { from: 'Mumbai', to: 'Patna', expected: 'metro_to_non_metro' },
    { from: 'Patna', to: 'Mumbai', expected: 'non_metro_to_metro' },
    { from: 'Patna', to: 'Ranchi', expected: 'non_metro_to_non_metro' },
  ];

  testRoutes.forEach((route, index) => {
    const zoneType = pricingCalculator.determineZoneType(route.from, route.to);
    console.log(
      `${index + 1}. ${route.from} → ${route.to}: ${zoneType} ${zoneType === route.expected ? '✅' : '❌'} (expected: ${route.expected})`
    );
  });
}

// Export all tests
export const pricingTests = {
  testPricingCalculator,
  testVolumetricWeight,
  testZoneMapping,
};

// Auto-run tests in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🚀 Ship Smart - Pricing Calculator Tests');
  console.log('='.repeat(60));

  // Run tests with delay to avoid blocking
  setTimeout(() => {
    testVolumetricWeight();
    testZoneMapping();
    testPricingCalculator();

    console.log('\n✨ All tests completed!');
  }, 1000);
}
