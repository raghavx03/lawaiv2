export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { sanitizeInput, sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'
import { callAIService } from '@/lib/ai-service'
import { checkIPRateLimit, getClientIP } from '@/lib/ip-rate-limit'
import { getServerUser } from '@/lib/auth'
import { logSummaryCreated } from '@/lib/case-activity'

const summarizerSchema = z.object({
  text: z.string().min(10).max(50000),
  title: z.string().min(1).max(200),
  caseId: z.string().uuid().optional()
})

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
    const { text, title, caseId } = summarizerSchema.parse(body)
    const userId = user?.id || `ip-${clientIP}`
    const sanitizedText = sanitizeInput(text)
    const sanitizedTitle = sanitizeInput(title)

    const messages = [
      {
        role: 'system' as const,
        content: `You are a legal expert specializing in summarizing Indian court judgments and legal documents.

Provide a structured summary with these exact sections:
1. Case Overview: Brief facts and parties involved
2. Key Issues: Legal questions addressed by the court
3. Ratio Decidendi: Core legal reasoning and principles established
4. Final Order: The judgment or decision rendered
5. Applicable Sections: All relevant laws, statutes, and sections cited (with full citation)
6. Practical Implications: How this affects similar cases in practice

RULES:
- Cite every section, article, and case law reference with full details
- Use Indian legal terminology
- Do not use asterisks for formatting
- End with a "Sources" section listing all authorities referenced in the document`
      },
      {
        role: 'user' as const,
        content: `Summarize this legal document titled "${sanitizedTitle}":\n\n${sanitizedText.substring(0, 20000)}`
      }
    ]

    const aiResponse = await callAIService(messages, user?.plan || 'FREE', 4096, 0.3)
    const summary = aiResponse.content

    if (!summary) {
      throw new Error('No summary generated')
    }

    const savedSummary = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')

      return prisma.summary.create({
        data: {
          userId,
          title: sanitizedTitle,
          originalText: sanitizedText.substring(0, 50000),
          summary,
          caseId: caseId || null
        }
      })
    }, null)

    if (savedSummary && caseId && user) {
      await logSummaryCreated(caseId, user.id, sanitizedTitle, summary, savedSummary.id)
    }

    return NextResponse.json({
      ok: true,
      id: savedSummary?.id || 'temp-' + Date.now(),
      title: sanitizedTitle,
      summary,
      citations: aiResponse.citations || [],
      model: aiResponse.model,
      verified: aiResponse.verified,
      caseId,
      createdAt: savedSummary?.createdAt || new Date()
    })
  } catch (error) {
    console.error('Summarizer error:', sanitizeForLog(error))
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request).catch(() => null)
    const clientIP = getClientIP(request)
    const userId = user?.id || `ip-${clientIP}`

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')

    const summaries = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return []

      const whereClause: any = { userId }
      if (caseId) { whereClause.caseId = caseId }

      return prisma.summary.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, title: true, summary: true,
          caseId: true, createdAt: true
        }
      })
    }, [])

    return NextResponse.json(summaries)
  } catch (error) {
    console.error('Get summaries error:', sanitizeForLog(error))
    return NextResponse.json([])
  }
}
