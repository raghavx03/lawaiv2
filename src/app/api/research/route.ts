export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { sanitizeInput, sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'
import { callAIService } from '@/lib/ai-service'
import { checkIPRateLimit, getClientIP } from '@/lib/ip-rate-limit'
import { getServerUser } from '@/lib/auth'
import { logResearch } from '@/lib/case-activity'

const researchSchema = z.object({
  query: z.string().min(5).max(2000),
  caseId: z.string().uuid().optional(),
  jurisdiction: z.string().optional(),
  checkOverruled: z.boolean().optional().default(true)
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
    const { query, caseId, jurisdiction, checkOverruled } = researchSchema.parse(body)
    const userId = user?.id || `ip-${clientIP}`
    const sanitizedQuery = sanitizeInput(query)

    // Build case context
    let caseContext = ''
    if (caseId && user) {
      const caseData = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) return null
        return prisma.case.findFirst({
          where: { id: caseId, userId: user.id },
          select: { title: true, cnrNumber: true, court: true, petitioner: true, respondent: true }
        }).catch(() => null)
      }, null)

      if (caseData) {
        caseContext = `\nCase Context: ${caseData.title}${caseData.cnrNumber ? ` (CNR: ${caseData.cnrNumber})` : ''}${caseData.court ? `, Court: ${caseData.court}` : ''}`
      }
    }

    const overruledInstruction = checkOverruled
      ? "\nCRITICAL: Explicitly check if any cited judgment has been OVERRULED by a larger bench. If overruled, state clearly: 'OVERRULED in [Year] by [New Case]'."
      : ""

    const jurisdictionInstruction = jurisdiction
      ? `\nFOCUS: Prioritize judgments from ${jurisdiction} High Court and Supreme Court of India.`
      : ""

    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert legal researcher specializing in Indian law, with deep knowledge of:
- Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS)
- Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS)
- Code of Civil Procedure (CPC) / Bharatiya Sakshya Adhiniyam (BSA)
- Constitution of India
- All Central and State Acts
- Supreme Court and High Court judgments

RESEARCH RESPONSE FORMAT:
1. Legal Position: Current legal position on the query
2. Statutory Framework: Relevant Acts, Sections, and Articles (with full citations)
3. Case Law: Leading judgments with case names, years, and citations (AIR, SCC, SCR)
4. Procedure: Step-by-step procedural requirements if applicable
5. Practical Advice: Actionable recommendations for legal practitioners

RULES:
- Every legal statement MUST cite a specific source${overruledInstruction}${jurisdictionInstruction}
- Use proper legal citation format (e.g., AIR 2024 SC 1234)
- Do not fabricate case names or citations
- If unsure, state: "Source verification required -- consult legal databases"
- Do NOT use asterisks for formatting
- End with a "Sources" section listing ALL cited authorities`
      },
      {
        role: 'user' as const,
        content: `Legal Research Query: ${sanitizedQuery}${caseContext}`
      }
    ]

    const aiResponse = await callAIService(messages, user?.plan || 'FREE', 4096, 0.4)

    if (!aiResponse.content) {
      throw new Error('No research results generated')
    }

    const savedResearch = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')

      return prisma.research.create({
        data: {
          userId,
          query: sanitizedQuery,
          result: aiResponse.content,
          caseId: caseId || null
        }
      })
    }, null)

    if (savedResearch && caseId && user) {
      await logResearch(caseId, user.id, sanitizedQuery, aiResponse.content, savedResearch.id)
    }

    return NextResponse.json({
      ok: true,
      id: savedResearch?.id || 'temp-' + Date.now(),
      query: sanitizedQuery,
      result: aiResponse.content,
      citations: aiResponse.citations || [],
      model: aiResponse.model,
      verified: aiResponse.verified,
      caseId,
      createdAt: savedResearch?.createdAt || new Date()
    })
  } catch (error) {
    console.error('Research error:', sanitizeForLog(error))
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

    const researchHistory = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return []

      const whereClause: any = { userId }
      if (caseId) { whereClause.caseId = caseId }

      return prisma.research.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, query: true, result: true,
          caseId: true, createdAt: true
        }
      })
    }, [])

    return NextResponse.json(researchHistory)
  } catch (error) {
    console.error('Get research error:', sanitizeForLog(error))
    return NextResponse.json([])
  }
}
