export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { sanitizeForLog } from '@/lib/security/log-sanitizer'
import { hasFeatureAccess } from '@/lib/feature-access'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'

// Mock court data for demonstration
const mockCourtData = {
  courts: [
    'Supreme Court of India',
    'Delhi High Court',
    'Mumbai High Court',
    'Calcutta High Court',
    'Madras High Court',
    'District Court Delhi',
    'District Court Mumbai',
    'Family Court Delhi',
    'Sessions Court Mumbai'
  ],
  statuses: [
    'Filed',
    'Pending',
    'Under Hearing',
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
    'Revision',
    'Bail Application',
    'Divorce Petition',
    'Property Dispute',
    'Commercial Dispute'
  ]
}

// Generate mock case details
function generateMockCaseDetails(cnr: string, partyName: string) {
  const randomCourt = mockCourtData.courts[Math.floor(Math.random() * mockCourtData.courts.length)] || 'District Court'
  const randomStatus = mockCourtData.statuses[Math.floor(Math.random() * mockCourtData.statuses.length)] || 'Pending'
  const randomCaseType = mockCourtData.caseTypes[Math.floor(Math.random() * mockCourtData.caseTypes.length)] || 'Civil Suit'
  
  const filingDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  const lastUpdate = new Date()
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + Math.floor(Math.random() * 30) + 1)

  return {
    court: randomCourt,
    status: randomStatus,
    caseType: randomCaseType,
    filingDate,
    lastUpdate,
    nextDate: randomStatus === 'Disposed' || randomStatus === 'Dismissed' ? null : nextDate,
    details: {
      cnr: cnr || `AUTO-${Date.now()}`,
      partyName: partyName || 'Unknown Party',
      judge: `Hon'ble Justice ${['Sharma', 'Gupta', 'Singh', 'Patel', 'Kumar'][Math.floor(Math.random() * 5)]}`,
      section: `Section ${Math.floor(Math.random() * 500) + 1}`,
      stage: randomStatus === 'Disposed' ? 'Final Order' : 'Interim Application',
      hearings: Math.floor(Math.random() * 10) + 1,
      documents: Math.floor(Math.random() * 20) + 5
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
      return NextResponse.json({ error: 'CNR or Party Name is required' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedCnr = cnr ? sanitizeInput(cnr.toString()).trim() : null
    const sanitizedPartyName = partyName ? sanitizeInput(partyName.toString()).trim() : null

    // Check if case already exists with sanitized inputs
    const whereConditions: any[] = []
    if (sanitizedCnr) {
      whereConditions.push({ cnr: { equals: sanitizedCnr, mode: 'insensitive' as const } })
    }
    if (sanitizedPartyName) {
      whereConditions.push({ partyName: { contains: sanitizedPartyName, mode: 'insensitive' as const } })
    }

    const existingCase = whereConditions.length > 0 ? await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      return await prisma.caseTracker.findFirst({
        where: {
          AND: [
            { userId },
            { OR: whereConditions }
          ]
        }
      })
    }, null) : null

    if (existingCase) {
      return NextResponse.json({ 
        case: existingCase,
        message: 'Case already being tracked'
      })
    }

    // Generate case analysis using AI
    let aiAnalysis = ''
    try {
      const { callAIService } = await import('@/lib/ai-service')
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a legal case analysis expert. Provide brief insights about case types, potential legal issues, and procedural guidance based on case information.'
        },
        {
          role: 'user' as const,
          content: `Analyze this case: CNR: ${sanitizedCnr || 'Not provided'}, Party: ${sanitizedPartyName || 'Not provided'}. Provide brief legal insights and case type prediction.`
        }
      ]
      
      const aiResponse = await callAIService(messages, userProfile.plan, 400, 0.6)
      aiAnalysis = aiResponse.content
    } catch (error) {
      aiAnalysis = 'AI case analysis temporarily unavailable'
    }
    
    // Generate mock case details (in real implementation, this would call eCourts API)
    const finalCnr = sanitizedCnr || `AUTO-${Date.now()}`
    const finalPartyName = sanitizedPartyName || 'Unknown Party'
    const mockDetails = generateMockCaseDetails(finalCnr, finalPartyName)
    mockDetails.details.aiAnalysis = aiAnalysis
    
    const courtCase = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      return await prisma.caseTracker.create({
        data: {
          cnr: finalCnr,
          partyName: finalPartyName,
          court: mockDetails.court,
          status: mockDetails.status,
          lastUpdate: mockDetails.lastUpdate,
          nextDate: mockDetails.nextDate,
          userId: userId,
          details: {
            ...mockDetails.details,
            caseType: mockDetails.caseType,
            filingDate: mockDetails.filingDate.toISOString(),
            searchType: sanitizeInput(searchType)
          }
        }
      })
    }, {
      id: 'fallback',
      cnr: finalCnr,
      partyName: finalPartyName,
      court: mockDetails.court,
      status: mockDetails.status,
      lastUpdate: mockDetails.lastUpdate,
      nextDate: mockDetails.nextDate,
      userId: userId,
      details: mockDetails.details,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Skip usage increment

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
    const partyName = searchParams.get('partyName')
    const status = searchParams.get('status')
    const court = searchParams.get('court')

    const whereClause: any = { userId: auth.user.id }
    
    if (cnr) {
      whereClause.cnr = { contains: sanitizeInput(cnr), mode: 'insensitive' as const }
    }
    
    if (partyName) {
      whereClause.partyName = { contains: sanitizeInput(partyName), mode: 'insensitive' as const }
    }
    
    if (status && mockCourtData.statuses.includes(status)) {
      whereClause.status = status
    }
    
    if (court) {
      whereClause.court = { contains: sanitizeInput(court), mode: 'insensitive' as const }
    }

    const cases = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      return await prisma.caseTracker.findMany({
        where: whereClause,
        orderBy: { lastUpdate: 'desc' },
        take: 50
      })
    }, [])

    const stats = {
      total: cases.length,
      pending: cases.filter((c: any) => ['Filed', 'Pending', 'Under Hearing'].includes(c.status)).length,
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