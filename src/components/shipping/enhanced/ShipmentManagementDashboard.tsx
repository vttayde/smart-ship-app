import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    Eye,
    Filter,
    MapPin,
    Package,
    RefreshCw,
    Search,
    TrendingUp,
    Truck
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface DashboardStats {
    totalShipments: number;
    activeShipments: number;
    deliveredToday: number;
    pendingPickups: number;
    totalRevenue: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    customerSatisfaction: number;
}

interface RecentShipment {
    id: string;
    trackingNumber: string;
    customerName: string;
    destination: string;
    status: string;
    courierName: string;
    estimatedDelivery: Date;
    value: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface CourierPerformance {
    courierName: string;
    totalShipments: number;
    onTimeRate: number;
    averageDeliveryTime: number;
    rating: number;
    cost: number;
}

interface AlertItem {
    id: string;
    type: 'delay' | 'failed_delivery' | 'exception' | 'urgent';
    message: string;
    shipmentId: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
}

export default function ShipmentManagementDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
    const [courierPerformance, setCourierPerformance] = useState<CourierPerformance[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch dashboard stats
            const statsResponse = await fetch(`/api/dashboard/stats?timeRange=${selectedTimeRange}`);
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Fetch recent shipments
            const shipmentsResponse = await fetch('/api/dashboard/recent-shipments?limit=10');
            if (shipmentsResponse.ok) {
                const shipmentsData = await shipmentsResponse.json();
                setRecentShipments(shipmentsData);
            }

            // Fetch courier performance
            const performanceResponse = await fetch(`/api/dashboard/courier-performance?timeRange=${selectedTimeRange}`);
            if (performanceResponse.ok) {
                const performanceData = await performanceResponse.json();
                setCourierPerformance(performanceData);
            }

            // Fetch alerts
            const alertsResponse = await fetch('/api/dashboard/alerts?limit=5');
            if (alertsResponse.ok) {
                const alertsData = await alertsResponse.json();
                setAlerts(alertsData);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedTimeRange]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(date));
    };

    const getStatusColor = (status: string): "default" | "warning" | "info" | "success" | "destructive" | "secondary" | "outline" => {
        const colors: { [key: string]: "default" | "warning" | "info" | "success" | "destructive" | "secondary" | "outline" } = {
            'pending': 'warning',
            'confirmed': 'info',
            'picked_up': 'info',
            'in_transit': 'default',
            'out_for_delivery': 'info',
            'delivered': 'success',
            'cancelled': 'destructive',
            'returned': 'secondary'
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority: string): "default" | "warning" | "info" | "success" | "destructive" | "secondary" | "outline" => {
        const colors: { [key: string]: "default" | "warning" | "info" | "success" | "destructive" | "secondary" | "outline" } = {
            'low': 'secondary',
            'medium': 'warning',
            'high': 'info',
            'urgent': 'destructive'
        };
        return colors[priority] || 'default';
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'delay':
                return <Clock className="w-4 h-4" />;
            case 'failed_delivery':
                return <AlertTriangle className="w-4 h-4" />;
            case 'exception':
                return <AlertTriangle className="w-4 h-4" />;
            case 'urgent':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const filteredShipments = recentShipments.filter(shipment =>
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Shipment Management Dashboard</h1>
                    <p className="text-gray-600">Monitor and manage your shipping operations</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="1d">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 3 Months</option>
                    </select>
                    <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Shipments</p>
                                    <p className="text-2xl font-bold">{stats.totalShipments.toLocaleString()}</p>
                                </div>
                                <Package className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 ml-1">+12% from last period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Shipments</p>
                                    <p className="text-2xl font-bold">{stats.activeShipments.toLocaleString()}</p>
                                </div>
                                <Truck className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-600">
                                    {stats.pendingPickups} pending pickups
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex items-center mt-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 ml-1">+8% from last period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">On-Time Delivery</p>
                                    <p className="text-2xl font-bold">{stats.onTimeDeliveryRate}%</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-600">
                                    Avg: {stats.averageDeliveryTime}h delivery time
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Alerts & Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="text-orange-600">
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{alert.message}</div>
                                            <div className="text-sm text-gray-600">
                                                Shipment: {alert.shipmentId} • {formatDate(alert.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'warning'}>
                                        {alert.severity.toUpperCase()}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Shipments */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Shipments</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search shipments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-64"
                                    />
                                </div>
                                <Button variant="outline" size="sm">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredShipments.slice(0, 8).map((shipment) => (
                                <div key={shipment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono font-medium text-sm">{shipment.trackingNumber}</span>
                                            <Badge variant={getPriorityColor(shipment.priority)}>
                                                {shipment.priority.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {shipment.customerName} → {shipment.destination}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-gray-500">{shipment.courierName}</span>
                                            <span className="text-xs text-gray-500">
                                                ETA: {formatDate(shipment.estimatedDelivery)}
                                            </span>
                                            <span className="text-xs font-medium">{formatCurrency(shipment.value)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getStatusColor(shipment.status)}>
                                            {shipment.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Courier Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Courier Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {courierPerformance.map((courier) => (
                                <div key={courier.courierName} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{courier.courierName}</span>
                                            <Badge variant="outline">{courier.totalShipments} shipments</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{courier.onTimeRate}%</span>
                                            <span className="text-xs text-gray-500">
                                                {courier.averageDeliveryTime}h avg
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${courier.onTimeRate >= 90 ? 'bg-green-500' :
                                                        courier.onTimeRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${courier.onTimeRate}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">{formatCurrency(courier.cost)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button className="h-20 flex flex-col items-center justify-center">
                            <Package className="w-6 h-6 mb-2" />
                            <span>Create Shipment</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                            <MapPin className="w-6 h-6 mb-2" />
                            <span>Bulk Track</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                            <BarChart3 className="w-6 h-6 mb-2" />
                            <span>Analytics</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                            <Download className="w-6 h-6 mb-2" />
                            <span>Reports</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
