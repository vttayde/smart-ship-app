'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Filter,
    MapPin,
    Package,
    Search,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderItem {
    id: string;
    trackingNumber: string;
    status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
    fromAddress: string;
    toAddress: string;
    courierService: string;
    amount: number;
    createdAt: string;
    deliveredAt?: string;
    packageDetails: {
        weight: number;
        dimensions: string;
        description: string;
    };
}

const MOCK_ORDERS: OrderItem[] = [
    {
        id: '1',
        trackingNumber: 'SPK123456789',
        status: 'in_transit',
        fromAddress: 'Mumbai, Maharashtra',
        toAddress: 'Bangalore, Karnataka',
        courierService: 'Blue Dart',
        amount: 120,
        createdAt: '2025-08-28T10:30:00Z',
        packageDetails: {
            weight: 0.5,
            dimensions: '20x15x10 cm',
            description: 'Electronics'
        }
    },
    {
        id: '2',
        trackingNumber: 'SPK123456788',
        status: 'delivered',
        fromAddress: 'Delhi, Delhi',
        toAddress: 'Mumbai, Maharashtra',
        courierService: 'DTDC',
        amount: 85,
        createdAt: '2025-08-27T14:15:00Z',
        deliveredAt: '2025-08-29T11:30:00Z',
        packageDetails: {
            weight: 1.2,
            dimensions: '30x25x15 cm',
            description: 'Documents'
        }
    },
    {
        id: '3',
        trackingNumber: 'SPK123456787',
        status: 'pending',
        fromAddress: 'Pune, Maharashtra',
        toAddress: 'Chennai, Tamil Nadu',
        courierService: 'FedEx',
        amount: 95,
        createdAt: '2025-08-26T09:45:00Z',
        packageDetails: {
            weight: 0.8,
            dimensions: '25x20x12 cm',
            description: 'Clothing'
        }
    },
    {
        id: '4',
        trackingNumber: 'SPK123456786',
        status: 'cancelled',
        fromAddress: 'Kolkata, West Bengal',
        toAddress: 'Hyderabad, Telangana',
        courierService: 'DHL',
        amount: 110,
        createdAt: '2025-08-25T16:20:00Z',
        packageDetails: {
            weight: 2.0,
            dimensions: '40x30x20 cm',
            description: 'Books'
        }
    }
];

export default function OrdersPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
    const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>(MOCK_ORDERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    const fetchOrders = async () => {
        try {
            setIsLoadingOrders(true);
            // Simulate API call
            setTimeout(() => {
                setOrders(MOCK_ORDERS);
                setIsLoadingOrders(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setIsLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        let filtered = orders;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.toAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.courierService.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [orders, searchTerm, statusFilter]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'picked_up':
                return <Package className="w-4 h-4 text-blue-600" />;
            case 'in_transit':
                return <Package className="w-4 h-4 text-blue-600" />;
            case 'out_for_delivery':
                return <Package className="w-4 h-4 text-orange-600" />;
            case 'delivered':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
            picked_up: { color: 'bg-blue-100 text-blue-800', text: 'Picked Up' },
            in_transit: { color: 'bg-blue-100 text-blue-800', text: 'In Transit' },
            out_for_delivery: { color: 'bg-orange-100 text-orange-800', text: 'Out for Delivery' },
            delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {getStatusIcon(status)}
                <span className="ml-1">{config.text}</span>
            </span>
        );
    };

    if (isLoading || isLoadingOrders) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-gray-600">Loading orders...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                        <p className="text-gray-600">Please log in to view your orders.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
                        <p className="text-gray-600">Track and manage all your shipments</p>
                    </div>

                    {/* Filters and Search */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by tracking number, address, or courier..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                {/* Export Button */}
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Export
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders List */}
                    {filteredOrders.length > 0 ? (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                        {order.trackingNumber}
                                                    </code>
                                                    {getStatusBadge(order.status)}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">From:</p>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-medium">{order.fromAddress}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">To:</p>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-medium">{order.toAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Courier:</span> {order.courierService}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Weight:</span> {order.packageDetails.weight} kg
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Package:</span> {order.packageDetails.description}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {order.deliveredAt && (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right ml-6">
                                                <div className="text-lg font-bold text-gray-900 mb-2">
                                                    ₹{order.amount}
                                                </div>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full flex items-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Track
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'No orders match your current filters.'
                                        : 'You haven\'t made any shipments yet.'
                                    }
                                </p>
                                {!searchTerm && statusFilter === 'all' && (
                                    <Button onClick={() => window.location.href = '/ship'}>
                                        Create Your First Shipment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Summary Stats */}
                    {filteredOrders.length > 0 && (
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {filteredOrders.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Orders</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {filteredOrders.filter(o => o.status === 'delivered').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Delivered</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {filteredOrders.filter(o => ['in_transit', 'out_for_delivery'].includes(o.status)).length}
                                        </div>
                                        <div className="text-sm text-gray-600">In Progress</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            ₹{filteredOrders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Spent</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
}
