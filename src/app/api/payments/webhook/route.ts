import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    
    // Handle different payment events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentSuccess(event.payload.payment.entity)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break
      
      default:
        console.log('Unhandled event:', event.event)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(payment: any) {
  try {
    // Update user subscription in database
    console.log('Payment successful:', payment.id)
    
    // Add your database update logic here
    // Example: Update user plan, extend subscription, etc.
    
  } catch (error) {
    console.error('Payment success handler error:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log('Payment failed:', payment.id)
    
    // Add your failure handling logic here
    // Example: Send notification, log failure, etc.
    
  } catch (error) {
    console.error('Payment failure handler error:', error)
  }
}