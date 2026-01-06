export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createGuardedHandler } from '@/lib/security/guards'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { hasFeatureAccess } from '@/lib/auth'
import { env } from '@/lib/env'

const MAX_CONTENT_LENGTH = 8000

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const formData = await request.formData()
    const file = formData.get('document') as File
    const userId = auth.user.id
    
    if (!file) {
      return NextResponse.json({ ok: false, code: 'MISSING_FILE', message: 'Document is required' }, { status: 400 })
    }

    // Check feature access
    if (!hasFeatureAccess(auth.user, 'DOC_GENERATOR')) {
      return NextResponse.json({ 
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Document analysis not available in your plan. Upgrade to access this feature.'
      }, { status: 403 })
    }

    // Check usage limits
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
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional legal document analyzer. Provide comprehensive analysis in a structured format.'
          },
          {
            role: 'user',
            content: `Please analyze the following document and provide a comprehensive analysis:\n\nDOCUMENT CONTENT:\n${truncatedContent}\n\nPlease provide analysis in the following format:\n\n## DOCUMENT SUMMARY\n[Brief overview of the document type and purpose]\n\n## KEY FINDINGS\n[Important terms, clauses, and provisions]\n\n## LEGAL COMPLIANCE\n[Compliance issues or requirements identified]\n\n## RISK ASSESSMENT\n[Potential legal risks or concerns]\n\n## RECOMMENDATIONS\n[Suggestions for improvements or actions needed]\n\n## IMPORTANT DATES & DEADLINES\n[Any time-sensitive elements]\n\nPlease be thorough but concise, and include a disclaimer about seeking professional legal advice.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      return NextResponse.json({ ok: false, code: 'AI_ERROR', message: 'AI service unavailable' }, { status: 503 })
    }

    const data = await response.json()
    const analysis = data.choices?.[0]?.message?.content

    if (!analysis) {
      return NextResponse.json({ ok: false, code: 'AI_ERROR', message: 'No analysis generated' }, { status: 500 })
    }

    // Increment usage
    await incrementUsage(userId, 'DOC_GENERATOR')

    return NextResponse.json({ ok: true, analysis })
  },
  { requireAuth: true, requireCSRF: true }
)