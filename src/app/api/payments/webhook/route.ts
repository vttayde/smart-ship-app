import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
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
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handlePaymentCaptured(payment: { order_id: string; id: string }) {
    try {
        await prisma.payment.updateMany({
            where: {
                gatewayRef: payment.order_id,
            },
            data: {
                status: 'completed',
            } as any,
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
                status: 'failed',
            } as any,
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
                status: 'completed',
            } as any,
        });
    } catch (error) {
        console.error('Error handling order paid:', error);
    }
}
