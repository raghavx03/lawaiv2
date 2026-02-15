export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer-enhanced'
import { callAIQuick } from '@/lib/ai-service'

const mockCourtData = {
  courts: [
    'Supreme Court of India',
    'Delhi High Court',
    'Bombay High Court',
    'Madras High Court',
    'Karnataka High Court'
  ],
  statuses: [
    'Pending Admission',
    'Notice Issued',
    'Arguments Heard',
    'Judgment Reserved',
    'Disposed',
    'Dismissed',
    'Allowed',
    'Partly Allowed',
    'Withdrawn'
  ],
  caseTypes: [
    'Civil Suit',
    'Criminal Case',
    'Writ Petition',
    'Appeal',
    'SLP',
    'PIL'
  ]
}

function generateMockCaseDetails(cnr: string, partyName: string) {
  const isPending = Math.random() > 0.3
  const nextDate = isPending ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000) : null
  const filingDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)

  return {
    cnrNumber: cnr || `DLHC${Math.floor(Math.random() * 1000000)}2024`,
    filingDate,
    registrationDate: new Date(filingDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    nextHearingDate: nextDate,
    status: isPending ? mockCourtData.statuses[Math.floor(Math.random() * 4)] : 'Disposed',
    courtName: mockCourtData.courts[Math.floor(Math.random() * mockCourtData.courts.length)],
    caseType: mockCourtData.caseTypes[Math.floor(Math.random() * mockCourtData.caseTypes.length)],
    petitioner: partyName,
    respondent: 'State / Others',
    judge: 'Honorable Justice S. Kumar',
    details: {
      stage: 'Arguments',
      act: 'IPC Section 420',
      bench: 'Single Bench'
    }
  }
}

const caseTrackerSchema = z.object({
  cnr: z.string().optional(),
  partyName: z.string().optional(),
  searchType: z.enum(['cnr', 'party']).default('cnr')
})

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json()
    const { cnr, partyName, searchType } = caseTrackerSchema.parse(body)
    const userId = auth.user.id

    if (!cnr && !partyName) {
      return NextResponse.json({ ok: false, message: 'Please provide CNR number or Party Name' }, { status: 400 })
    }

    const sanitizedCnr = cnr ? sanitizeInput(cnr) : ''
    const sanitizedPartyName = partyName ? sanitizeInput(partyName) : ''

    // Generate case analysis using AI
    let aiAnalysis = ''
    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a legal analyst. Provide a brief analysis of potential next steps for a court case based on its current status.'
        },
        {
          role: 'user' as const,
          content: `Analyze case status: ${mockCourtData.statuses[0]}. Case Type: ${mockCourtData.caseTypes[0]}. Provide 2 bullet points on likely next steps.`
        }
      ]

      const aiResponse = await callAIQuick(messages, 500, 0.5)
      aiAnalysis = aiResponse.content
    } catch (e) {
      aiAnalysis = 'Analysis pending...'
    }

    // Mock e-courts data fetch (simulated)
    const finalCnr = sanitizedCnr || `AUTO-${Date.now()}`
    const finalPartyName = sanitizedPartyName || 'Unknown Party'
    const mockDetails = generateMockCaseDetails(finalCnr, finalPartyName)

    // Check if case already tracked
    const existingCase = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return null

      return prisma.caseTracker.findFirst({
        where: {
          userId,
          cnr: finalCnr
        }
      })
    }, null)

    if (existingCase) {
      return NextResponse.json({
        case: existingCase,
        message: 'Case already being tracked'
      })
    }

    // Save tracked case complying with schema
    const courtCase = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')

      return await prisma.caseTracker.create({
        data: {
          userId,
          cnr: mockDetails.cnrNumber,
          partyName: mockDetails.petitioner,
          court: mockDetails.courtName,
          status: mockDetails.status,
          nextDate: mockDetails.nextHearingDate,
          lastUpdate: new Date(),
          details: {
            filingDate: mockDetails.filingDate,
            registrationDate: mockDetails.registrationDate,
            respondent: mockDetails.respondent,
            judge: mockDetails.judge,
            ...mockDetails.details,
            aiAnalysis
          } as any // Use as any to bypass strict JSON type check if needed
        }
      })
    }, null)

    if (!courtCase) throw new Error('Failed to track case')

    return NextResponse.json({
      ok: true,
      case: courtCase,
      message: 'Case added to tracking successfully'
    })
  },
  { requireAuth: true, requireCSRF: false }
)

export const GET = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const cnr = searchParams.get('cnr')

    const cases = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return []

      const where: any = { userId: auth.user.id }
      if (cnr) where.cnr = cnr

      return prisma.caseTracker.findMany({
        where,
        orderBy: { updatedAt: 'desc' }
      })
    }, [])

    const stats = {
      total: cases.length,
      active: cases.filter((c: any) => !['Disposed', 'Dismissed', 'Allowed'].includes(c.status)).length,
      disposed: cases.filter((c: any) => ['Disposed', 'Dismissed', 'Allowed'].includes(c.status)).length,
      nextHearing: cases.filter((c: any) => c.nextDate && new Date(c.nextDate) > new Date()).length
    }

    return NextResponse.json({
      ok: true,
      cases,
      stats,
      courts: mockCourtData.courts,
      statuses: mockCourtData.statuses
    })
  },
  { requireAuth: true }
)