import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export interface StripeCustomerData {
  email: string
  name?: string
  metadata?: Record<string, string>
}

export interface StripeSubscriptionData {
  customerId: string
  priceId: string
  metadata?: Record<string, string>
}

// Create Stripe customer
export async function createStripeCustomer(
  userId: string,
  data: StripeCustomerData
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: {
        userId,
        ...data.metadata,
      },
    })

    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

// Create subscription
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata,
    })

    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

// Create payment intent
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Update subscription
export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<Stripe.SubscriptionUpdateParams>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updates)
    return subscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}

// Get subscription
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
}

// Get customer
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return customer
  } catch (error) {
    console.error('Error retrieving customer:', error)
    throw error
  }
}

// Create checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret)
    return event
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    throw error
  }
}

// Handle subscription created event
export async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  try {
    const userId = subscription.metadata?.userId
    if (!userId) {
      console.warn('No userId in subscription metadata')
      return
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { userId },
      data: {
        tier: 'pro',
        status: 'active',
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        queriesLimit: 999999, // Unlimited
        expiresAt: new Date((subscription.current_period_end || 0) * 1000),
      },
    })

    console.log(`Subscription created for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
    throw error
  }
}

// Handle subscription updated event
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  try {
    const userId = subscription.metadata?.userId
    if (!userId) {
      console.warn('No userId in subscription metadata')
      return
    }

    const status = subscription.status === 'active' ? 'active' : 'cancelled'

    // Update subscription in database
    await prisma.subscription.update({
      where: { userId },
      data: {
        status,
        expiresAt: new Date((subscription.current_period_end || 0) * 1000),
      },
    })

    console.log(`Subscription updated for user ${userId}: ${status}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    throw error
  }
}

// Handle subscription deleted event
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  try {
    const userId = subscription.metadata?.userId
    if (!userId) {
      console.warn('No userId in subscription metadata')
      return
    }

    // Downgrade to free tier
    await prisma.subscription.update({
      where: { userId },
      data: {
        tier: 'free',
        status: 'cancelled',
        queriesLimit: 5,
        queriesUsed: 0,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    })

    console.log(`Subscription deleted for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
    throw error
  }
}

// Handle payment intent succeeded event
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    const userId = paymentIntent.metadata?.userId
    if (!userId) {
      console.warn('No userId in payment intent metadata')
      return
    }

    console.log(`Payment succeeded for user ${userId}`)
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
    throw error
  }
}

// Handle payment intent failed event
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    const userId = paymentIntent.metadata?.userId
    if (!userId) {
      console.warn('No userId in payment intent metadata')
      return
    }

    console.log(`Payment failed for user ${userId}`)
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
    throw error
  }
}
