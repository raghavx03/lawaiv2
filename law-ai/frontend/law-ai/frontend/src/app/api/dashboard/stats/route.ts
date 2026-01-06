import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return fallback stats when database is unavailable
    const fallbackStats = {
      totalCases: 0,
      totalResearch: 0,
      totalChats: 0,
      totalDrafts: 0,
      dbConnected: false
    }

    return NextResponse.json(fallbackStats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { 
        totalCases: 0,
        totalResearch: 0,
        totalChats: 0,
        totalDrafts: 0,
        dbConnected: false
      },
      { status: 200 }
    )
  }
}