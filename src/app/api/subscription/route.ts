import { NextRequest, NextResponse } from 'next/server'
import { getSubscription, upgradeSubscription, cancelSubscription } from '@/lib/subscription-service'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const subscription = await getSubscription(userId)

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, tier, stripeCustomerId, stripeSubscriptionId } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action' },
        { status: 400 }
      )
    }

    if (action === 'upgrade') {
      if (!tier) {
        return NextResponse.json(
          { error: 'Missing tier for upgrade action' },
          { status: 400 }
        )
      }

      const subscription = await upgradeSubscription(
        userId,
        tier,
        stripeCustomerId,
        stripeSubscriptionId
      )

      return NextResponse.json(subscription)
    } else if (action === 'cancel') {
      const subscription = await cancelSubscription(userId)
      return NextResponse.json(subscription)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Subscription action error:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription action' },
      { status: 500 }
    )
  }
}
