export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security/input-sanitizer-enhanced'
import { callAIService } from '@/lib/ai-service'
import { checkIPRateLimit, getClientIP } from '@/lib/ip-rate-limit'

const draftSchema = z.object({
  type: z.enum(['rent', 'sale', 'partnership', 'employment', 'nda', 'loan']),
  inputs: z.record(z.string().max(1000)).optional(),
  formData: z.record(z.string().max(1000)).optional(),
  title: z.string().optional()
})

const DRAFT_TEMPLATES = {
  rent: 'rental agreement',
  sale: 'sale deed',
  partnership: 'partnership agreement',
  employment: 'employment contract',
  nda: 'non-disclosure agreement',
  loan: 'loan agreement'
}

export async function POST(request: NextRequest) {
  try {
    // Check IP rate limit (3 documents per day)
    const clientIP = getClientIP(request)
    const rateLimit = checkIPRateLimit(clientIP, 3)
    
    if (!rateLimit.allowed) {
      const hoursLeft = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60))
      return NextResponse.json({
        ok: false,
        error: `Daily limit reached (3 documents per day). Try again in ${hoursLeft} hours or sign up for unlimited access.`,
        code: 'RATE_LIMIT_EXCEEDED',
        resetTime: rateLimit.resetTime
      }, { status: 429 })
    }
    
    const body = await request.json()
    const { type, inputs, formData, title } = draftSchema.parse(body)
    const userId = `ip-${clientIP}`
    
    // Use formData if inputs is not provided (for backward compatibility)
    const documentInputs = inputs || formData || {}

    // Sanitize inputs
    const sanitizedInputs: Record<string, string> = {}
    for (const [key, value] of Object.entries(documentInputs)) {
      if (typeof value === 'string') {
        sanitizedInputs[key] = sanitizeInput(value)
      }
    }

    const templateType = DRAFT_TEMPLATES[type as keyof typeof DRAFT_TEMPLATES]
    if (!templateType) {
      return NextResponse.json({ error: 'Invalid draft type' }, { status: 400 })
    }

    // Generate document using professional template
    const { generateDocument } = await import('@/lib/document-templates')
    const content = generateDocument(type, sanitizedInputs)
    
    if (!content) {
      throw new Error('No draft generated')
    }

    // Save draft to database (with fallback)
    let savedDraft
    try {
      if (prisma) {
        savedDraft = await prisma.draft.create({
          data: {
            userId,
            type,
            title: title || `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} - ${new Date().toLocaleDateString()}`,
            content,
            inputs: sanitizedInputs,
          }
        })
      } else {
        throw new Error('Database unavailable')
      }
    } catch (dbError) {
      console.warn('Database save failed, returning content only:', dbError)
      savedDraft = {
        id: 'temp-' + Date.now(),
        title: title || `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} - ${new Date().toLocaleDateString()}`,
        content,
        type,
        createdAt: new Date()
      }
    }

    return NextResponse.json({
      ok: true,
      id: savedDraft.id,
      title: savedDraft.title,
      content: savedDraft.content,
      type: savedDraft.type,
      createdAt: savedDraft.createdAt,
      remaining: rateLimit.remaining,
      message: rateLimit.remaining === 0 ? 'This was your last free document today. Sign up for unlimited access!' : `${rateLimit.remaining} documents remaining today`
    })
  } catch (error) {
    console.error('Draft generation error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to generate draft'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const userId = `ip-${clientIP}`
    
    if (!prisma) {
      return NextResponse.json({ ok: true, drafts: [] })
    }
    
    const drafts = await prisma.draft.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true
      }
    })

    return NextResponse.json({ ok: true, drafts })
  } catch (dbError) {
    console.warn('Database error fetching drafts:', dbError)
    return NextResponse.json({ ok: true, drafts: [] })
  }
}