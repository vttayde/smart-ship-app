'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  MapPin,
  Package,
  Search,
  Truck,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending',
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Confirmed',
  },
  PICKED_UP: {
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Picked Up',
  },
  IN_TRANSIT: {
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'In Transit',
  },
  DELIVERED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Delivered',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Cancelled',
  },
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, loading, error, refreshOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        order => order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search by tracking number or contents
    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.parcelContents.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [orders, statusFilter, searchTerm]);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      switch (order.status.toUpperCase()) {
        case 'PENDING':
          stats.pending++;
          break;
        case 'CONFIRMED':
          stats.confirmed++;
          break;
        case 'PICKED_UP':
        case 'IN_TRANSIT':
          stats.inTransit++;
          break;
        case 'DELIVERED':
          stats.delivered++;
          break;
        case 'CANCELLED':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }, [orders]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Loading />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardContent className='p-6 text-center'>
              <Package className='w-12 h-12 mx-auto mb-4 text-gray-400' />
              <h2 className='text-xl font-semibold mb-2'>Authentication Required</h2>
              <p className='text-gray-600 mb-4'>Please log in to view your orders.</p>
              <Link href='/auth/login'>
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardContent className='p-6 text-center'>
              <AlertCircle className='w-12 h-12 mx-auto mb-4 text-red-500' />
              <h2 className='text-xl font-semibold mb-2'>Error Loading Orders</h2>
              <p className='text-gray-600 mb-4'>{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>My Orders</h1>
              <p className='mt-2 text-gray-600'>Track and manage your shipments</p>
            </div>
            <div className='mt-4 sm:mt-0 flex space-x-3'>
              <Button
                variant='outline'
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='flex items-center'
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href='/ship'>
                <Button className='flex items-center'>
                  <Plus className='w-4 h-4 mr-2' />
                  New Shipment
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Statistics */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-gray-900'>{orderStats.total}</div>
                <div className='text-sm text-gray-600'>Total Orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-yellow-600'>{orderStats.pending}</div>
                <div className='text-sm text-gray-600'>Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-orange-600'>{orderStats.inTransit}</div>
                <div className='text-sm text-gray-600'>In Transit</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-green-600'>{orderStats.delivered}</div>
                <div className='text-sm text-gray-600'>Delivered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <div className='text-2xl font-bold text-red-600'>{orderStats.cancelled}</div>
                <div className='text-sm text-gray-600'>Cancelled</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className='mb-6'>
            <CardContent className='p-6'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4'>
                <div className='flex items-center space-x-4'>
                  <div className='relative'>
                    <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <Input
                      type='text'
                      placeholder='Search orders...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Filter className='w-5 h-5 text-gray-400' />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>All Status</option>
                      <option value='pending'>Pending</option>
                      <option value='confirmed'>Confirmed</option>
                      <option value='picked_up'>Picked Up</option>
                      <option value='in_transit'>In Transit</option>
                      <option value='delivered'>Delivered</option>
                      <option value='cancelled'>Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className='text-sm text-gray-600'>
                  {filteredOrders.length} of {orders.length} orders
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Package className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                </h3>
                <p className='text-gray-600 mb-6'>
                  {orders.length === 0
                    ? 'Start shipping with us to see your orders here.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                {orders.length === 0 && (
                  <Link href='/ship'>
                    <Button>Create Your First Shipment</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {filteredOrders.map(order => {
                const config =
                  statusConfig[order.status.toUpperCase() as keyof typeof statusConfig] ||
                  statusConfig.PENDING;
                const StatusIcon = config.icon;

                return (
                  <Card
                    key={order.id}
                    className={`hover:shadow-md transition-shadow ${config.borderColor} border-l-4`}
                  >
                    <CardContent className='p-6'>
                      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-4 mb-3'>
                            <div
                              className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bgColor}`}
                            >
                              <StatusIcon className={`w-4 h-4 ${config.color}`} />
                              <span className={`text-sm font-medium ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            {order.trackingNumber && (
                              <div className='text-sm text-gray-600'>
                                <span className='font-medium'>Tracking:</span>{' '}
                                {order.trackingNumber}
                              </div>
                            )}
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                            <div>
                              <div className='text-sm text-gray-600'>Contents</div>
                              <div className='font-medium'>{order.parcelContents}</div>
                            </div>
                            <div>
                              <div className='text-sm text-gray-600'>Service Type</div>
                              <div className='font-medium'>{order.serviceType}</div>
                            </div>
                            <div>
                              <div className='text-sm text-gray-600'>Total Amount</div>
                              <div className='font-medium'>₹{order.totalAmount}</div>
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            {order.pickupAddress && (
                              <div className='flex items-start space-x-2'>
                                <MapPin className='w-4 h-4 text-green-600 mt-0.5' />
                                <div>
                                  <div className='font-medium text-green-600'>Pickup</div>
                                  <div className='text-gray-600'>
                                    {order.pickupAddress.city}, {order.pickupAddress.state}
                                  </div>
                                </div>
                              </div>
                            )}
                            {order.deliveryAddress && (
                              <div className='flex items-start space-x-2'>
                                <MapPin className='w-4 h-4 text-blue-600 mt-0.5' />
                                <div>
                                  <div className='font-medium text-blue-600'>Delivery</div>
                                  <div className='text-gray-600'>
                                    {order.deliveryAddress.city}, {order.deliveryAddress.state}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className='flex items-center space-x-4 mt-3 text-sm text-gray-600'>
                            <div className='flex items-center'>
                              <Calendar className='w-4 h-4 mr-1' />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            {order.estimatedDelivery && (
                              <div className='flex items-center'>
                                <Clock className='w-4 h-4 mr-1' />
                                Est. {new Date(order.estimatedDelivery).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className='mt-4 lg:mt-0 lg:ml-6 flex space-x-2'>
                          <Link href={`/orders/${order.id}`}>
                            <Button variant='outline' size='sm' className='flex items-center'>
                              <Eye className='w-4 h-4 mr-1' />
                              View Details
                            </Button>
                          </Link>
                          {order.trackingNumber && (
                            <Link href={`/track/${order.trackingNumber}`}>
                              <Button size='sm' className='flex items-center'>
                                <Truck className='w-4 h-4 mr-1' />
                                Track
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
