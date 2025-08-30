import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface Order {
  id: string;
  userId: string;
  courierPartnerId: string;
  pickupAddressId: string;
  deliveryAddressId: string;
  trackingNumber?: string;
  status: string;
  serviceType: string;
  parcelContents: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  declaredValue: number;
  totalAmount: number;
  paymentStatus: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
  pickupAddress?: Address;
  deliveryAddress?: Address;
  courierPartner?: CourierPartner;
  trackingUpdates?: TrackingUpdate[];
}

interface Address {
  id: string;
  type: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface CourierPartner {
  id: string;
  name: string;
  pricingModel?: Record<string, unknown>;
  coverageAreas?: Record<string, unknown>;
  rating: number;
  isActive: boolean;
}

interface TrackingUpdate {
  id: string;
  orderId: string;
  status: string;
  message: string;
  location: string;
  timestamp: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

interface CreateOrderData {
  pickupAddressId: string;
  deliveryAddressId: string;
  courierPartnerId: string;
  serviceType: string;
  parcelContents: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  declaredValue: number;
  deliveryInstructions?: string;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (orderData: CreateOrderData) => Promise<Order | null>;
  getOrder: (orderId: string) => Promise<Order | null>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

export const useOrders = (): UseOrdersReturn => {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
    if (!session) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      const newOrder = data.order;

      // Add to local state
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId: string): Promise<Order | null> => {
    if (!session) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      return data.order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
    if (!session) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      const data = await response.json();

      // Update local state
      setOrders(prev => prev.map(order => (order.id === orderId ? data.order : order)));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!session) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel order');
      }

      const data = await response.json();

      // Update local state
      setOrders(prev => prev.map(order => (order.id === orderId ? data.order : order)));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  // Fetch orders when session is available
  useEffect(() => {
    if (session) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return {
    orders,
    loading,
    error,
    createOrder,
    getOrder,
    updateOrder,
    cancelOrder,
    refreshOrders,
  };
};
