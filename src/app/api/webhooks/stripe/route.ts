export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 400 })
    }

    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Stripe webhook verification would go here
    // const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)

    // For now, parse the body directly (replace with proper Stripe verification)
    const event = JSON.parse(body)

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Find payment record and update
        const paymentRecord = await prisma.payment.findFirst({
          where: { 
            razorpayOrderId: session.metadata?.orderId || session.id
          }
        })

        if (paymentRecord) {
          await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              status: 'PAID',
              razorpayPaymentId: session.id
            }
          })

          // Update user plan
          const expiryDate = new Date()
          expiryDate.setMonth(expiryDate.getMonth() + 1)

          await prisma.userApp.update({
            where: { userId: paymentRecord.userId },
            data: {
              plan: paymentRecord.plan,
              expiryDate
            }
          })
        }
        break

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object
        
        await prisma.payment.updateMany({
          where: { 
            razorpayOrderId: paymentIntent.metadata?.orderId || paymentIntent.id
          },
          data: { status: 'FAILED' }
        })
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}