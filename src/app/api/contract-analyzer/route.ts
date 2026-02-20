import { NextRequest, NextResponse } from 'next/server'
import { canPerformQuery, incrementQueryCount, getRemainingQueries } from '@/lib/subscription-service'
import { analyzeContractRisk } from '@/lib/contract-risk-analyzer'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractText, contractType, userId } = body

    if (!contractText || typeof contractText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid contract text' },
        { status: 400 }
      )
    }

    if (contractText.length < 50) {
      return NextResponse.json(
        { error: 'Contract text too short. Please provide at least 50 characters.' },
        { status: 400 }
      )
    }

    // Check subscription tier and query limits
    if (userId) {
      const canQuery = await canPerformQuery(userId)
      if (!canQuery) {
        const remaining = await getRemainingQueries(userId)
        return NextResponse.json(
          {
            error: 'Daily query limit reached',
            remaining,
            message: 'Upgrade to Pro for unlimited access',
          },
          { status: 429 }
        )
      }
    }

    const startTime = Date.now()

    // Analyze contract using enhanced risk analyzer
    const analysis = await analyzeContractRisk(contractText, contractType || 'general')

    const analysisTime = Date.now() - startTime

    // Log query to database
    if (userId) {
      try {
        await Promise.all([
          // Log to QueryLog
          prisma.queryLog.create({
            data: {
              userId,
              contractType: contractType || 'general',
              riskScore: analysis.overallRisk,
              analysisTime,
              redFlagCount: analysis.redFlags.length,
            },
          }),
          // Log analytics event
          prisma.analyticsEvent.create({
            data: {
              userId,
              eventType: 'contract_analyzed',
              metadata: {
                contractType: contractType || 'general',
                riskScore: analysis.overallRisk,
                analysisTime,
              },
            },
          }),
          // Increment query count
          incrementQueryCount(userId),
        ])
      } catch (dbError) {
        console.error('Error logging query:', dbError)
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json({
      ...analysis,
      analysisTime: analysisTime / 1000, // Convert to seconds
    })
  } catch (error) {
    console.error('Contract analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze contract' },
      { status: 500 }
    )
  }
}
