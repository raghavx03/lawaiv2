import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsMetrics } from '@/lib/analytics-service'

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000
let cachedMetrics: any = null
let cacheTime = 0

export async function GET(request: NextRequest) {
  try {
    // Check cache
    const now = Date.now()
    if (cachedMetrics && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedMetrics, {
        headers: {
          'Cache-Control': 'public, max-age=300',
        },
      })
    }

    // Fetch fresh metrics
    const metrics = await getAnalyticsMetrics()

    // Cache the result
    cachedMetrics = metrics
    cacheTime = now

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
