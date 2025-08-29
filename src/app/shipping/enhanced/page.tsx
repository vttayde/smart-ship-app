'use client';

import { Suspense } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import QuoteComparison from '@/components/shipping/enhanced/QuoteComparison';
import { Package } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Enhanced Shipping Platform</CardTitle>
                <p className="text-gray-600">Compare quotes and book shipments with real courier integration</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quote Comparison */}
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
          </div>
        }>
          <QuoteComparison 
            pickup={{
              name: "Sample Pickup",
              addressLine1: "123 Pickup St",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400001",
              phone: "9876543210"
            }}
            delivery={{
              name: "Sample Delivery",
              addressLine1: "456 Delivery St",
              city: "Delhi", 
              state: "Delhi",
              pincode: "110001",
              phone: "9876543211"
            }}
            shipment={{
              weight: 1,
              dimensions: { length: 10, width: 10, height: 10 },
              packageType: "package",
              contents: "Sample contents",
              declaredValue: 1000
            }}
            onQuoteSelect={(quote) => {
              // Handle quote selection - can integrate with booking flow later
              console.warn('Quote selected:', quote.courierName);
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
