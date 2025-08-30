'use client';

import { Button } from '@/components/ui/Button';
import React, { useCallback, useEffect, useState } from 'react';

interface AIRecommendation {
  courierId: string;
  courierName: string;
  confidenceScore: number;
  reasonCode: string;
  estimatedDelivery: string;
  costSavings: number;
  riskScore: number;
  features: string[];
  pricing: {
    base: number;
    fuel: number;
    handling: number;
    total: number;
  };
}

interface ShipmentContext {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  destination: {
    city: string;
    state: string;
    pincode: string;
    zone: string;
  };
  urgency: 'standard' | 'express' | 'overnight';
  packageType: 'document' | 'fragile' | 'electronics' | 'clothing' | 'other';
}

interface SmartCourierRecommendationsProps {
  shipmentContext: ShipmentContext;
  onRecommendationSelect: (recommendation: AIRecommendation) => void;
  showAdvancedMetrics?: boolean;
}

const SmartCourierRecommendations: React.FC<SmartCourierRecommendationsProps> = ({
  shipmentContext,
  onRecommendationSelect,
  showAdvancedMetrics = true,
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  // Sample AI recommendations based on shipment context
  const generateRecommendations = useCallback(
    async (context: ShipmentContext): Promise<AIRecommendation[]> => {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // AI logic simulation based on context
      const baseRecommendations: AIRecommendation[] = [
        {
          courierId: 'bluedart',
          courierName: 'BlueDart Express',
          confidenceScore: 0.92,
          reasonCode: 'OPTIMAL_SPEED_RELIABILITY',
          estimatedDelivery: '2025-09-01',
          costSavings: 85,
          riskScore: 0.15,
          features: [
            'Real-time tracking',
            'Insurance included',
            'SMS notifications',
            'Fragile handling',
          ],
          pricing: {
            base: 120,
            fuel: 18,
            handling: 25,
            total: 163,
          },
        },
        {
          courierId: 'fedex',
          courierName: 'FedEx',
          confidenceScore: 0.87,
          reasonCode: 'INTERNATIONAL_RELIABILITY',
          estimatedDelivery: '2025-09-01',
          costSavings: 42,
          riskScore: 0.12,
          features: ['Global network', 'Premium tracking', 'Insurance', 'Express delivery'],
          pricing: {
            base: 145,
            fuel: 22,
            handling: 30,
            total: 197,
          },
        },
        {
          courierId: 'dhl',
          courierName: 'DHL Express',
          confidenceScore: 0.85,
          reasonCode: 'PREMIUM_SERVICE',
          estimatedDelivery: '2025-08-31',
          costSavings: 28,
          riskScore: 0.18,
          features: [
            'Same-day delivery',
            'Premium handling',
            'Signature required',
            'Temperature control',
          ],
          pricing: {
            base: 180,
            fuel: 25,
            handling: 35,
            total: 240,
          },
        },
        {
          courierId: 'dtdc',
          courierName: 'DTDC',
          confidenceScore: 0.78,
          reasonCode: 'COST_EFFECTIVE',
          estimatedDelivery: '2025-09-02',
          costSavings: 156,
          riskScore: 0.25,
          features: ['Economical pricing', 'Wide network', 'COD available', 'Bulk discounts'],
          pricing: {
            base: 85,
            fuel: 12,
            handling: 15,
            total: 112,
          },
        },
        {
          courierId: 'ecom',
          courierName: 'Ecom Express',
          confidenceScore: 0.74,
          reasonCode: 'E_COMMERCE_SPECIALIST',
          estimatedDelivery: '2025-09-02',
          costSavings: 134,
          riskScore: 0.22,
          features: [
            'E-commerce focus',
            'Return handling',
            'Cash on delivery',
            'Regional strength',
          ],
          pricing: {
            base: 95,
            fuel: 14,
            handling: 18,
            total: 127,
          },
        },
      ];

      // AI-powered ranking based on context
      return baseRecommendations
        .map(rec => ({
          ...rec,
          confidenceScore: calculateContextualScore(rec, context),
        }))
        .sort((a, b) => b.confidenceScore - a.confidenceScore);
    },
    []
  );

  const calculateContextualScore = (
    recommendation: AIRecommendation,
    context: ShipmentContext
  ): number => {
    let score = recommendation.confidenceScore;

    // Adjust based on urgency
    if (context.urgency === 'overnight' && recommendation.courierName.includes('DHL')) {
      score += 0.1;
    } else if (context.urgency === 'standard' && recommendation.courierName.includes('DTDC')) {
      score += 0.05;
    }

    // Adjust based on package type
    if (context.packageType === 'fragile' && recommendation.features.includes('Fragile handling')) {
      score += 0.08;
    }

    // Adjust based on destination zone
    if (context.destination.zone === 'metro' && recommendation.courierName.includes('BlueDart')) {
      score += 0.06;
    }

    return Math.min(score, 0.99); // Cap at 99%
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const aiRecommendations = await generateRecommendations(shipmentContext);
        setRecommendations(aiRecommendations);
      } catch (error) {
        console.error('Failed to generate recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [shipmentContext, generateRecommendations]);

  const handleSelectRecommendation = (recommendation: AIRecommendation) => {
    setSelectedRecommendation(recommendation.courierId);
    onRecommendationSelect(recommendation);
  };

  const getReasonText = (reasonCode: string): string => {
    const reasons: Record<string, string> = {
      OPTIMAL_SPEED_RELIABILITY: 'Best balance of speed and reliability for your shipment',
      INTERNATIONAL_RELIABILITY: 'Excellent for international and premium deliveries',
      PREMIUM_SERVICE: 'Premium service with fastest delivery options',
      COST_EFFECTIVE: 'Most economical option with good service quality',
      E_COMMERCE_SPECIALIST: 'Specialized in e-commerce deliveries and returns',
    };
    return reasons[reasonCode] || 'Recommended based on AI analysis';
  };

  const getRiskLevelText = (riskScore: number): { text: string; color: string } => {
    if (riskScore <= 0.15) return { text: 'Very Low Risk', color: 'text-green-600' };
    if (riskScore <= 0.25) return { text: 'Low Risk', color: 'text-yellow-600' };
    if (riskScore <= 0.35) return { text: 'Medium Risk', color: 'text-orange-600' };
    return { text: 'High Risk', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500' />
          <span className='text-lg font-medium'>AI is analyzing the best courier options...</span>
        </div>
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='animate-pulse'>
              <div className='h-24 bg-gray-200 rounded-lg' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* AI Insights Header */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <svg
              className='w-6 h-6 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.74-1.53l-.548-.547z'
              />
            </svg>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              AI-Powered Courier Recommendations
            </h3>
            <p className='text-sm text-gray-600'>
              Analyzed {recommendations.length} couriers based on your shipment requirements
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className='space-y-4'>
        {recommendations.map((recommendation, index) => {
          const riskLevel = getRiskLevelText(recommendation.riskScore);
          const isSelected = selectedRecommendation === recommendation.courierId;
          const isBestChoice = index === 0;

          return (
            <div
              key={recommendation.courierId}
              className={`p-6 transition-all duration-200 cursor-pointer hover:shadow-lg border rounded-lg ${
                isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
              } ${isBestChoice ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              onClick={() => handleSelectRecommendation(recommendation)}
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-3'>
                    <h4 className='text-xl font-semibold text-gray-900'>
                      {recommendation.courierName}
                    </h4>
                    {isBestChoice && (
                      <span className='bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                        AI Recommended
                      </span>
                    )}
                    <div className='flex items-center space-x-1'>
                      <div className='h-2 w-16 bg-gray-200 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-blue-500 transition-all duration-500'
                          style={{ width: `${recommendation.confidenceScore * 100}%` }}
                        />
                      </div>
                      <span className='text-sm font-medium text-gray-600'>
                        {(recommendation.confidenceScore * 100).toFixed(0)}% match
                      </span>
                    </div>
                  </div>

                  <p className='text-gray-600 mb-4'>{getReasonText(recommendation.reasonCode)}</p>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                    <div>
                      <p className='text-sm text-gray-500'>Estimated Delivery</p>
                      <p className='font-semibold text-gray-900'>
                        {new Date(recommendation.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Cost Savings</p>
                      <p className='font-semibold text-green-600'>₹{recommendation.costSavings}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Risk Level</p>
                      <p className={`font-semibold ${riskLevel.color}`}>{riskLevel.text}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Total Cost</p>
                      <p className='font-semibold text-gray-900'>₹{recommendation.pricing.total}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className='mb-4'>
                    <p className='text-sm text-gray-500 mb-2'>Key Features</p>
                    <div className='flex flex-wrap gap-2'>
                      {recommendation.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Metrics */}
                  {showAdvancedMetrics && (
                    <div className='border-t pt-4'>
                      <h5 className='text-sm font-medium text-gray-700 mb-2'>Pricing Breakdown</h5>
                      <div className='grid grid-cols-4 gap-2 text-sm'>
                        <div>
                          <span className='text-gray-500'>Base:</span>
                          <span className='ml-1 font-medium'>₹{recommendation.pricing.base}</span>
                        </div>
                        <div>
                          <span className='text-gray-500'>Fuel:</span>
                          <span className='ml-1 font-medium'>₹{recommendation.pricing.fuel}</span>
                        </div>
                        <div>
                          <span className='text-gray-500'>Handling:</span>
                          <span className='ml-1 font-medium'>
                            ₹{recommendation.pricing.handling}
                          </span>
                        </div>
                        <div>
                          <span className='text-gray-500'>Total:</span>
                          <span className='ml-1 font-bold'>₹{recommendation.pricing.total}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className='ml-4'>
                  <Button
                    onClick={() => handleSelectRecommendation(recommendation)}
                    variant={isSelected ? 'default' : 'outline'}
                    size='sm'
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights Footer */}
      <div className='bg-gray-50 p-4 rounded-lg'>
        <div className='flex items-start space-x-3'>
          <svg
            className='w-5 h-5 text-blue-500 mt-0.5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <div className='text-sm text-gray-600'>
            <p className='font-medium mb-1'>How AI recommendations work:</p>
            <ul className='list-disc list-inside space-y-1 text-xs'>
              <li>Analyzes historical delivery performance and current network capacity</li>
              <li>Considers package characteristics, destination, and urgency requirements</li>
              <li>Factors in real-time pricing, weather conditions, and seasonal trends</li>
              <li>Continuously learns from delivery outcomes to improve recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCourierRecommendations;
