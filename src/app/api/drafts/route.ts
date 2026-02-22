export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { sanitizeInput, sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'
import { callAIService, callAIQuick } from '@/lib/ai-service'
import { checkIPRateLimit, getClientIP } from '@/lib/ip-rate-limit'
import { getServerUser } from '@/lib/auth'
import { generateSimpleDocument } from '@/lib/simple-templates'
import { logDraftCreated } from '@/lib/case-activity'

const draftSchema = z.object({
  type: z.string().min(1),
  inputs: z.record(z.string()),
  caseId: z.string().uuid().optional(),
  title: z.string().optional(),
  language: z.enum(['en', 'hi', 'bilingual']).optional().default('en')
})

const DRAFT_TEMPLATES: Record<string, string> = {
  sale: 'Sale Deed',
  rent: 'Rental Agreement',
  employment: 'Employment Contract',
  nda: 'Non-Disclosure Agreement',
  partnership: 'Partnership Agreement',
  loan: 'Loan Agreement',
  will: 'Will',
  poa: 'Power of Attorney',
  affidavit: 'Affidavit',
  cheque_bounce: 'Cheque Bounce Notice'
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser(request).catch(() => null)
    const clientIP = getClientIP(request)

    if (!user) {
      const rateLimit = checkIPRateLimit(clientIP, 3)
      if (!rateLimit.allowed) {
        const hoursLeft = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60))
        return NextResponse.json({
          ok: false,
          message: `Daily limit reached. Try again in ${hoursLeft} hours or sign up.`,
          code: 'RATE_LIMIT_EXCEEDED'
        }, { status: 429 })
      }
    }

    const body = await request.json()
    const { type, inputs, caseId, title, language } = draftSchema.parse(body)
    const userId = user?.id || `ip-${clientIP}`
    const sanitizedInputs: Record<string, string> = {}

    for (const [key, value] of Object.entries(inputs)) {
      sanitizedInputs[key] = sanitizeInput(String(value))
    }

    const templateName = DRAFT_TEMPLATES[type] || 'Legal Document'
    const docTitle = title || templateName

    // Try AI-enhanced generation first for PRO users
    let content = ''
    let isAiGenerated = false
    let citations: string[] = []

    if (user?.plan === 'PRO' || user?.plan === 'PLUS') {
      try {
        const langInstruction = language === 'hi'
          ? 'Draft ENTIRELY in formal legal Hindi (Devanagari script).'
          : language === 'bilingual'
            ? 'Draft in both English and Hindi (side-by-side or paragraph-wise translation) for court submission.'
            : 'Draft in professional English.'

        const messages = [
          {
            role: 'system' as const,
            content: `You are a Senior Advocate of the Supreme Court of India specializing in drafting complex legal documents.
            
RULES:
1. Draft a professional ${templateName} based on the provided inputs.
2. LANGUAGE: ${langInstruction}
3. COMPLIANCE: Ensure strict compliance with relevant Indian Acts (Contract Act 1872, Registration Act 1908, Transfer of Property Act 1882, etc.).
4. FORMAT: Use standard legal formatting with numbered clauses. Do NOT use markdown asterisks.
5. STAMP DUTY: Add a [NOTE] at the top estimating Stamp Duty requirements for this document type (general guidance).
6. CITATIONS: Include relevant citations (e.g., "Under Section X of Y Act") where applicable.`
          },
          {
            role: 'user' as const,
            content: `Draft a professional ${templateName} with these details: ${JSON.stringify(sanitizedInputs)}`
          }
        ]

        const aiResponse = await callAIService(messages, user.plan, 4096, 0.3)
        if (aiResponse.content) {
          content = aiResponse.content
          isAiGenerated = true
          citations = aiResponse.citations || []
        }
      } catch (aiError) {
        console.warn('AI draft generation failed, falling back to templates', aiError)
      }
    }

    // Fallback to simple templates if AI fails or user is not PRO
    if (!content) {
      if (language !== 'en') {
        throw new Error('Only English drafts are available on the Free plan. Upgrade to generate Hindi/Bilingual drafts.')
      }
      try {
        content = generateSimpleDocument(type, sanitizedInputs)
      } catch (templateError) {
        if (!content) {
          throw new Error('Failed to generate document')
        }
      }
    }

    const savedDraft = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')

      return prisma.draft.create({
        data: {
          userId,
          title: docTitle,
          content,
          type,
          inputs: sanitizedInputs,
          caseId: caseId || null
        }
      })
    }, null)

    if (savedDraft && caseId && user) {
      await logDraftCreated(caseId, user.id, type, docTitle, savedDraft.id)
    }

    return NextResponse.json({
      ok: true,
      id: savedDraft?.id || 'temp-' + Date.now(),
      title: docTitle,
      content,
      type,
      citations,
      isAiGenerated,
      caseId,
      createdAt: savedDraft?.createdAt || new Date()
    })
  } catch (error) {
    console.error('Draft generation error:', sanitizeForLog(error))
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request).catch(() => null)
    if (!user) return NextResponse.json([], { status: 401 })

    // IP fallback discouraged for fetching list, but allowed for singular fetch if implemented
    const userId = user.id

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')
    const id = searchParams.get('id')

    if (id) {
      // Fetch single draft
      const draft = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) return null
        return prisma.draft.findUnique({
          where: { id, userId } // Ensure ownership
        })
      }, null)

      if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
      return NextResponse.json(draft)
    }

    // List drafts
    const drafts = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return []

      const whereClause: any = { userId }
      if (caseId) { whereClause.caseId = caseId }

      return prisma.draft.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, title: true, type: true, content: true,
          caseId: true, createdAt: true
        }
      })
    }, [])

    return NextResponse.json(drafts)
  } catch (error) {
    console.error('Get drafts error:', sanitizeForLog(error))
    return NextResponse.json([])
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser(request).catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, content, title } = await request.json()
    if (!id || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const updated = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return null
      // Verify ownership first implicitly by where clause
      return prisma.draft.update({
        where: { id, userId: user.id },
        data: {
          content,
          title: title || undefined,
          updatedAt: new Date()
        }
      })
    }, null)

    if (!updated) return NextResponse.json({ error: 'Update failed or not authorized' }, { status: 404 })

    return NextResponse.json({ ok: true, draft: updated })
  } catch (error) {
    console.error('Update draft error:', sanitizeForLog(error))
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
  }
}
