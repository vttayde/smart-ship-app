'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import {
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Package,
  Plus,
  Settings,
  TrendingUp,
  Truck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Pending',
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Confirmed',
  },
  PICKED_UP: {
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Picked Up',
  },
  IN_TRANSIT: {
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'In Transit',
  },
  DELIVERED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Delivered',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Cancelled',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const { profile, loading: profileLoading } = useProfile();

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const totalShipments = orders.length;
    const inTransit = orders.filter(order =>
      ['PICKED_UP', 'IN_TRANSIT'].includes(order.status.toUpperCase())
    ).length;
    const delivered = orders.filter(order => order.status.toUpperCase() === 'DELIVERED').length;
    const pending = orders.filter(order =>
      ['PENDING', 'CONFIRMED'].includes(order.status.toUpperCase())
    ).length;
    const cancelled = orders.filter(order => order.status.toUpperCase() === 'CANCELLED').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalShipments,
      inTransit,
      delivered,
      pending,
      cancelled,
      totalSpent,
    };
  }, [orders]);

  // Get recent shipments (last 5)
  const recentShipments = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  if (authLoading || ordersLoading || profileLoading) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Loading />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Welcome back, {profile?.name || user?.name || 'User'}!
              </h1>
              <p className='mt-2 text-gray-600'>
                Here&apos;s an overview of your shipping activity
              </p>
            </div>
            <div className='mt-4 sm:mt-0 flex space-x-3'>
              <Link href='/ship'>
                <Button className='flex items-center'>
                  <Plus className='w-4 h-4 mr-2' />
                  New Shipment
                </Button>
              </Link>
              <Link href='/profile'>
                <Button variant='outline' className='flex items-center'>
                  <Settings className='w-4 h-4 mr-2' />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Shipments</p>
                    <p className='text-3xl font-bold text-gray-900'>{stats.totalShipments}</p>
                  </div>
                  <div className='bg-blue-50 p-3 rounded-full'>
                    <Package className='w-6 h-6 text-blue-600' />
                  </div>
                </div>
                <div className='mt-4 flex items-center'>
                  <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-gray-600'>All time</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>In Transit</p>
                    <p className='text-3xl font-bold text-orange-600'>{stats.inTransit}</p>
                  </div>
                  <div className='bg-orange-50 p-3 rounded-full'>
                    <Truck className='w-6 h-6 text-orange-600' />
                  </div>
                </div>
                <div className='mt-4 flex items-center'>
                  <Clock className='w-4 h-4 text-orange-500 mr-1' />
                  <span className='text-sm text-gray-600'>Active shipments</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Delivered</p>
                    <p className='text-3xl font-bold text-green-600'>{stats.delivered}</p>
                  </div>
                  <div className='bg-green-50 p-3 rounded-full'>
                    <CheckCircle className='w-6 h-6 text-green-600' />
                  </div>
                </div>
                <div className='mt-4 flex items-center'>
                  <CheckCircle className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-gray-600'>Successfully delivered</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Spent</p>
                    <p className='text-3xl font-bold text-gray-900'>
                      ₹{stats.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className='bg-purple-50 p-3 rounded-full'>
                    <CreditCard className='w-6 h-6 text-purple-600' />
                  </div>
                </div>
                <div className='mt-4 flex items-center'>
                  <CreditCard className='w-4 h-4 text-purple-500 mr-1' />
                  <span className='text-sm text-gray-600'>All payments</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Recent Shipments */}
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle className='text-lg font-semibold'>Recent Shipments</CardTitle>
                  <Link href='/orders'>
                    <Button variant='outline' size='sm'>
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className='p-6'>
                  {recentShipments.length === 0 ? (
                    <div className='text-center py-8'>
                      <Package className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>No shipments yet</h3>
                      <p className='text-gray-600 mb-4'>
                        Create your first shipment to get started.
                      </p>
                      <Link href='/ship'>
                        <Button>Create Shipment</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {recentShipments.map(shipment => {
                        const config =
                          statusConfig[
                            shipment.status.toUpperCase() as keyof typeof statusConfig
                          ] || statusConfig.PENDING;
                        const StatusIcon = config.icon;

                        return (
                          <div
                            key={shipment.id}
                            className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                          >
                            <div className='flex items-center space-x-4'>
                              <div
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor}`}
                              >
                                <StatusIcon className={`w-4 h-4 ${config.color}`} />
                                <span className={`text-sm font-medium ${config.color}`}>
                                  {config.label}
                                </span>
                              </div>
                              <div>
                                <p className='font-medium text-gray-900'>
                                  {shipment.trackingNumber || `Order #${shipment.id.slice(0, 8)}`}
                                </p>
                                <p className='text-sm text-gray-600'>
                                  {shipment.deliveryAddress?.city || 'N/A'},{' '}
                                  {shipment.deliveryAddress?.state || 'N/A'}
                                </p>
                                <p className='text-sm text-gray-500'>
                                  {new Date(shipment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center space-x-3'>
                              <span className='font-medium text-gray-900'>
                                ₹{shipment.totalAmount}
                              </span>
                              <Link href={`/orders/${shipment.id}`}>
                                <Button size='sm' variant='outline' className='flex items-center'>
                                  <Eye className='w-4 h-4 mr-1' />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold'>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='space-y-3'>
                    <Link href='/ship' className='block'>
                      <Button className='w-full justify-start'>
                        <Plus className='w-4 h-4 mr-2' />
                        Create New Shipment
                      </Button>
                    </Link>
                    <Link href='/track' className='block'>
                      <Button variant='outline' className='w-full justify-start'>
                        <MapPin className='w-4 h-4 mr-2' />
                        Track Package
                      </Button>
                    </Link>
                    <Link href='/profile' className='block'>
                      <Button variant='outline' className='w-full justify-start'>
                        <Settings className='w-4 h-4 mr-2' />
                        Manage Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold'>Account Status</CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Profile Status</span>
                      <span className='text-sm font-medium text-green-600'>Active</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Total Orders</span>
                      <span className='text-sm font-medium'>{stats.totalShipments}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Success Rate</span>
                      <span className='text-sm font-medium text-green-600'>
                        {stats.totalShipments > 0
                          ? Math.round((stats.delivered / stats.totalShipments) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>Member Since</span>
                      <span className='text-sm font-medium'>
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : 'Recently'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold'>Order Status</CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Clock className='w-4 h-4 text-yellow-600' />
                        <span className='text-sm text-gray-600'>Pending</span>
                      </div>
                      <span className='text-sm font-medium'>{stats.pending}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Truck className='w-4 h-4 text-orange-600' />
                        <span className='text-sm text-gray-600'>In Transit</span>
                      </div>
                      <span className='text-sm font-medium'>{stats.inTransit}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <CheckCircle className='w-4 h-4 text-green-600' />
                        <span className='text-sm text-gray-600'>Delivered</span>
                      </div>
                      <span className='text-sm font-medium'>{stats.delivered}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <XCircle className='w-4 h-4 text-red-600' />
                        <span className='text-sm text-gray-600'>Cancelled</span>
                      </div>
                      <span className='text-sm font-medium'>{stats.cancelled}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
