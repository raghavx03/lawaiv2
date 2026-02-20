import { prisma } from '@/lib/prisma'

export interface SubscriptionData {
  userId: string
  tier: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired'
  queriesLimit: number
}

// Create or get subscription for user
export async function getOrCreateSubscription(userId: string) {
  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) {
      // Create free tier subscription
      subscription = await prisma.subscription.create({
        data: {
          userId,
          tier: 'free',
          status: 'active',
          queriesUsed: 0,
          queriesLimit: 5,
        },
      })
    }

    return subscription
  } catch (error) {
    console.error('Error getting/creating subscription:', error)
    throw error
  }
}

// Check if user can perform query
export async function canPerformQuery(userId: string): Promise<boolean> {
  try {
    const subscription = await getOrCreateSubscription(userId)

    // Check if subscription is active
    if (subscription.status !== 'active') {
      return false
    }

    // Check if expired
    if (subscription.expiresAt && new Date() > subscription.expiresAt) {
      return false
    }

    // Pro tier has unlimited queries
    if (subscription.tier === 'pro' || subscription.tier === 'enterprise') {
      return true
    }

    // Free tier: check daily limit
    if (subscription.tier === 'free') {
      // Reset daily count at midnight
      const now = new Date()
      const lastReset = subscription.lastResetAt ? new Date(subscription.lastResetAt) : null

      if (!lastReset || lastReset.toDateString() !== now.toDateString()) {
        // Reset the counter
        await prisma.subscription.update({
          where: { userId },
          data: {
            queriesUsed: 0,
            lastResetAt: now,
          },
        })
        return true
      }

      // Check if within daily limit
      return subscription.queriesUsed < subscription.queriesLimit
    }

    return false
  } catch (error) {
    console.error('Error checking query permission:', error)
    throw error
  }
}

// Increment query count
export async function incrementQueryCount(userId: string): Promise<void> {
  try {
    const subscription = await getOrCreateSubscription(userId)

    // Only increment for free tier (pro has unlimited)
    if (subscription.tier === 'free') {
      await prisma.subscription.update({
        where: { userId },
        data: {
          queriesUsed: subscription.queriesUsed + 1,
        },
      })
    }
  } catch (error) {
    console.error('Error incrementing query count:', error)
    throw error
  }
}

// Upgrade subscription
export async function upgradeSubscription(
  userId: string,
  tier: 'pro' | 'enterprise',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  try {
    const queriesLimit = tier === 'pro' ? 999999 : 999999 // Unlimited

    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        tier,
        status: 'active',
        queriesLimit,
        queriesUsed: 0,
        stripeCustomerId,
        stripeSubscriptionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    return subscription
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    throw error
  }
}

// Cancel subscription
export async function cancelSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.update({
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

    return subscription
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}

// Get subscription details
export async function getSubscription(userId: string) {
  try {
    return await getOrCreateSubscription(userId)
  } catch (error) {
    console.error('Error getting subscription:', error)
    throw error
  }
}

// Get remaining queries for free tier
export async function getRemainingQueries(userId: string): Promise<number> {
  try {
    const subscription = await getOrCreateSubscription(userId)

    if (subscription.tier !== 'free') {
      return 999999 // Unlimited
    }

    // Check if we need to reset
    const now = new Date()
    const lastReset = subscription.lastResetAt ? new Date(subscription.lastResetAt) : null

    if (!lastReset || lastReset.toDateString() !== now.toDateString()) {
      // Reset the counter
      await prisma.subscription.update({
        where: { userId },
        data: {
          queriesUsed: 0,
          lastResetAt: now,
        },
      })
      return subscription.queriesLimit
    }

    return Math.max(0, subscription.queriesLimit - subscription.queriesUsed)
  } catch (error) {
    console.error('Error getting remaining queries:', error)
    throw error
  }
}
