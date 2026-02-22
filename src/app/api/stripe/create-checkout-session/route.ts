import { NextRequest, NextResponse } from 'next/server'
import { createStripeCustomer, createCheckoutSession } from '@/lib/stripe-service'
import { getOrCreateSubscription } from '@/lib/subscription-service'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name, priceId, successUrl, cancelUrl } = body

    // Validate input
    if (!userId || !email || !priceId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, priceId' },
        { status: 400 }
      )
    }

    // Get or create subscription
    const subscription = await getOrCreateSubscription(userId)

    // Check if already has active pro subscription
    if (subscription.tier === 'pro' && subscription.status === 'active') {
      return NextResponse.json(
        { error: 'User already has an active Pro subscription' },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    let stripeCustomerId = subscription.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(userId, {
        email,
        name,
        metadata: {
          userId,
        },
      })
      stripeCustomerId = customer.id

      // Update subscription with Stripe customer ID
      await prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId },
      })
    }

    // Create checkout session
    const session = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/contract-analyzer?success=true`,
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
      {
        userId,
      }
    )

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
