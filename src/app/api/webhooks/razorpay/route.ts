export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

const processedEvents = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const eventId = event.event + '_' + event.payload.payment.entity.id

    // Idempotency check
    if (processedEvents.has(eventId)) {
      return NextResponse.json({ status: 'already_processed' })
    }

    processedEvents.add(eventId)

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id

      // Find the payment record
      const paymentRecord = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
      })

      if (!paymentRecord) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: paymentId
        }
      })

      // Update user plan
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1) // 1 month from now

      await prisma.userApp.update({
        where: { userId: paymentRecord.userId },
        data: {
          plan: paymentRecord.plan,
          expiryDate
        }
      })

    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity
      const orderId = payment.order_id

      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: 'FAILED' }
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}