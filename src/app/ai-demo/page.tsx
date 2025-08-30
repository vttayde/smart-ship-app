'use client';

import SmartCourierRecommendations from '@/components/analytics/SmartCourierRecommendations';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';

interface CourierRecommendation {
  id: string;
  name: string;
  confidence: number;
  estimatedCost: number;
  estimatedTime: string;
  reliability: number;
  features: string[];
  riskFactors: string[];
  aiInsights: string[];
}

export default function AIRecommendationsDemo() {
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<CourierRecommendation | null>(null);

  const mockShipmentContext = {
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 15 },
    value: 1200,
    urgent: true,
    fragile: true,
  };

  const handleRecommendationSelect = (recommendation: CourierRecommendation) => {
    setSelectedRecommendation(recommendation);
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          AI-Powered Courier Recommendations Demo
        </h1>
        <p className='text-gray-600 text-lg'>
          Experience our Phase 9 AI-powered courier selection system that analyzes shipment context
          to provide intelligent recommendations with confidence scoring.
        </p>
      </div>

      {/* Demo Shipment Context */}
      <Card className='p-6 mb-8 bg-blue-50 border-blue-200'>
        <h2 className='text-xl font-semibold mb-4 text-blue-900'>Demo Shipment Context</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <span className='font-medium text-blue-800'>Route:</span>
            <p className='text-blue-700'>
              {mockShipmentContext.origin} → {mockShipmentContext.destination}
            </p>
          </div>
          <div>
            <span className='font-medium text-blue-800'>Package:</span>
            <p className='text-blue-700'>
              {mockShipmentContext.weight} kg, {mockShipmentContext.dimensions.length}×
              {mockShipmentContext.dimensions.width}×{mockShipmentContext.dimensions.height} cm
            </p>
          </div>
          <div>
            <span className='font-medium text-blue-800'>Value:</span>
            <p className='text-blue-700'>${mockShipmentContext.value}</p>
          </div>
          <div>
            <span className='font-medium text-blue-800'>Requirements:</span>
            <p className='text-blue-700'>
              {mockShipmentContext.urgent ? 'Urgent' : 'Standard'},
              {mockShipmentContext.fragile ? ' Fragile' : ' Standard'}
            </p>
          </div>
        </div>
      </Card>

      {/* AI Recommendations Component */}
      <SmartCourierRecommendations
        shipmentContext={mockShipmentContext}
        onRecommendationSelect={handleRecommendationSelect}
        className='mb-8'
      />

      {/* Selection Result */}
      {selectedRecommendation && (
        <Card className='p-6 bg-green-50 border-green-200'>
          <h3 className='text-lg font-semibold text-green-900 mb-4'>Selected Recommendation</h3>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-green-800'>{selectedRecommendation.name}</h4>
              <p className='text-green-700'>
                ${selectedRecommendation.estimatedCost} • {selectedRecommendation.estimatedTime} •{' '}
                {selectedRecommendation.confidence}% AI Confidence
              </p>
            </div>
            <Button variant='default' size='sm'>
              Proceed with Booking
            </Button>
          </div>
        </Card>
      )}

      {/* Phase 9 Features Summary */}
      <Card className='p-6 mt-8'>
        <h3 className='text-xl font-semibold mb-4'>Phase 9: Advanced Analytics & AI Features</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-semibold text-lg mb-2'>🤖 AI-Powered Features</h4>
            <ul className='space-y-2 text-gray-600'>
              <li>• Smart courier recommendations with confidence scoring</li>
              <li>• Context-aware analysis (urgency, fragility, value)</li>
              <li>• Real-time risk assessment and mitigation</li>
              <li>• Predictive analytics for delivery optimization</li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold text-lg mb-2'>📊 Advanced Analytics</h4>
            <ul className='space-y-2 text-gray-600'>
              <li>• Comprehensive analytics dashboard with data visualization</li>
              <li>• Revenue trends and performance metrics</li>
              <li>• Interactive charts with Recharts integration</li>
              <li>• Export capabilities for business intelligence</li>
            </ul>
          </div>
        </div>
        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <p className='text-sm text-gray-600'>
            <strong>Phase 9 Status:</strong> Foundation components implemented including advanced
            analytics dashboard and AI-powered courier recommendations. The system provides
            intelligent insights with confidence scoring and context-aware analysis to optimize
            shipping decisions.
          </p>
        </div>
      </Card>
    </div>
  );
}
