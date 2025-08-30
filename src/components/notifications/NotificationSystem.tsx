'use client';

import { usePWA } from '@/components/pwa/PWAProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    Bell,
    CheckCircle,
    Clock,
    DollarSign,
    Info,
    Package,
    Settings,
    Truck,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface NotificationData {
    id: string;
    type: 'delivery' | 'payment' | 'system' | 'promotion' | 'alert';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    actionText?: string;
    metadata?: {
        shipmentId?: string;
        trackingId?: string;
        amount?: number;
        courier?: string;
        estimatedDelivery?: string;
    };
}

interface NotificationSystemProps {
    className?: string;
}

export default function NotificationSystem({ className = '' }: NotificationSystemProps) {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const [notificationPermission, setNotificationPermission] =
        useState<NotificationPermission>('default');
    const { requestNotificationPermission, showNotification, isOnline } = usePWA();

    // Mock data for demonstration
    const mockNotifications: NotificationData[] = useMemo(() => [
        {
            id: '1',
            type: 'delivery',
            title: 'Package Delivered!',
            message: 'Your shipment #SH-2024-001 has been successfully delivered to John Smith.',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            priority: 'high',
            metadata: {
                shipmentId: 'SH-2024-001',
                recipient: 'John Smith',
                location: 'New York, NY',
            },
        },
        {
            id: '2',
            type: 'update',
            title: 'Shipment Update',
            message: 'Your shipment #SH-2024-002 is out for delivery and will arrive today.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            priority: 'medium',
            metadata: {
                shipmentId: 'SH-2024-002',
                estimatedDelivery: 'Today by 6 PM',
                currentLocation: 'Local Distribution Center',
            },
        },
        {
            id: '3',
            type: 'alert',
            title: 'Delivery Exception',
            message: 'Unable to deliver shipment #SH-2024-003. Customer not available.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            priority: 'high',
            metadata: {
                shipmentId: 'SH-2024-003',
                reason: 'Customer not available',
                nextAttempt: 'Tomorrow 10 AM',
            },
        },
        {
            id: '4',
            type: 'system',
            title: 'System Maintenance',
            message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM EST.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            priority: 'low',
            metadata: {
                duration: '2 hours',
                affectedServices: 'Tracking updates may be delayed',
            },
        },
    ], []);

    const simulateNewNotification = useCallback(() => {
        const newNotification: NotificationData = {
            id: `notification-${Date.now()}`,
            type: 'delivery',
            title: 'Package Update',
            message: `Your package is now out for delivery and will arrive within 2 hours`,
            timestamp: new Date(),
            read: false,
            priority: 'medium',
            actionUrl: '/tracking/live',
            actionText: 'Track Live',
            metadata: {
                shipmentId: `SH-${Date.now()}`,
                courier: 'Smart Logistics',
            },
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show push notification if permission granted
        if (notificationPermission === 'granted') {
            showNotification(newNotification.title, {
                body: newNotification.message,
                data: { url: newNotification.actionUrl },
                requireInteraction: newNotification.priority === 'urgent',
            });
        }
    }, [notificationPermission, showNotification]);

    useEffect(() => {
        // Load notifications (in real app, this would be from API)
        setNotifications(mockNotifications);

        // Check notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        // Set up real-time notifications (mock)
        const interval = setInterval(() => {
            if (Math.random() > 0.95) {
                // 5% chance every 5 seconds
                simulateNewNotification();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [simulateNewNotification, mockNotifications]);

    useEffect(() => {
        // Update unread count
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
    }, [notifications]);

    const requestPermission = async () => {
        const granted = await requestNotificationPermission();
        setNotificationPermission(granted ? 'granted' : 'denied');
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getNotificationIcon = (type: NotificationData['type']) => {
        switch (type) {
            case 'delivery':
                return <Truck className='w-5 h-5 text-blue-600' />;
            case 'payment':
                return <DollarSign className='w-5 h-5 text-green-600' />;
            case 'system':
                return <Settings className='w-5 h-5 text-gray-600' />;
            case 'promotion':
                return <Package className='w-5 h-5 text-purple-600' />;
            case 'alert':
                return <AlertCircle className='w-5 h-5 text-red-600' />;
            default:
                return <Info className='w-5 h-5 text-blue-600' />;
        }
    };

    const getPriorityColor = (priority: NotificationData['priority']) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTime = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className={`relative ${className}`}>
            {/* Notification Bell */}
            <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowPanel(!showPanel)}
                className='relative p-2'
            >
                <Bell className='w-5 h-5' />
                {unreadCount > 0 && (
                    <Badge className='absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs bg-red-500 text-white rounded-full'>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Notification Panel */}
            {showPanel && (
                <div className='absolute top-full right-0 mt-2 w-96 max-h-[600px] bg-white border rounded-lg shadow-lg z-50'>
                    {/* Header */}
                    <div className='flex items-center justify-between p-4 border-b'>
                        <div className='flex items-center space-x-2'>
                            <Bell className='w-5 h-5 text-gray-600' />
                            <h3 className='font-semibold text-gray-900'>Notifications</h3>
                            {unreadCount > 0 && <Badge variant='secondary'>{unreadCount} new</Badge>}
                        </div>
                        <div className='flex items-center space-x-2'>
                            {unreadCount > 0 && (
                                <Button variant='ghost' size='sm' onClick={markAllAsRead}>
                                    <CheckCircle className='w-4 h-4 mr-1' />
                                    Mark all read
                                </Button>
                            )}
                            <Button variant='ghost' size='sm' onClick={() => setShowPanel(false)}>
                                <X className='w-4 h-4' />
                            </Button>
                        </div>
                    </div>

                    {/* Permission Request */}
                    {notificationPermission === 'default' && (
                        <div className='p-4 bg-blue-50 border-b'>
                            <div className='flex items-start space-x-3'>
                                <Info className='w-5 h-5 text-blue-600 mt-0.5' />
                                <div className='flex-1'>
                                    <h4 className='font-medium text-blue-900'>Enable Notifications</h4>
                                    <p className='text-sm text-blue-700 mt-1'>
                                        Get instant updates about your shipments and important alerts.
                                    </p>
                                    <Button variant='default' size='sm' onClick={requestPermission} className='mt-2'>
                                        Enable Notifications
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Offline Indicator */}
                    {!isOnline && (
                        <div className='p-3 bg-yellow-50 border-b'>
                            <div className='flex items-center space-x-2'>
                                <div className='w-2 h-2 bg-yellow-500 rounded-full' />
                                <span className='text-sm text-yellow-800'>
                                    Offline - Some notifications may be delayed
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className='max-h-96 overflow-y-auto'>
                        {notifications.length === 0 ? (
                            <div className='p-8 text-center'>
                                <Bell className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                                <p className='text-gray-500'>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className='flex items-start space-x-3'>
                                        <div className='flex-shrink-0 mt-1'>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-start justify-between'>
                                                <div className='flex-1'>
                                                    <h4
                                                        className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                                                    >
                                                        {notification.title}
                                                    </h4>
                                                    <p className='text-sm text-gray-600 mt-1'>{notification.message}</p>
                                                </div>

                                                <div className='flex items-center space-x-2 ml-3'>
                                                    {!notification.read && (
                                                        <div className='w-2 h-2 bg-blue-600 rounded-full' />
                                                    )}
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className='p-1 h-auto opacity-0 group-hover:opacity-100'
                                                    >
                                                        <X className='w-3 h-3' />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className='flex items-center justify-between mt-3'>
                                                <div className='flex items-center space-x-2'>
                                                    <span className='text-xs text-gray-500'>
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                    <Badge
                                                        variant='secondary'
                                                        className={`text-xs ${getPriorityColor(notification.priority)}`}
                                                    >
                                                        {notification.priority}
                                                    </Badge>
                                                </div>

                                                {notification.actionUrl && notification.actionText && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            window.location.href = notification.actionUrl!;
                                                        }}
                                                        className='text-xs'
                                                    >
                                                        {notification.actionText}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Metadata */}
                                            {notification.metadata && (
                                                <div className='mt-2 flex flex-wrap gap-2'>
                                                    {notification.metadata.shipmentId && (
                                                        <div className='flex items-center text-xs text-gray-500'>
                                                            <Package className='w-3 h-3 mr-1' />
                                                            {notification.metadata.shipmentId}
                                                        </div>
                                                    )}
                                                    {notification.metadata.courier && (
                                                        <div className='flex items-center text-xs text-gray-500'>
                                                            <Truck className='w-3 h-3 mr-1' />
                                                            {notification.metadata.courier}
                                                        </div>
                                                    )}
                                                    {notification.metadata.estimatedDelivery && (
                                                        <div className='flex items-center text-xs text-gray-500'>
                                                            <Clock className='w-3 h-3 mr-1' />
                                                            {notification.metadata.estimatedDelivery}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className='p-3 border-t bg-gray-50'>
                        <Button
                            variant='ghost'
                            size='sm'
                            className='w-full text-xs'
                            onClick={() => (window.location.href = '/notifications')}
                        >
                            View All Notifications
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
