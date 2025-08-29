import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    Bell,
    CheckCircle,
    Download,
    ExternalLink,
    MapPin,
    Package,
    RefreshCw,
    Search,
    Truck
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface TrackingUpdate {
    status: string;
    timestamp: Date;
    location?: string;
    description: string;
    isCurrentStatus: boolean;
}

interface ShipmentData {
    id: string;
    trackingNumber: string;
    currentStatus: string;
    courierName: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    origin: string;
    destination: string;
}

interface TrackingData {
    success: boolean;
    shipment: ShipmentData;
    timeline: TrackingUpdate[];
    liveUpdates?: TrackingUpdate[];
    metadata: {
        lastUpdated: Date;
        totalStops: number;
        isDelivered: boolean;
        canCancel: boolean;
        labelUrl?: string;
    };
    deliveryProgress: number;
    statusDescription: string;
    nextSteps: string[];
}

interface RealTimeTrackingDashboardProps {
    trackingNumber?: string;
    orderId?: string;
    showSearch?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number; // in seconds
}

export default function RealTimeTrackingDashboard({
    trackingNumber: initialTrackingNumber,
    orderId,
    showSearch = true,
    autoRefresh = true,
    refreshInterval = 30
}: RealTimeTrackingDashboardProps) {
    const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);

    const fetchTrackingData = useCallback(async (silent = false) => {
        if (!trackingNumber && !orderId) {
            setError('Please enter a tracking number');
            return;
        }

        if (!silent) {
            setLoading(true);
            setError(null);
        }

        try {
            const params = new URLSearchParams();
            if (trackingNumber) params.append('trackingNumber', trackingNumber);
            if (orderId) params.append('orderId', orderId);
            params.append('includeRealTime', 'true');

            const response = await fetch(`/api/tracking/enhanced?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch tracking data');
            }

            const data: TrackingData = await response.json();
            setTrackingData(data);
            setLastRefresh(new Date());
        } catch (err) {
            if (!silent) {
                setError(err instanceof Error ? err.message : 'Failed to fetch tracking data');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [trackingNumber, orderId]);

    useEffect(() => {
        if (initialTrackingNumber || orderId) {
            fetchTrackingData();
        }
    }, [fetchTrackingData, initialTrackingNumber, orderId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (autoRefreshEnabled && trackingData && !trackingData.metadata.isDelivered) {
            interval = setInterval(() => {
                fetchTrackingData(true); // Silent refresh
            }, refreshInterval * 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRefreshEnabled, trackingData, refreshInterval, fetchTrackingData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackingNumber.trim()) {
            fetchTrackingData();
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(timestamp));
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'pending': 'text-yellow-600 bg-yellow-100',
            'confirmed': 'text-blue-600 bg-blue-100',
            'pickup_scheduled': 'text-purple-600 bg-purple-100',
            'picked_up': 'text-indigo-600 bg-indigo-100',
            'in_transit': 'text-orange-600 bg-orange-100',
            'out_for_delivery': 'text-blue-600 bg-blue-100',
            'delivered': 'text-green-600 bg-green-100',
            'cancelled': 'text-red-600 bg-red-100',
            'returned': 'text-gray-600 bg-gray-100'
        };
        return colors[status] || 'text-gray-600 bg-gray-100';
    };

    const getProgressSteps = () => {
        interface ProgressStep {
            key: string;
            label: string;
            icon: typeof CheckCircle;
            isCompleted?: boolean;
            isActive?: boolean;
        }

        const steps: ProgressStep[] = [
            { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { key: 'picked_up', label: 'Picked Up', icon: Package },
            { key: 'in_transit', label: 'In Transit', icon: Truck },
            { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle }
        ];

        if (!trackingData) return steps;

        const currentStatusIndex = steps.findIndex(step => step.key === trackingData.shipment.currentStatus);

        return steps.map((step, index) => ({
            ...step,
            isCompleted: index <= currentStatusIndex,
            isActive: index === currentStatusIndex
        }));
    };

    return (
        <div className="space-y-6">
            {/* Search Section */}
            {showSearch && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Track Your Shipment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Enter tracking number..."
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {trackingData && (
                <>
                    {/* Shipment Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Shipment Details
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {lastRefresh && (
                                        <span className="text-sm text-gray-500">
                                            Last updated: {formatTimestamp(lastRefresh)}
                                        </span>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchTrackingData()}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                                    >
                                        <Bell className={`w-4 h-4 ${autoRefreshEnabled ? 'text-blue-600' : ''}`} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500">Tracking Number</div>
                                    <div className="font-mono font-semibold">{trackingData.shipment.trackingNumber}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Courier</div>
                                    <div className="font-medium">{trackingData.shipment.courierName}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Status</div>
                                    <Badge className={getStatusColor(trackingData.shipment.currentStatus)}>
                                        {trackingData.shipment.currentStatus.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Progress</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${trackingData.deliveryProgress}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">{trackingData.deliveryProgress}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500">Route</div>
                                    <div className="font-medium">
                                        {trackingData.shipment.origin} → {trackingData.shipment.destination}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Expected Delivery</div>
                                    <div className="font-medium">
                                        {trackingData.shipment.estimatedDelivery
                                            ? formatTimestamp(trackingData.shipment.estimatedDelivery)
                                            : 'TBD'
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Status Description */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="text-blue-800 font-medium">{trackingData.statusDescription}</div>
                            </div>

                            {/* Next Steps */}
                            {trackingData.nextSteps.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Next Steps:</div>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {trackingData.nextSteps.map((step, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {getProgressSteps().map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center">
                                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2 ${step.isCompleted
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : step.isActive
                                                        ? 'border-blue-500 bg-blue-500 text-white'
                                                        : 'border-gray-300 bg-white text-gray-400'
                                                }`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className={`text-xs text-center ${step.isCompleted ? 'text-green-600' : step.isActive ? 'text-blue-600' : 'text-gray-400'
                                                }`}>
                                                {step.label}
                                            </div>
                                            {index < getProgressSteps().length - 1 && (
                                                <div className={`absolute w-full h-0.5 top-6 left-1/2 ${step.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                                    }`} style={{ transform: 'translateX(50%)', width: 'calc(100% - 3rem)' }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {trackingData.timeline.map((update, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${update.isCurrentStatus ? 'bg-blue-600' : 'bg-gray-300'
                                                }`} />
                                            {index < trackingData.timeline.length - 1 && (
                                                <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-medium">{update.description}</div>
                                                <div className="text-sm text-gray-500">
                                                    {formatTimestamp(update.timestamp)}
                                                </div>
                                            </div>
                                            {update.location && (
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {update.location}
                                                </div>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className={`mt-1 text-xs ${getStatusColor(update.status)}`}
                                            >
                                                {update.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                                {trackingData.metadata.canCancel && (
                                    <Button variant="outline" size="sm">
                                        Cancel Shipment
                                    </Button>
                                )}
                                {trackingData.metadata.labelUrl && (
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Label
                                    </Button>
                                )}
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Track on Courier Site
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Bell className="w-4 h-4 mr-2" />
                                    Setup Notifications
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {loading && !trackingData && (
                <div className="text-center py-12">
                    <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <div className="text-lg font-medium">Loading tracking information...</div>
                </div>
            )}
        </div>
    );
}
