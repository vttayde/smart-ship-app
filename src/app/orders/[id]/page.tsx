'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { Order, useOrders } from '@/hooks/useOrders';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    MapPin,
    Package,
    Phone,
    Truck,
    User,
    XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const statusConfig = {
    PENDING: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Pending',
        description: 'Order is being processed',
    },
    CONFIRMED: {
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Confirmed',
        description: 'Order confirmed and ready for pickup',
    },
    PICKED_UP: {
        icon: Package,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: 'Picked Up',
        description: 'Package has been collected',
    },
    IN_TRANSIT: {
        icon: Truck,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: 'In Transit',
        description: 'Package is on the way',
    },
    DELIVERED: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Delivered',
        description: 'Package has been delivered',
    },
    CANCELLED: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Cancelled',
        description: 'Order has been cancelled',
    },
};

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params?.id as string;
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { orders, loading, error, cancelOrder } = useOrders();
    const [order, setOrder] = useState<Order | null>(null);
    const [copied, setCopied] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (orders && orderId) {
            const foundOrder = orders.find(o => o.id === orderId);
            setOrder(foundOrder || null);
        }
    }, [orders, orderId]);

    const copyTrackingNumber = async () => {
        if (order?.trackingNumber) {
            await navigator.clipboard.writeText(order.trackingNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || order.status === 'CANCELLED') return;

        setCancelling(true);
        try {
            await cancelOrder(order.id);
            // Refresh order data
            const updatedOrder = { ...order, status: 'CANCELLED' };
            setOrder(updatedOrder);
        } catch (error) {
            console.error('Failed to cancel order:', error);
        } finally {
            setCancelling(false);
        }
    };

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loading />
                </div>
            </Layout>
        );
    }

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6 text-center">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                            <p className="text-gray-600 mb-4">Please log in to view order details.</p>
                            <Link href="/auth/login">
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
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6 text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                            <h2 className="text-xl font-semibold mb-2">Error Loading Order</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Link href="/orders">
                                <Button>Back to Orders</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6 text-center">
                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                            <p className="text-gray-600 mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
                            <Link href="/orders">
                                <Button>Back to Orders</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    const config = statusConfig[order.status.toUpperCase() as keyof typeof statusConfig] || statusConfig.PENDING;
    const StatusIcon = config.icon;

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link href="/orders">
                                <Button variant="outline" size="sm" className="flex items-center">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Orders
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                                <p className="text-gray-600">Order ID: {order.id}</p>
                            </div>
                        </div>
                        {order.trackingNumber && (
                            <Link href={`/track/${order.trackingNumber}`}>
                                <Button className="flex items-center">
                                    <Truck className="w-4 h-4 mr-2" />
                                    Track Package
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Card */}
                            <Card className={`${config.borderColor} border-l-4`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${config.bgColor}`}>
                                            <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                            <span className={`font-medium ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelOrder}
                                                disabled={cancelling}
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-gray-600">{config.description}</p>
                                    {order.trackingNumber && (
                                        <div className="mt-4 flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Tracking Number:</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                {order.trackingNumber}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copyTrackingNumber}
                                                className="p-1"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            {copied && (
                                                <span className="text-sm text-green-600">Copied!</span>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Package Details */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Package className="w-5 h-5 mr-2" />
                                        Package Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-600">Contents</label>
                                            <p className="font-medium">{order.parcelContents}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Service Type</label>
                                            <p className="font-medium">{order.serviceType}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Weight</label>
                                            <p className="font-medium">{order.dimensions.weight} kg</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Dimensions</label>
                                            <p className="font-medium">
                                                {order.dimensions.length} × {order.dimensions.width} × {order.dimensions.height} cm
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Value</label>
                                            <p className="font-medium">₹{order.declaredValue}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">Total Amount</label>
                                            <p className="font-medium text-lg">₹{order.totalAmount}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Addresses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pickup Address */}
                                {order.pickupAddress && (
                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
                                                <MapPin className="w-5 h-5 mr-2" />
                                                Pickup Address
                                            </h3>
                                            <div className="space-y-2">
                                                <p className="font-medium">{order.pickupAddress.name}</p>
                                                <p className="text-gray-600">{order.pickupAddress.street}</p>
                                                {order.pickupAddress.landmark && (
                                                    <p className="text-gray-600">{order.pickupAddress.landmark}</p>
                                                )}
                                                <p className="text-gray-600">
                                                    {order.pickupAddress.city}, {order.pickupAddress.state} {order.pickupAddress.pincode}
                                                </p>
                                                {order.pickupAddress.phone && (
                                                    <p className="text-gray-600 flex items-center">
                                                        <Phone className="w-4 h-4 mr-1" />
                                                        {order.pickupAddress.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Delivery Address */}
                                {order.deliveryAddress && (
                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-600">
                                                <MapPin className="w-5 h-5 mr-2" />
                                                Delivery Address
                                            </h3>
                                            <div className="space-y-2">
                                                <p className="font-medium">{order.deliveryAddress.name}</p>
                                                <p className="text-gray-600">{order.deliveryAddress.street}</p>
                                                {order.deliveryAddress.landmark && (
                                                    <p className="text-gray-600">{order.deliveryAddress.landmark}</p>
                                                )}
                                                <p className="text-gray-600">
                                                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                                                </p>
                                                {order.deliveryAddress.phone && (
                                                    <p className="text-gray-600 flex items-center">
                                                        <Phone className="w-4 h-4 mr-1" />
                                                        {order.deliveryAddress.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Order Timeline */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        Timeline
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium">Order Created</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {order.estimatedDelivery && (
                                            <div className="flex items-center space-x-3">
                                                <Truck className="w-4 h-4 text-blue-400" />
                                                <div>
                                                    <p className="text-sm font-medium">Estimated Delivery</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(order.estimatedDelivery).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {order.actualDelivery && (
                                            <div className="flex items-center space-x-3">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <div>
                                                    <p className="text-sm font-medium">Delivered</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(order.actualDelivery).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Courier Information */}
                            {order.courierPartner && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                                            <User className="w-5 h-5 mr-2" />
                                            Courier Partner
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="font-medium">{order.courierPartner.name}</p>
                                            <p className="text-sm text-gray-600">Service Type: {order.serviceType}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Actions */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Actions</h3>
                                    <div className="space-y-3">
                                        {order.trackingNumber && (
                                            <Link href={`/track/${order.trackingNumber}`} className="block">
                                                <Button className="w-full justify-start">
                                                    <Truck className="w-4 h-4 mr-2" />
                                                    Track Package
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href="/ship" className="block">
                                            <Button variant="outline" className="w-full justify-start">
                                                <Package className="w-4 h-4 mr-2" />
                                                Ship Another Package
                                            </Button>
                                        </Link>
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
