'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AnalyticsData {
  revenue: RevenueData[];
  performance: PerformanceMetrics[];
}

interface RevenueData {
  month: string;
  revenue: number;
  shipments: number;
  averageValue: number;
  forecast?: number;
}

interface PerformanceMetrics {
  courier: string;
  deliveryRate: number;
  averageTime: number;
  customerRating: number;
  costEfficiency: number;
}

interface AdvancedAnalyticsDashboardProps {
  dateRange?: string;
  showForecasting?: boolean;
  exportEnabled?: boolean;
}

type ViewType = 'overview' | 'revenue' | 'performance';

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  dateRange = '30d',
  showForecasting = true,
  exportEnabled = true,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<ViewType>('overview');
  const [timeRange, setTimeRange] = useState(dateRange);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Sample data for demonstration
      const sampleData: AnalyticsData = {
        revenue: [
          {
            month: 'Jan',
            revenue: 125000,
            shipments: 1200,
            averageValue: 104.17,
            forecast: 135000,
          },
          {
            month: 'Feb',
            revenue: 142000,
            shipments: 1350,
            averageValue: 105.19,
            forecast: 148000,
          },
          {
            month: 'Mar',
            revenue: 138000,
            shipments: 1280,
            averageValue: 107.81,
            forecast: 145000,
          },
          {
            month: 'Apr',
            revenue: 156000,
            shipments: 1450,
            averageValue: 107.59,
            forecast: 162000,
          },
          {
            month: 'May',
            revenue: 168000,
            shipments: 1520,
            averageValue: 110.53,
            forecast: 175000,
          },
          {
            month: 'Jun',
            revenue: 175000,
            shipments: 1580,
            averageValue: 110.76,
            forecast: 182000,
          },
        ],
        performance: [
          {
            courier: 'BlueDart',
            deliveryRate: 98.2,
            averageTime: 2.1,
            customerRating: 4.6,
            costEfficiency: 8.5,
          },
          {
            courier: 'FedEx',
            deliveryRate: 97.8,
            averageTime: 2.3,
            customerRating: 4.5,
            costEfficiency: 7.8,
          },
          {
            courier: 'DHL',
            deliveryRate: 96.5,
            averageTime: 2.8,
            customerRating: 4.3,
            costEfficiency: 7.2,
          },
          {
            courier: 'DTDC',
            deliveryRate: 95.1,
            averageTime: 3.2,
            customerRating: 4.1,
            costEfficiency: 8.8,
          },
          {
            courier: 'Ecom Express',
            deliveryRate: 94.7,
            averageTime: 3.5,
            customerRating: 4.0,
            costEfficiency: 9.2,
          },
        ],
      };
      setAnalyticsData(sampleData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, fetchAnalyticsData]);

  const exportData = (format: 'csv' | 'pdf' | 'excel') => {
    alert(`Exporting data in ${format} format`);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Phase 9: Advanced Analytics Dashboard
              </h1>
              <p className='text-gray-600 mt-2'>
                AI-powered business intelligence and performance insights
              </p>
            </div>
            <div className='flex gap-4'>
              {exportEnabled && (
                <div className='flex gap-2'>
                  <Button onClick={() => exportData('csv')} variant='outline' size='sm'>
                    Export CSV
                  </Button>
                  <Button onClick={() => exportData('pdf')} variant='outline' size='sm'>
                    Export PDF
                  </Button>
                </div>
              )}
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg bg-white'
              >
                <option value='7d'>Last 7 days</option>
                <option value='30d'>Last 30 days</option>
                <option value='90d'>Last 90 days</option>
                <option value='12m'>Last 12 months</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className='mt-6 border-b border-gray-200'>
            <nav className='flex space-x-8'>
              {[
                { key: 'overview' as const, label: 'Overview' },
                { key: 'revenue' as const, label: 'Revenue Analytics' },
                { key: 'performance' as const, label: 'Performance Metrics' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedView(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedView === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Dashboard */}
        {selectedView === 'overview' && (
          <div className='space-y-6'>
            {/* Key Metrics Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <Card className='p-6'>
                <div className='flex items-center'>
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
                        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                      />
                    </svg>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
                    <p className='text-2xl font-bold text-gray-900'>₹8,04,000</p>
                    <p className='text-sm text-green-600'>+12.5% from last month</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <svg
                      className='w-6 h-6 text-green-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                      />
                    </svg>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>Total Shipments</p>
                    <p className='text-2xl font-bold text-gray-900'>8,380</p>
                    <p className='text-sm text-green-600'>+8.2% from last month</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-purple-100 rounded-lg'>
                    <svg
                      className='w-6 h-6 text-purple-600'
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
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>AI Recommendations</p>
                    <p className='text-2xl font-bold text-gray-900'>1,247</p>
                    <p className='text-sm text-green-600'>92% accuracy rate</p>
                  </div>
                </div>
              </Card>

              <Card className='p-6'>
                <div className='flex items-center'>
                  <div className='p-2 bg-yellow-100 rounded-lg'>
                    <svg
                      className='w-6 h-6 text-yellow-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                      />
                    </svg>
                  </div>
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600'>Success Rate</p>
                    <p className='text-2xl font-bold text-gray-900'>96.8%</p>
                    <p className='text-sm text-green-600'>+1.2% from last month</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Row */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Revenue Trend */}
              <Card className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Revenue Trend & AI Forecasting</h3>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={analyticsData?.revenue}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      stroke='#8884d8'
                      strokeWidth={2}
                      name='Actual Revenue'
                    />
                    {showForecasting && (
                      <Line
                        type='monotone'
                        dataKey='forecast'
                        stroke='#82ca9d'
                        strokeDasharray='5 5'
                        strokeWidth={2}
                        name='AI Forecast'
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* AI Insights */}
              <Card className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>AI-Powered Insights</h3>
                <div className='space-y-4'>
                  <div className='p-4 bg-blue-50 rounded-lg'>
                    <div className='flex items-center mb-2'>
                      <svg
                        className='w-5 h-5 text-blue-600 mr-2'
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
                      <span className='font-medium text-blue-900'>Cost Optimization</span>
                    </div>
                    <p className='text-sm text-blue-800'>
                      AI identified ₹45,000 potential savings through smart courier selection
                    </p>
                  </div>

                  <div className='p-4 bg-green-50 rounded-lg'>
                    <div className='flex items-center mb-2'>
                      <svg
                        className='w-5 h-5 text-green-600 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                        />
                      </svg>
                      <span className='font-medium text-green-900'>Performance Trend</span>
                    </div>
                    <p className='text-sm text-green-800'>
                      Delivery success rate improved by 3.2% with AI recommendations
                    </p>
                  </div>

                  <div className='p-4 bg-purple-50 rounded-lg'>
                    <div className='flex items-center mb-2'>
                      <svg
                        className='w-5 h-5 text-purple-600 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <span className='font-medium text-purple-900'>Predictive Analytics</span>
                    </div>
                    <p className='text-sm text-purple-800'>
                      Expected 15% growth in Q4 based on historical patterns
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Revenue Analytics View */}
        {selectedView === 'revenue' && (
          <div className='space-y-6'>
            <Card className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>AI-Enhanced Revenue Analytics</h3>
              <ResponsiveContainer width='100%' height={400}>
                <LineChart data={analyticsData?.revenue}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'AOV']} />
                  <Line
                    type='monotone'
                    dataKey='averageValue'
                    stroke='#ff7300'
                    strokeWidth={3}
                    name='Average Order Value'
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Performance Metrics View */}
        {selectedView === 'performance' && (
          <div className='space-y-6'>
            <Card className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>AI-Analyzed Courier Performance</h3>
              <ResponsiveContainer width='100%' height={400}>
                <BarChart data={analyticsData?.performance}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='courier' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='deliveryRate' fill='#8884d8' name='Delivery Rate %' />
                  <Bar dataKey='customerRating' fill='#82ca9d' name='Customer Rating' />
                  <Bar dataKey='costEfficiency' fill='#ffc658' name='Cost Efficiency' />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
