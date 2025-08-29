'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: string;
        trackingNumber: string;
        totalCost: number;
        pickupAddress: string;
        deliveryAddress: string;
    };
    onPaymentSuccess: (paymentId: string) => void;
}

declare global {
    interface Window {
        Razorpay: {
            new(options: any): {
                open: () => void;
            };
        };
    }
}

export default function PaymentModal({
    isOpen,
    onClose,
    order,
    onPaymentSuccess
}: PaymentModalProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);

        try {
            // Create payment order
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order.id,
                    amount: order.totalCost,
                    currency: 'INR',
                    notes: {
                        trackingNumber: order.trackingNumber,
                        orderType: 'shipping',
                    },
                }),
            });

            const { payment, razorpayOrder } = await response.json();

            if (!response.ok) {
                throw new Error('Failed to create payment');
            }

            // Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'Smart Ship',
                description: `Payment for Order ${order.trackingNumber}`,
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
                            onPaymentSuccess(payment.id);
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
                    orderId: order.id,
                    trackingNumber: order.trackingNumber,
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Payment Details</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500"
                    >
                        ×
                    </Button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <h3 className="font-medium text-gray-900">Order Summary</h3>
                        <p className="text-sm text-gray-600">
                            Tracking: {order.trackingNumber}
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Shipping Cost:</span>
                            <span className="font-medium">₹{order.totalCost}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold mt-2">
                            <span>Total Amount:</span>
                            <span>₹{order.totalCost}</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500">
                        <p>Pickup: {order.pickupAddress}</p>
                        <p>Delivery: {order.deliveryAddress}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Processing...' : `Pay ₹${order.totalCost}`}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </div>

                <div className="mt-4 text-xs text-gray-500 text-center">
                    <p>Secure payment powered by Razorpay</p>
                </div>
            </Card>
        </div>
    );
}
