// API Route: Search case law database
// POST /api/case-law/search
// Body: { query, type }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import {
  searchCaseLaw,
  getCasesByTag,
  getCasesBySection,
  getAllTags,
  getCaseLawStats,
  formatCaseLawResultsForDisplay
} from '@/lib/case-law-db'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, type = 'general' } = body

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    let result

    if (type === 'tag') {
      const cases = getCasesByTag(query)
      result = {
        query,
        resultsFound: cases.length,
        cases,
        summary: `Found ${cases.length} case${cases.length !== 1 ? 's' : ''} with tag "${query}"`
      }
    } else if (type === 'section') {
      const cases = getCasesBySection(query)
      result = {
        query,
        resultsFound: cases.length,
        cases,
        summary: `Found ${cases.length} case${cases.length !== 1 ? 's' : ''} related to section "${query}"`
      }
    } else {
      result = searchCaseLaw(query)
    }

    // Format for display
    const formattedReport = formatCaseLawResultsForDisplay(result)

    return NextResponse.json({
      success: true,
      query,
      resultsFound: result.resultsFound,
      summary: result.summary,
      cases: result.cases.map(c => ({
        id: c.id,
        caseName: c.caseName,
        citation: c.citation,
        year: c.year,
        court: c.court,
        summary: c.summary,
        relevantSections: c.relevantSections,
        tags: c.tags,
        url: c.url
      })),
      report: formattedReport
    })
  } catch (error: any) {
    console.error('Case law search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search case law' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'tags') {
      const tags = getAllTags()
      return NextResponse.json({
        success: true,
        tags,
        count: tags.length
      })
    }

    if (action === 'stats') {
      const stats = getCaseLawStats()
      return NextResponse.json({
        success: true,
        stats
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Case law API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get case law data' },
      { status: 500 }
    )
  }
}
