import { NextResponse } from 'next/server'
import { newsScheduler } from '@/lib/news-scheduler'

export async function POST() {
  try {
    newsScheduler.start()
    return NextResponse.json({ 
      success: true, 
      message: 'News scheduler started' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to start scheduler' 
    }, { status: 500 })
  }
}