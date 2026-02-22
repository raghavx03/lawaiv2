import { NextRequest, NextResponse } from 'next/server'
import { getTimeSeriesData } from '@/lib/analytics-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')

    const data = await getTimeSeriesData(Math.min(days, 90))

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('Timeseries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeseries data' },
      { status: 500 }
    )
  }
}
