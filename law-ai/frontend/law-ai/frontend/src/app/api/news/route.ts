export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { sanitizeForLog } from '@/lib/security/log-sanitizer'
import { hasFeatureAccess } from '@/lib/feature-access'
import { NewsAggregator } from '@/lib/news-aggregator'

export const GET = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    // Check database connection
    if (!prisma) {
      return NextResponse.json({ 
        ok: false, 
        code: 'DATABASE_ERROR', 
        message: 'Database service unavailable' 
      }, { status: 503 })
    }

    const userProfile = await prisma.userApp.findUnique({
      where: { userId: auth.user.id },
      select: { plan: true }
    })

    if (!userProfile || !hasFeatureAccess(userProfile.plan, 'NEWS')) {
      return NextResponse.json({ 
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Feature not available in your plan'
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const sanitizedCategory = category ? sanitizeInput(category) : undefined

    // Fetch fresh news directly from APIs
    const newsAggregator = NewsAggregator.getInstance()
    const allNews = await newsAggregator.aggregateAllNews()
    
    // Filter by category if specified
    const filteredNews = sanitizedCategory 
      ? allNews.filter(article => article.category.toLowerCase().includes(sanitizedCategory.toLowerCase()))
      : allNews
    
    // Take latest 10 articles
    const sanitizedNews = filteredNews.slice(0, 10).map(article => ({
      id: `${article.source}-${Date.now()}-${Math.random()}`,
      title: article.title,
      content: article.content,
      summary: article.summary,
      source: article.source,
      url: article.url,
      category: article.category,
      tags: article.tags,
      publishedAt: article.publishedAt.toISOString(),
      createdAt: new Date().toISOString()
    }))

    return NextResponse.json({ ok: true, news: sanitizedNews })
  },
  { requireAuth: true }
)

export const POST = createGuardedHandler(
  async (_request: NextRequest, { auth }) => {
    console.log('News sync triggered')
    const newsAggregator = NewsAggregator.getInstance()
    const allNews = await newsAggregator.aggregateAllNews()

    return NextResponse.json({ 
      ok: true,
      message: 'News sync completed',
      created: allNews.length,
      articles: allNews.slice(0, 5)
    })
  },
  { requireAuth: true, requireCSRF: true }
)