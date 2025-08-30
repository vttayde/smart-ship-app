import { prisma } from '../src/lib/prisma';

async function initializeCourierConfigurations() {
  console.warn('🚀 Initializing courier API configurations...');

  try {
    // Create Delhivery configuration
    const delhiveryConfig = await prisma.courierAPIConfig.upsert({
      where: { courierCode: 'delhivery' },
      update: {},
      create: {
        courierCode: 'delhivery',
        courierName: 'Delhivery',
        isActive: true,
        environment: 'sandbox',
        apiUrl: 'https://staging-express.delhivery.com',
        apiKey: 'YOUR_DELHIVERY_API_KEY', // Replace with actual API key
        capabilities: {
          services: ['express', 'surface', 'cod'],
          features: ['tracking', 'cod', 'insurance', 'returns'],
          maxWeight: 50,
          maxDimensions: { length: 100, width: 100, height: 100 },
        },
        serviceTypes: [
          {
            code: 'E',
            name: 'Express',
            description: 'Express delivery service',
            estimatedDays: 1,
            isExpressDelivery: true,
          },
          {
            code: 'S',
            name: 'Surface',
            description: 'Standard surface delivery',
            estimatedDays: 3,
            isExpressDelivery: false,
          },
          {
            code: 'C',
            name: 'Cash on Delivery',
            description: 'COD service',
            estimatedDays: 2,
            isExpressDelivery: false,
          },
        ],
        rateLimit: 100,
      },
    });

    // Create Shiprocket configuration (placeholder)
    const shiprocketConfig = await prisma.courierAPIConfig.upsert({
      where: { courierCode: 'shiprocket' },
      update: {},
      create: {
        courierCode: 'shiprocket',
        courierName: 'Shiprocket',
        isActive: false, // Set to true when ready to implement
        environment: 'sandbox',
        apiUrl: 'https://apiv2.shiprocket.in/v1/external',
        apiKey: 'YOUR_SHIPROCKET_API_KEY', // Replace with actual API key
        capabilities: {
          services: ['standard', 'express', 'international'],
          features: ['tracking', 'cod', 'insurance', 'returns', 'scheduling'],
          maxWeight: 30,
          maxDimensions: { length: 100, width: 100, height: 100 },
        },
        serviceTypes: [
          {
            code: 'standard',
            name: 'Standard',
            description: 'Standard delivery service',
            estimatedDays: 3,
            isExpressDelivery: false,
          },
          {
            code: 'express',
            name: 'Express',
            description: 'Express delivery service',
            estimatedDays: 1,
            isExpressDelivery: true,
          },
        ],
        rateLimit: 200,
      },
    });

    // Create Blue Dart configuration (placeholder)
    const blueDartConfig = await prisma.courierAPIConfig.upsert({
      where: { courierCode: 'blue_dart' },
      update: {},
      create: {
        courierCode: 'blue_dart',
        courierName: 'Blue Dart',
        isActive: false, // Set to true when ready to implement
        environment: 'sandbox',
        apiUrl: 'https://api.bluedart.com',
        apiKey: 'YOUR_BLUE_DART_API_KEY', // Replace with actual API key
        capabilities: {
          services: ['express', 'priority', 'ground'],
          features: ['tracking', 'cod', 'insurance', 'priority'],
          maxWeight: 25,
          maxDimensions: { length: 100, width: 100, height: 100 },
        },
        serviceTypes: [
          {
            code: 'express',
            name: 'Blue Dart Express',
            description: 'Premium express delivery',
            estimatedDays: 1,
            isExpressDelivery: true,
          },
          {
            code: 'ground',
            name: 'Ground Service',
            description: 'Ground delivery service',
            estimatedDays: 2,
            isExpressDelivery: false,
          },
        ],
        rateLimit: 150,
      },
    });

    // Create Ecom Express configuration (placeholder)
    const ecomExpressConfig = await prisma.courierAPIConfig.upsert({
      where: { courierCode: 'ecom_express' },
      update: {},
      create: {
        courierCode: 'ecom_express',
        courierName: 'Ecom Express',
        isActive: false, // Set to true when ready to implement
        environment: 'sandbox',
        apiUrl: 'https://api.ecomexpress.in',
        apiKey: 'YOUR_ECOM_EXPRESS_API_KEY', // Replace with actual API key
        capabilities: {
          services: ['standard', 'premium', 'cod'],
          features: ['tracking', 'cod', 'returns', 'bulk'],
          maxWeight: 30,
          maxDimensions: { length: 100, width: 100, height: 100 },
        },
        serviceTypes: [
          {
            code: 'standard',
            name: 'Standard',
            description: 'Standard delivery service',
            estimatedDays: 3,
            isExpressDelivery: false,
          },
          {
            code: 'premium',
            name: 'Premium',
            description: 'Premium delivery service',
            estimatedDays: 2,
            isExpressDelivery: true,
          },
        ],
        rateLimit: 100,
      },
    });

    // Update existing courier partners with codes
    await prisma.courierPartner.updateMany({
      where: { name: 'Delhivery' },
      data: {
        code: 'delhivery',
        apiEndpoint: 'https://staging-express.delhivery.com',
        maxWeight: 50,
        features: ['tracking', 'insurance', 'cod'],
      },
    });

    await prisma.courierPartner.updateMany({
      where: { name: 'Blue Dart' },
      data: {
        code: 'blue_dart',
        apiEndpoint: 'https://api.bluedart.com',
        maxWeight: 25,
        features: ['tracking', 'insurance', 'priority'],
      },
    });

    await prisma.courierPartner.updateMany({
      where: { name: 'FedEx' },
      data: {
        code: 'fedex',
        apiEndpoint: 'https://api.fedex.com',
        maxWeight: 30,
        features: ['tracking', 'insurance', 'international'],
      },
    });

    console.warn('✅ Courier API configurations initialized successfully!');
    console.warn(`✅ Created/Updated configurations:`);
    console.warn(`   - Delhivery (Active: ${delhiveryConfig.isActive})`);
    console.warn(`   - Shiprocket (Active: ${shiprocketConfig.isActive})`);
    console.warn(`   - Blue Dart (Active: ${blueDartConfig.isActive})`);
    console.warn(`   - Ecom Express (Active: ${ecomExpressConfig.isActive})`);

    console.warn(`\n📝 Next steps:`);
    console.warn(`   1. Update API keys in the courier configurations`);
    console.warn(`   2. Set environment to 'production' when ready`);
    console.warn(`   3. Enable additional courier services by setting isActive: true`);
    console.warn(`   4. Test with sandbox environments first`);
  } catch (error) {
    console.error('❌ Error initializing courier configurations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
if (require.main === module) {
  initializeCourierConfigurations()
    .then(() => {
      console.warn('🎉 Initialization completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeCourierConfigurations };
