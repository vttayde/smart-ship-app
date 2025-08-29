import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { gatewayRef: razorpay_order_id },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
        } as any,
      });

      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update payment status to captured
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
      } as any,
    });

    // Update order status to confirmed
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'confirmed',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
