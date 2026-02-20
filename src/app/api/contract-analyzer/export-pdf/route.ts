import { NextRequest, NextResponse } from 'next/server'
import { getSubscription } from '@/lib/subscription-service'
import { generatePDFReport, generatePDFFilename } from '@/lib/pdf-generator'
import { RiskAnalysisResult } from '@/lib/contract-risk-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, analysis, contractText, contractType } = body

    // Validate input
    if (!userId || !analysis || !contractText) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, analysis, contractText' },
        { status: 400 }
      )
    }

    // Check subscription tier
    const subscription = await getSubscription(userId)

    // Only pro tier can download PDFs
    if (subscription.tier !== 'pro' && subscription.tier !== 'enterprise') {
      return NextResponse.json(
        {
          error: 'PDF download is only available for Pro tier users',
          tier: subscription.tier,
        },
        { status: 403 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generatePDFReport(
      analysis as RiskAnalysisResult,
      contractText,
      {
        title: 'Contract Risk Analysis Report',
        includeWatermark: false,
        isFreeUser: false,
      }
    )

    // Generate filename
    const filename = generatePDFFilename(contractType || 'contract')

    // Return PDF as file download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
