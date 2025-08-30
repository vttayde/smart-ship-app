import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Check if webhook secret is available
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Webhook configuration not found' }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    console.warn('Webhook received:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;

      default:
        console.warn('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payment: { order_id: string; id: string }) {
  try {
    await prisma.payment.updateMany({
      where: {
        gatewayRef: payment.order_id,
      },
      data: {
        status: 'CAPTURED',
        razorpayPaymentId: payment.id,
        paidAt: new Date(),
      },
    });

    // Update order status
    const paymentRecord = await prisma.payment.findFirst({
      where: { gatewayRef: payment.order_id },
    });

    if (paymentRecord) {
      await prisma.order.update({
        where: { id: paymentRecord.orderId },
        data: { status: 'confirmed' },
      });
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: { order_id: string; id: string }) {
  try {
    await prisma.payment.updateMany({
      where: {
        gatewayRef: payment.order_id,
      },
      data: {
        status: 'FAILED',
        failureReason: 'Payment failed',
      },
    });
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(order: { id: string }) {
  try {
    await prisma.payment.updateMany({
      where: {
        gatewayRef: order.id,
      },
      data: {
        status: 'CAPTURED',
        paidAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}
