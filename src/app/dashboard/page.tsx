'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className='min-h-screen bg-gray-50'>
        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          {/* Welcome Section */}
          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>
              Welcome back, {user?.name || user?.email}!
            </h2>
            <p className='text-gray-600'>
              Manage your shipments and track your packages from your dashboard.
            </p>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>Total Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>12</div>
                <p className='text-xs text-gray-500'>+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>In Transit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-blue-600'>3</div>
                <p className='text-xs text-gray-500'>Currently shipping</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>9</div>
                <p className='text-xs text-gray-500'>Successfully delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>₹1,250</div>
                <p className='text-xs text-gray-500'>This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            <div
              className='hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => router.push('/book')}
            >
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center'>
                    <div className='bg-blue-100 p-3 rounded-lg'>
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
                          d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                        />
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <h3 className='text-lg font-semibold text-gray-900'>New Shipment</h3>
                      <p className='text-gray-600'>Create a new shipping order</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div
              className='hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => router.push('/tracking')}
            >
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center'>
                    <div className='bg-green-100 p-3 rounded-lg'>
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
                          d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                        />
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <h3 className='text-lg font-semibold text-gray-900'>Track Packages</h3>
                      <p className='text-gray-600'>Monitor your shipments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div
              className='hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => router.push('/history')}
            >
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center'>
                    <div className='bg-purple-100 p-3 rounded-lg'>
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
                          d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <h3 className='text-lg font-semibold text-gray-900'>Order History</h3>
                      <p className='text-gray-600'>View past shipments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Sample Order 1 */}
                <div className='flex items-center justify-between border-b pb-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='bg-blue-100 p-2 rounded-lg'>
                      <svg
                        className='w-5 h-5 text-blue-600'
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
                    <div>
                      <h4 className='font-semibold text-gray-900'>#SP001234</h4>
                      <p className='text-sm text-gray-600'>Mumbai → Delhi</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                      In Transit
                    </span>
                    <p className='text-sm text-gray-600 mt-1'>₹120</p>
                  </div>
                </div>

                {/* Sample Order 2 */}
                <div className='flex items-center justify-between border-b pb-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='bg-green-100 p-2 rounded-lg'>
                      <svg
                        className='w-5 h-5 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900'>#SP001233</h4>
                      <p className='text-sm text-gray-600'>Bangalore → Pune</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                      Delivered
                    </span>
                    <p className='text-sm text-gray-600 mt-1'>₹95</p>
                  </div>
                </div>

                {/* Sample Order 3 */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='bg-blue-100 p-2 rounded-lg'>
                      <svg
                        className='w-5 h-5 text-blue-600'
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
                    <div>
                      <h4 className='font-semibold text-gray-900'>#SP001232</h4>
                      <p className='text-sm text-gray-600'>Chennai → Hyderabad</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      Processing
                    </span>
                    <p className='text-sm text-gray-600 mt-1'>₹150</p>
                  </div>
                </div>
              </div>

              <div className='mt-6 text-center'>
                <Button variant='outline' onClick={() => router.push('/history')}>
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </Layout>
  );
}
