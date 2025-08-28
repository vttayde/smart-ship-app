'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Package,
  Plus,
  Settings,
  TrendingUp,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  totalSpent: number;
}

interface RecentShipment {
  id: string;
  trackingNumber: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  amount: number;
}

// Extend the user type to include role
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'USER' | 'ADMIN';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    inTransit: 0,
    delivered: 0,
    totalSpent: 0
  });
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with real API endpoints
      setTimeout(() => {
        setStats({
          totalShipments: 12,
          inTransit: 3,
          delivered: 9,
          totalSpent: 1250
        });

        setRecentShipments([
          {
            id: '1',
            trackingNumber: 'SPK123456789',
            destination: 'Mumbai, Maharashtra',
            status: 'in_transit',
            createdAt: '2025-08-28T10:30:00Z',
            amount: 120
          },
          {
            id: '2',
            trackingNumber: 'SPK123456788',
            destination: 'Bangalore, Karnataka',
            status: 'delivered',
            createdAt: '2025-08-27T14:15:00Z',
            amount: 85
          },
          {
            id: '3',
            trackingNumber: 'SPK123456787',
            destination: 'Delhi, Delhi',
            status: 'pending',
            createdAt: '2025-08-26T09:45:00Z',
            amount: 95
          }
        ]);

        setIsLoadingData(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoadingData(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      in_transit: { color: 'bg-blue-100 text-blue-800', text: 'In Transit' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Check if user is admin (assuming role is available in user object)
  const extendedUser = user as ExtendedUser;
  const isAdmin = extendedUser?.role === 'ADMIN';

  if (isLoading || isLoadingData) {
    return (
      <Layout>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
            <p className='mt-4 text-gray-600'>Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-6'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Welcome back, {user?.name || user?.email?.split('@')[0]}!
                </h1>
                <p className='text-gray-600 mt-1'>
                  {isAdmin ? 'Admin Dashboard - Manage all system operations' : 'Manage your shipments and track your packages'}
                </p>
              </div>
              <div className='flex items-center space-x-4'>
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Profile
                </Button>
                <Button
                  onClick={() => router.push('/ship')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Shipment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600 flex items-center gap-2'>
                  <Package className="w-4 h-4" />
                  Total Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-gray-900'>{stats.totalShipments}</div>
                <p className='text-xs text-gray-500 flex items-center gap-1 mt-1'>
                  <TrendingUp className="w-3 h-3" />
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600 flex items-center gap-2'>
                  <Clock className="w-4 h-4" />
                  In Transit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-blue-600'>{stats.inTransit}</div>
                <p className='text-xs text-gray-500'>Currently shipping</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600 flex items-center gap-2'>
                  <CheckCircle className="w-4 h-4" />
                  Delivered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-green-600'>{stats.delivered}</div>
                <p className='text-xs text-gray-500'>Successfully delivered</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600 flex items-center gap-2'>
                  <CreditCard className="w-4 h-4" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-gray-900'>₹{stats.totalSpent.toLocaleString()}</div>
                <p className='text-xs text-gray-500'>This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Shipments */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Recent Shipments
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/orders')}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentShipments.length > 0 ? (
                <div className="space-y-4">
                  {recentShipments.map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {shipment.trackingNumber}
                          </code>
                          {getStatusBadge(shipment.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>To: {shipment.destination}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(shipment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{shipment.amount}</div>
                        <Button variant="outline" size="sm" className="mt-2">
                          Track
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No shipments yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/ship')}
                  >
                    Create Your First Shipment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Section */}
          {isAdmin && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Admin Panel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">User Management</h3>
                      <p className="text-sm text-gray-600 mb-4">Manage user accounts and permissions</p>
                      <Button variant="outline" className="w-full">
                        Manage Users
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/analytics')}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Analytics</h3>
                      <p className="text-sm text-gray-600 mb-4">View system analytics and reports</p>
                      <Button variant="outline" className="w-full">
                        View Analytics
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/settings')}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">System Settings</h3>
                      <p className="text-sm text-gray-600 mb-4">Configure system settings and preferences</p>
                      <Button variant="outline" className="w-full">
                        Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions for Regular Users */}
          {!isAdmin && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/ship')}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Plus className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Ship Package</h3>
                      <p className="text-sm text-gray-600">Get quotes and book shipment</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/track')}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Eye className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Track Package</h3>
                      <p className="text-sm text-gray-600">Track your shipments</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/profile')}>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Settings className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Profile Settings</h3>
                      <p className="text-sm text-gray-600">Manage your account</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
