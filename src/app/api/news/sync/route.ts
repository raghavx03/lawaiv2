import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('Manual news sync triggered')
    
    // Check database connection
    if (!prisma) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    
    // Get a sample user for storing news
    const sampleUser = await prisma.userApp.findFirst()
    if (!sampleUser) {
      return NextResponse.json({ error: 'No users found' }, { status: 400 })
    }

    const savedCount = 0 // Placeholder for news sync

    return NextResponse.json({ 
      success: true,
      message: `Synced ${savedCount} new articles`,
      savedCount 
    })
  } catch (error) {
    console.error('News sync error:', error)
    return NextResponse.json({ 
      error: 'News sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check database connection
    if (!prisma) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }

    // Get news statistics
    const totalNews = await prisma.news.count()
    const todayNews = await prisma.news.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const sources = await prisma.news.groupBy({
      by: ['source'],
      _count: { source: true }
    })

    return NextResponse.json({
      totalNews,
      todayNews,
      sources: sources.map(s => ({ source: s.source, count: s._count.source }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get news stats' }, { status: 500 })
  }
}