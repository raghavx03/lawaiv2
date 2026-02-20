// API Route: Extract clauses from documents
// POST /api/clauses/extract
// Body: { documentId, text }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { extractClauses, formatClausesForDisplay } from '@/lib/clause-extractor'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, text } = body

    if (!documentId || !text) {
      return NextResponse.json(
        { error: 'documentId and text are required' },
        { status: 400 }
      )
    }

    if (text.length < 100) {
      return NextResponse.json(
        { error: 'Document text too short for clause extraction' },
        { status: 400 }
      )
    }

    // Extract clauses
    const result = await extractClauses(documentId, text)

    // Format for display
    const formattedReport = formatClausesForDisplay(result)

    return NextResponse.json({
      success: true,
      documentId,
      totalClauses: result.totalClauses,
      highRiskCount: result.highRiskCount,
      mediumRiskCount: result.mediumRiskCount,
      lowRiskCount: result.lowRiskCount,
      summary: result.summary,
      clauses: result.clauses.map(c => ({
        id: c.id,
        title: c.title,
        riskLevel: c.riskLevel,
        riskFactors: c.riskFactors,
        suggestions: c.suggestions,
        lineNumbers: c.lineNumbers
      })),
      report: formattedReport
    })
  } catch (error: any) {
    console.error('Clause extraction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract clauses' },
      { status: 500 }
    )
  }
}
