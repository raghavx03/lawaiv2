// API Route: Score risk for case or contract
// POST /api/risk/score
// Body: { text, type }

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { scoreRisk, formatRiskScoreForDisplay } from '@/lib/risk-scorer'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, type = 'contract' } = body

    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'Text must be at least 100 characters' },
        { status: 400 }
      )
    }

    if (!['case', 'contract'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "case" or "contract"' },
        { status: 400 }
      )
    }

    // Score risk
    const riskScore = scoreRisk(text, type)

    // Format for display
    const formattedReport = formatRiskScoreForDisplay(riskScore)

    return NextResponse.json({
      success: true,
      overallScore: riskScore.overallScore,
      riskLevel: riskScore.riskLevel,
      summary: riskScore.summary,
      factorCount: riskScore.factors.length,
      factors: riskScore.factors.map(f => ({
        category: f.category,
        severity: f.severity,
        description: f.description,
        recommendation: f.recommendation
      })),
      recommendations: riskScore.recommendations,
      report: formattedReport
    })
  } catch (error: any) {
    console.error('Risk scoring error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to score risk' },
      { status: 500 }
    )
  }
}
