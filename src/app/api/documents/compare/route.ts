// API Route: Compare two documents
// POST /api/documents/compare
// Body: { document1Id, document1Text, document2Id, document2Text }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import {
  compareDocuments,
  formatComparisonForDisplay,
  getReconciliationSuggestions
} from '@/lib/document-comparison'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { document1Id, document1Text, document2Id, document2Text } = body

    if (!document1Id || !document1Text || !document2Id || !document2Text) {
      return NextResponse.json(
        { error: 'All document parameters are required' },
        { status: 400 }
      )
    }

    if (document1Text.length < 50 || document2Text.length < 50) {
      return NextResponse.json(
        { error: 'Documents must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Compare documents
    const result = compareDocuments(
      document1Id,
      document1Text,
      document2Id,
      document2Text
    )

    // Get reconciliation suggestions
    const suggestions = getReconciliationSuggestions(result)

    // Format for display
    const formattedReport = formatComparisonForDisplay(result)

    return NextResponse.json({
      success: true,
      document1Id,
      document2Id,
      totalDifferences: result.totalDifferences,
      addedLines: result.addedLines,
      removedLines: result.removedLines,
      modifiedLines: result.modifiedLines,
      similarities: result.similarities,
      summary: result.summary,
      suggestions,
      differences: result.differences.map(d => ({
        type: d.type,
        lineNumber: d.lineNumber,
        originalText: d.originalText,
        newText: d.newText
      })),
      report: formattedReport
    })
  } catch (error: any) {
    console.error('Document comparison error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to compare documents' },
      { status: 500 }
    )
  }
}
