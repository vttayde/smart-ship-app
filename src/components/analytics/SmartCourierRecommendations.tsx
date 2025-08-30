'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  MapPin,
  Package,
  Star,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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

interface ShipmentContext {
  origin: string;
  destination: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  value: number;
  urgent: boolean;
  fragile: boolean;
}

interface RecommendationFilters {
  maxCost?: number;
  maxTime?: number;
  minReliability?: number;
  serviceType?: 'standard' | 'express' | 'overnight';
}

interface SmartCourierRecommendationsProps {
  shipmentContext: ShipmentContext;
  onRecommendationSelect: (recommendation: CourierRecommendation) => void;
  className?: string;
}

export default function SmartCourierRecommendations({
  shipmentContext,
  onRecommendationSelect,
  className = '',
}: SmartCourierRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<CourierRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({});
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  // Mock AI analysis function
  const generateRecommendations = useCallback(
    async (context: ShipmentContext): Promise<CourierRecommendation[]> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockRecommendations: CourierRecommendation[] = [
        {
          id: 'fedex-express',
          name: 'FedEx Express',
          confidence: 92,
          estimatedCost: 45.99,
          estimatedTime: '1-2 business days',
          reliability: 96,
          features: ['Real-time tracking', 'Insurance included', 'Signature required'],
          riskFactors: ['Higher cost'],
          aiInsights: [
            'Best reliability for this route',
            'Excellent for fragile items',
            'Premium service worth the cost',
          ],
        },
        {
          id: 'ups-ground',
          name: 'UPS Ground',
          confidence: 87,
          estimatedCost: 28.5,
          estimatedTime: '3-5 business days',
          reliability: 89,
          features: ['Cost effective', 'Carbon neutral', 'Wide coverage'],
          riskFactors: ['Longer delivery time'],
          aiInsights: [
            'Most cost-effective option',
            'Good balance of price and reliability',
            'Eco-friendly choice',
          ],
        },
        {
          id: 'dhl-express',
          name: 'DHL Express',
          confidence: 85,
          estimatedCost: 52.75,
          estimatedTime: '1-2 business days',
          reliability: 94,
          features: ['International expertise', 'Express delivery', 'Premium handling'],
          riskFactors: ['Premium pricing', 'Limited weekend delivery'],
          aiInsights: [
            'Best for international shipments',
            'Excellent customer service',
            'Fast but expensive',
          ],
        },
        {
          id: 'usps-priority',
          name: 'USPS Priority Mail',
          confidence: 78,
          estimatedCost: 19.95,
          estimatedTime: '2-3 business days',
          reliability: 82,
          features: ['Affordable', 'Government service', 'Good coverage'],
          riskFactors: ['Variable delivery times', 'Limited tracking'],
          aiInsights: [
            'Budget-friendly option',
            'Reliable for standard shipments',
            'May have delays during peak times',
          ],
        },
      ];

      // Apply AI logic based on context
      return mockRecommendations
        .map(rec => {
          let adjustedConfidence = rec.confidence;

          // Adjust confidence based on shipment context
          if (context.urgent && rec.estimatedTime.includes('1-2')) {
            adjustedConfidence += 5;
          }
          if (context.fragile && rec.features.includes('Premium handling')) {
            adjustedConfidence += 3;
          }
          if (context.value > 1000 && rec.features.includes('Insurance included')) {
            adjustedConfidence += 4;
          }

          return {
            ...rec,
            confidence: Math.min(adjustedConfidence, 100),
          };
        })
        .sort((a, b) => b.confidence - a.confidence);
    },
    []
  );

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const recs = await generateRecommendations(shipmentContext);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [shipmentContext, generateRecommendations]);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 80) return 'text-blue-600 bg-blue-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getReliabilityStars = (reliability: number): React.ReactElement[] => {
    const stars = Math.round(reliability / 20); // Convert to 5-star scale
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filters.maxCost && rec.estimatedCost > filters.maxCost) return false;
    if (filters.minReliability && rec.reliability < filters.minReliability) return false;
    return true;
  });

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className='flex items-center space-x-3 mb-4'>
          <TrendingUp className='w-6 h-6 text-blue-600' />
          <h3 className='text-lg font-semibold'>AI-Powered Courier Recommendations</h3>
        </div>
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='animate-pulse'>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
              <div className='h-3 bg-gray-200 rounded w-1/2' />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <TrendingUp className='w-6 h-6 text-blue-600' />
          <h3 className='text-lg font-semibold'>AI-Powered Courier Recommendations</h3>
        </div>
        <Badge variant='secondary' className='bg-blue-50 text-blue-700'>
          {filteredRecommendations.length} options analyzed
        </Badge>
      </div>

      {/* Shipment Context Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center space-x-2'>
          <MapPin className='w-4 h-4 text-gray-500' />
          <span className='text-sm text-gray-600'>
            {shipmentContext.origin} → {shipmentContext.destination}
          </span>
        </div>
        <div className='flex items-center space-x-2'>
          <Package className='w-4 h-4 text-gray-500' />
          <span className='text-sm text-gray-600'>{shipmentContext.weight} kg</span>
        </div>
        <div className='flex items-center space-x-2'>
          <DollarSign className='w-4 h-4 text-gray-500' />
          <span className='text-sm text-gray-600'>${shipmentContext.value}</span>
        </div>
        <div className='flex items-center space-x-2'>
          <Calendar className='w-4 h-4 text-gray-500' />
          <span className='text-sm text-gray-600'>
            {shipmentContext.urgent ? 'Urgent' : 'Standard'}
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className='flex flex-wrap gap-4 mb-6 p-4 border rounded-lg'>
        <div className='flex items-center space-x-2'>
          <label className='text-sm font-medium'>Max Cost:</label>
          <select
            className='border rounded px-2 py-1 text-sm'
            value={filters.maxCost || ''}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                maxCost: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value=''>Any</option>
            <option value='30'>$30</option>
            <option value='50'>$50</option>
            <option value='70'>$70</option>
          </select>
        </div>
        <div className='flex items-center space-x-2'>
          <label className='text-sm font-medium'>Min Reliability:</label>
          <select
            className='border rounded px-2 py-1 text-sm'
            value={filters.minReliability || ''}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                minReliability: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value=''>Any</option>
            <option value='80'>80%</option>
            <option value='85'>85%</option>
            <option value='90'>90%</option>
          </select>
        </div>
      </div>

      {/* Recommendations List */}
      <div className='space-y-4'>
        {filteredRecommendations.map((recommendation, index) => (
          <div
            key={recommendation.id}
            className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
              selectedRecommendation === recommendation.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${index === 0 ? 'ring-2 ring-blue-200' : ''}`}
            onClick={() => setSelectedRecommendation(recommendation.id)}
          >
            <div className='flex justify-between items-start mb-4'>
              <div className='flex items-center space-x-3'>
                <Truck className='w-8 h-8 text-blue-600' />
                <div>
                  <h4 className='font-semibold text-lg'>{recommendation.name}</h4>
                  <div className='flex items-center space-x-2 mt-1'>
                    <Badge
                      className={`text-xs px-2 py-1 ${getConfidenceColor(recommendation.confidence)}`}
                    >
                      {recommendation.confidence}% AI Confidence
                    </Badge>
                    {index === 0 && (
                      <Badge className='bg-green-100 text-green-800 text-xs'>Recommended</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold text-green-600'>
                  ${recommendation.estimatedCost}
                </div>
                <div className='text-sm text-gray-500'>{recommendation.estimatedTime}</div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Reliability */}
              <div>
                <h5 className='font-medium text-sm mb-2'>Reliability</h5>
                <div className='flex items-center space-x-2'>
                  <div className='flex'>{getReliabilityStars(recommendation.reliability)}</div>
                  <span className='text-sm text-gray-600'>{recommendation.reliability}%</span>
                </div>
              </div>

              {/* Features */}
              <div>
                <h5 className='font-medium text-sm mb-2'>Key Features</h5>
                <div className='flex flex-wrap gap-1'>
                  {recommendation.features.slice(0, 3).map((feature, i) => (
                    <Badge key={i} variant='secondary' className='text-xs'>
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h5 className='font-medium text-sm mb-2'>Considerations</h5>
                <div className='space-y-1'>
                  {recommendation.riskFactors.slice(0, 2).map((risk, i) => (
                    <div key={i} className='flex items-center space-x-1'>
                      <AlertTriangle className='w-3 h-3 text-yellow-500' />
                      <span className='text-xs text-gray-600'>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
              <h5 className='font-medium text-sm mb-2 text-blue-800'>AI Insights</h5>
              <div className='space-y-1'>
                {recommendation.aiInsights.map((insight, i) => (
                  <div key={i} className='flex items-center space-x-2'>
                    <CheckCircle className='w-3 h-3 text-blue-600' />
                    <span className='text-xs text-blue-700'>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className='mt-4 flex justify-end'>
              <Button
                variant={selectedRecommendation === recommendation.id ? 'default' : 'secondary'}
                size='sm'
                onClick={e => {
                  e.stopPropagation();
                  onRecommendationSelect(recommendation);
                }}
                className='transition-all duration-200'
              >
                {selectedRecommendation === recommendation.id ? 'Selected' : 'Select This Option'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          <AlertTriangle className='w-12 h-12 mx-auto mb-4 text-gray-400' />
          <p>No recommendations match your current filters.</p>
          <Button variant='secondary' size='sm' className='mt-2' onClick={() => setFilters({})}>
            Clear Filters
          </Button>
        </div>
      )}
    </Card>
  );
}
