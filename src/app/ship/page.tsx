'use client';

import Layout from '@/components/layout/Layout';
import ShippingQuoteForm from '@/components/shipping/ShippingQuoteForm';

export default function ShipPage() {
  return (
    <Layout>
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>Ship Your Package</h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Get instant quotes from multiple courier partners. Compare prices, delivery times, and
              choose the best option for your needs.
            </p>
          </div>

          <ShippingQuoteForm />
        </div>
      </div>
    </Layout>
  );
}
