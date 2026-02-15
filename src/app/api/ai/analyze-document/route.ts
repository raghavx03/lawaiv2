
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createGuardedHandler } from '@/lib/security/guards'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { hasFeatureAccess } from '@/lib/auth'
import { callAIService } from '@/lib/ai-service'

const MAX_CONTENT_LENGTH = 8000

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const formData = await request.formData()
    const file = formData.get('document') as File
    const userId = auth.user.id

    if (!file) {
      return NextResponse.json({ ok: false, code: 'MISSING_FILE', message: 'Document is required' }, { status: 400 })
    }

    if (!hasFeatureAccess(auth.user, 'DOC_GENERATOR')) {
      return NextResponse.json({
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Document analysis not available in your plan. Upgrade to access this feature.'
      }, { status: 403 })
    }

    const usageCheck = await checkUsageLimit(userId, 'DOC_GENERATOR')
    if (!usageCheck.allowed) {
      return NextResponse.json({
        ok: false,
        code: 'USAGE_LIMIT',
        message: 'Usage limit reached',
        reason: usageCheck.reason
      }, { status: 402 })
    }

    const fileContent = await file.text()

    if (!fileContent.trim()) {
      return NextResponse.json({ ok: false, code: 'EMPTY_FILE', message: 'Document appears to be empty' }, { status: 400 })
    }

    const truncatedContent = fileContent.length > MAX_CONTENT_LENGTH
      ? fileContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated due to length]'
      : fileContent

    // Switch to NVIDIA Llama 3.3 for analysis
    try {
      const response = await callAIService([
        {
          role: 'system',
          content: 'You are a professional legal document analyzer. Provide comprehensive analysis in a structured format.'
        },
        {
          role: 'user',
          content: `Please analyze the following document and provide a comprehensive analysis:\n\nDOCUMENT CONTENT:\n${truncatedContent}\n\nPlease provide analysis in the following format:\n\n## DOCUMENT SUMMARY\n[Brief overview of the document type and purpose]\n\n## KEY FINDINGS\n[Important terms, clauses, and provisions]\n\n## LEGAL COMPLIANCE\n[Compliance issues or requirements identified]\n\n## RISK ASSESSMENT\n[Potential legal risks or concerns]\n\n## RECOMMENDATIONS\n[Suggestions for improvements or actions needed]\n\n## IMPORTANT DATES & DEADLINES\n[Any time-sensitive elements]\n\nPlease be thorough but concise, and include a disclaimer about seeking professional legal advice.`
        }
      ], auth.user.plan || 'FREE')

      if (!response.content) {
        throw new Error('No analysis generated')
      }

      await incrementUsage(userId, 'DOC_GENERATOR')

      return NextResponse.json({ ok: true, analysis: response.content })

    } catch (error) {
      console.error('AI Analysis Error:', error)
      return NextResponse.json({ ok: false, code: 'AI_ERROR', message: 'AI service unavailable' }, { status: 503 })
    }
  },
  { requireAuth: true, requireCSRF: true }
)