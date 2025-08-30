'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  orderDetails: {
    courierName: string;
    serviceType: string;
    weight: number;
    route: string;
  };
  onSuccess: (paymentId: string, orderId: string) => Promise<void>;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open: () => void;
      };
    };
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency,
  orderDetails,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Generate a temporary order ID for payment
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      // Create payment order
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          notes: {
            courierName: orderDetails.courierName,
            serviceType: orderDetails.serviceType,
            weight: orderDetails.weight,
            route: orderDetails.route,
            orderType: 'shipping',
          },
        }),
      });

      const { razorpayOrder } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Smart Ship',
        description: `Payment for ${orderDetails.courierName} shipping via ${orderDetails.serviceType}`,
        order_id: razorpayOrder.id,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              await onSuccess(response.razorpay_payment_id, orderId);
              onClose();
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        notes: {
          orderId,
          courierName: orderDetails.courierName,
          serviceType: orderDetails.serviceType,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initialize payment');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <Card className='w-full max-w-md mx-4 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Payment Details</h2>
          <Button variant='outline' size='sm' onClick={onClose} className='text-gray-500'>
            ×
          </Button>
        </div>

        <div className='space-y-4 mb-6'>
          <div>
            <h3 className='font-medium text-gray-900'>Order Summary</h3>
            <p className='text-sm text-gray-600'>Courier: {orderDetails.courierName}</p>
            <p className='text-sm text-gray-600'>Service: {orderDetails.serviceType}</p>
            <p className='text-sm text-gray-600'>Weight: {orderDetails.weight}kg</p>
            <p className='text-sm text-gray-600'>Route: {orderDetails.route}</p>
          </div>

          <div className='border-t pt-4'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Shipping Cost:</span>
              <span className='font-medium'>₹{amount}</span>
            </div>
            <div className='flex justify-between text-lg font-semibold mt-2'>
              <span>Total Amount:</span>
              <span>₹{amount}</span>
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <Button onClick={handlePayment} disabled={loading} className='w-full'>
            {loading ? 'Processing...' : `Pay ₹${amount}`}
          </Button>

          <Button variant='outline' onClick={onClose} className='w-full'>
            Cancel
          </Button>
        </div>

        <div className='mt-4 text-xs text-gray-500 text-center'>
          <p>Secure payment powered by Razorpay</p>
        </div>
      </Card>
    </div>
  );
}
