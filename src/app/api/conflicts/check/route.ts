// API Route: Check for conflicts of interest
// POST /api/conflicts/check
// Body: { caseId, parties, previousCases }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { checkConflicts, formatConflictAnalysisForDisplay } from '@/lib/conflict-detector'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { caseId, parties, previousCases = [] } = body

    if (!caseId || !parties || !Array.isArray(parties) || parties.length === 0) {
      return NextResponse.json(
        { error: 'caseId and parties array are required' },
        { status: 400 }
      )
    }

    // Check conflicts
    const analysis = checkConflicts(caseId, parties, previousCases)

    // Format for display
    const formattedReport = formatConflictAnalysisForDisplay(analysis)

    return NextResponse.json({
      success: true,
      caseId,
      hasConflict: analysis.hasConflict,
      summary: analysis.summary,
      conflictCount: analysis.conflictChecks.filter(c => c.hasConflict).length,
      conflicts: analysis.conflictChecks
        .filter(c => c.hasConflict)
        .map(c => ({
          type: c.conflictType,
          severity: c.severity,
          description: c.description,
          recommendation: c.recommendation
        })),
      recommendations: analysis.recommendations,
      report: formattedReport
    })
  } catch (error: any) {
    console.error('Conflict detection error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check conflicts' },
      { status: 500 }
    )
  }
}
