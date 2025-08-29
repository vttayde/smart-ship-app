'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    MapPin,
    Package,
    Search,
    Truck,
    User,
    XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface TrackingUpdate {
    id: string;
    status: string;
    location: string;
    timestamp: string;
    description: string;
}

interface TrackingData {
    trackingNumber: string;
    orderId: string;
    status: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    currentLocation?: string;
    updates: TrackingUpdate[];
    order: {
        parcelContents: string;
        serviceType: string;
        totalAmount: number;
        pickupAddress?: {
            city: string;
            state: string;
        };
        deliveryAddress?: {
            city: string;
            state: string;
        };
        courierPartner?: {
            name: string;
        };
    };
}

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

export default function TrackPage() {
    const { isAuthenticated } = useAuth();
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trackingNumber.trim()) {
            setError('Please enter a tracking number');
            return;
        }

        setLoading(true);
        setError('');
        setTrackingData(null);

        try {
            // First, try to find the order by tracking number
            const ordersResponse = await fetch('/api/orders');

            if (!ordersResponse.ok) {
                throw new Error('Failed to fetch orders');
            }

            const orders = await ordersResponse.json();
            const order = orders.find((o: { trackingNumber: string }) => o.trackingNumber === trackingNumber);

            if (!order) {
                throw new Error('Tracking number not found');
            }

            // Get tracking updates for this order
            const trackingResponse = await fetch(`/api/orders/${order.id}/tracking`);

            let trackingUpdates = [];
            if (trackingResponse.ok) {
                trackingUpdates = await trackingResponse.json();
            }

            // Create tracking data structure
            const tracking: TrackingData = {
                trackingNumber: order.trackingNumber,
                orderId: order.id,
                status: order.status,
                estimatedDelivery: order.estimatedDelivery,
                actualDelivery: order.actualDelivery,
                currentLocation: trackingUpdates.length > 0
                    ? trackingUpdates[trackingUpdates.length - 1].location
                    : order.pickupAddress?.city,
                updates: trackingUpdates.map((update: { id: string; status: string; location?: string; timestamp?: string; createdAt: string; description?: string }) => ({
                    id: update.id,
                    status: update.status,
                    location: update.location || 'Processing Center',
                    timestamp: update.timestamp || update.createdAt,
                    description: update.description || getStatusDescription(update.status),
                })),
                order: {
                    parcelContents: order.parcelContents,
                    serviceType: order.serviceType,
                    totalAmount: order.totalAmount,
                    pickupAddress: order.pickupAddress,
                    deliveryAddress: order.deliveryAddress,
                    courierPartner: order.courierPartner,
                },
            };

            setTrackingData(tracking);
        } catch (error) {
            console.error('Tracking error:', error);
            setError(error instanceof Error ? error.message : 'Failed to track package');
        } finally {
            setLoading(false);
        }
    };

    const getStatusDescription = (status: string): string => {
        const config = statusConfig[status.toUpperCase() as keyof typeof statusConfig];
        return config?.description || 'Status update';
    };

    const getProgressPercentage = (status: string): number => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return 10;
            case 'CONFIRMED':
                return 25;
            case 'PICKED_UP':
                return 50;
            case 'IN_TRANSIT':
                return 75;
            case 'DELIVERED':
                return 100;
            case 'CANCELLED':
                return 0;
            default:
                return 0;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Package</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Enter your tracking number to get real-time updates on your shipment status.
                        </p>
                    </div>

                    {/* Tracking Form */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <form onSubmit={handleTrack} className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Enter tracking number (e.g., SPK123456789)"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="text-lg"
                                    />
                                </div>
                                <Button type="submit" disabled={loading} className="px-8">
                                    {loading ? (
                                        <Loading className="w-4 h-4 mr-2" />
                                    ) : (
                                        <Search className="w-4 h-4 mr-2" />
                                    )}
                                    {loading ? 'Tracking...' : 'Track'}
                                </Button>
                            </form>
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                        <p className="text-red-600">{error}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tracking Results */}
                    {trackingData && (
                        <div className="space-y-6">
                            {/* Status Overview */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {trackingData.trackingNumber}
                                            </h2>
                                            <p className="text-gray-600">
                                                {trackingData.order.parcelContents} via {trackingData.order.courierPartner?.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">₹{trackingData.order.totalAmount}</div>
                                            <div className="text-sm text-gray-600">{trackingData.order.serviceType}</div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {(() => {
                                        const config = statusConfig[trackingData.status.toUpperCase() as keyof typeof statusConfig] || statusConfig.PENDING;
                                        const StatusIcon = config.icon;
                                        return (
                                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${config.bgColor} mb-6`}>
                                                <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                                <span className={`font-medium ${config.color}`}>{config.label}</span>
                                                <span className="text-gray-600">- {config.description}</span>
                                            </div>
                                        );
                                    })()}

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>Progress</span>
                                            <span>{getProgressPercentage(trackingData.status)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${trackingData.status.toUpperCase() === 'DELIVERED'
                                                        ? 'bg-green-500'
                                                        : trackingData.status.toUpperCase() === 'CANCELLED'
                                                            ? 'bg-red-500'
                                                            : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${getProgressPercentage(trackingData.status)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Route Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-green-600">From</h4>
                                                <p className="text-gray-600">
                                                    {trackingData.order.pickupAddress?.city}, {trackingData.order.pickupAddress?.state}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-600">To</h4>
                                                <p className="text-gray-600">
                                                    {trackingData.order.deliveryAddress?.city}, {trackingData.order.deliveryAddress?.state}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Information */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            {trackingData.currentLocation && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Current Location:</span>
                                                    <p className="text-gray-600">{trackingData.currentLocation}</p>
                                                </div>
                                            )}
                                            {trackingData.estimatedDelivery && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Estimated Delivery:</span>
                                                    <p className="text-gray-600">
                                                        {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                            {trackingData.actualDelivery && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Delivered On:</span>
                                                    <p className="text-green-600 font-medium">
                                                        {new Date(trackingData.actualDelivery).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tracking Updates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Tracking History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {trackingData.updates.length > 0 ? (
                                        <div className="space-y-4">
                                            {trackingData.updates
                                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                .map((update, index) => (
                                                    <div key={update.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                                                        <div className={`w-3 h-3 rounded-full mt-2 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                                                            }`} />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-gray-900">{update.status}</h4>
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(update.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 mt-1">{update.description}</p>
                                                            {update.location && (
                                                                <p className="text-sm text-gray-500 mt-1 flex items-center">
                                                                    <MapPin className="w-3 h-3 mr-1" />
                                                                    {update.location}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking updates yet</h3>
                                            <p className="text-gray-600">
                                                Tracking information will appear here once your package is processed.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            {isAuthenticated && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                        <div className="flex flex-wrap gap-3">
                                            <Link href={`/orders/${trackingData.orderId}`}>
                                                <Button variant="outline" className="flex items-center">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    View Order Details
                                                </Button>
                                            </Link>
                                            <Link href="/orders">
                                                <Button variant="outline" className="flex items-center">
                                                    <User className="w-4 h-4 mr-2" />
                                                    My Orders
                                                </Button>
                                            </Link>
                                            <Link href="/ship">
                                                <Button variant="outline" className="flex items-center">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    Ship Another Package
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Help Section */}
                    <Card className="mt-8">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Tracking Number Format</h4>
                                    <p className="text-gray-600">
                                        Tracking numbers are usually 10-15 characters long and may contain letters and numbers.
                                        Example: SPK123456789
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Update Frequency</h4>
                                    <p className="text-gray-600">
                                        Tracking information is updated every few hours. If you don&apos;t see recent updates,
                                        please check back later.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Missing Package?</h4>
                                    <p className="text-gray-600">
                                        If your package is delayed or missing, contact our support team with your tracking number
                                        for assistance.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Delivery Issues</h4>
                                    <p className="text-gray-600">
                                        If there are issues with delivery, our courier partner will attempt redelivery.
                                        Check tracking for updated delivery information.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
