import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const prisma = new PrismaClient();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, currency = 'INR', notes = {} } = await request.json();

    // Validate required fields
    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Order ID and amount are required' }, { status: 400 });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId,
        ...notes,
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: amount * 100, // Store in paise
        status: 'pending',
        gateway: 'razorpay',
        gatewayRef: razorpayOrder.id,
      } as any,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: payment.status,
      },
      razorpayOrder,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
