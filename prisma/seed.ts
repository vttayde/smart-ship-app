import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  /* eslint-disable */
    console.log('🌱 Seeding database...');

  // Create courier partners
  const delhivery = await prisma.courierPartner.upsert({
    where: { name: 'Delhivery' },
    update: {},
    create: {
      name: 'Delhivery',
      pricingModel: {
        basePrice: 40,
        perKgRate: 20,
        fuelSurcharge: 0.1,
      },
      coverageAreas: ['400001', '110001', '560001', '600001'], // Mumbai, Delhi, Bangalore, Chennai
      isActive: true,
      rating: 4.2,
    },
  });

  const shadowfax = await prisma.courierPartner.upsert({
    where: { name: 'Shadowfax' },
    update: {},
    create: {
      name: 'Shadowfax',
      pricingModel: {
        basePrice: 50,
        perKgRate: 25,
        sameDayDelivery: true,
        expressCharge: 30,
      },
      coverageAreas: ['400001', '110001', '560001', '411001'], // Mumbai, Delhi, Bangalore, Pune
      isActive: true,
      rating: 4.5,
    },
  });

  const ekart = await prisma.courierPartner.upsert({
    where: { name: 'Ekart' },
    update: {},
    create: {
      name: 'Ekart',
      pricingModel: {
        basePrice: 35,
        perKgRate: 18,
        budgetFriendly: true,
      },
      coverageAreas: ['400001', '110001', '560001', '600001', '700001'], // Major cities
      isActive: true,
      rating: 4.0,
    },
  });

  console.log('✅ Created courier partners:', {
    delhivery: delhivery.id,
    shadowfax: shadowfax.id,
    ekart: ekart.id,
  });

  console.log('🎉 Database seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
