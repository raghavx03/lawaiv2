import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { hasFeatureAccess } from '@/lib/feature-access'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Sample legal data for testing
const sampleLegalData = {
  sections: [
    {
      id: '1',
      section: '420',
      act: 'Indian Penal Code',
      title: 'Cheating and dishonestly inducing delivery of property',
      content: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
      year: '1860'
    },
    {
      id: '2',
      section: '302',
      act: 'Indian Penal Code',
      title: 'Punishment for murder',
      content: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
      year: '1860'
    },
    {
      id: '3',
      section: '379',
      act: 'Indian Penal Code',
      title: 'Punishment for theft',
      content: 'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
      year: '1860'
    }
  ],
  cases: [
    {
      id: '1',
      title: 'State of Maharashtra v. Mohd. Yakub',
      court: 'Supreme Court of India',
      year: '2013',
      citation: '2013 SCC 313',
      summary: 'Landmark case on terrorism and conspiracy charges'
    },
    {
      id: '2',
      title: 'Kesavananda Bharati v. State of Kerala',
      court: 'Supreme Court of India',
      year: '1973',
      citation: '1973 AIR 1461',
      summary: 'Basic structure doctrine of the Constitution'
    }
  ]
}

const researchSchema = z.object({
  q: z.string().min(1).max(500),
  type: z.enum(['all', 'section', 'case_law']).default('all')
})

export const GET = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type')
    
    const { q, type: searchType } = researchSchema.parse({ q: query, type })
    const userId = auth.user.id

    const userProfile = await prisma.userApp.findUnique({
      where: { userId },
      select: { plan: true }
    })

    if (!userProfile || !hasFeatureAccess(userProfile.plan, 'RESEARCH')) {
      return NextResponse.json({ 
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Research feature not available in your plan'
      }, { status: 403 })
    }

    const usageCheck = await checkUsageLimit(userId, 'RESEARCH')
    if (!usageCheck.allowed) {
      return NextResponse.json({ 
        ok: false, 
        code: 'USAGE_LIMIT', 
        message: 'Usage limit reached',
        reason: usageCheck.reason 
      }, { status: 402 })
    }

    const sanitizedQuery = sanitizeInput(q).toLowerCase()

    let results: any = { sections: [], cases: [], total: 0 }

    // Search sections
    if (searchType === 'all' || searchType === 'section') {
      results.sections = sampleLegalData.sections.filter(section => 
        section.title.toLowerCase().includes(sanitizedQuery) ||
        section.content.toLowerCase().includes(sanitizedQuery) ||
        section.section.includes(sanitizedQuery) ||
        section.act.toLowerCase().includes(sanitizedQuery)
      )
    }

    // Search cases
    if (searchType === 'all' || searchType === 'case_law') {
      results.cases = sampleLegalData.cases.filter(case_ => 
        case_.title.toLowerCase().includes(sanitizedQuery) ||
        case_.summary.toLowerCase().includes(sanitizedQuery) ||
        case_.court.toLowerCase().includes(sanitizedQuery)
      )
    }

    results.total = results.sections.length + results.cases.length

    // Add AI-powered legal analysis
    try {
      const { callAIService } = await import('@/lib/ai-service')
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a legal research expert specializing in Indian law. Provide comprehensive legal analysis, relevant case laws, and statutory provisions.'
        },
        {
          role: 'user' as const,
          content: `Provide legal research analysis for: "${sanitizedQuery}". Include relevant sections, case laws, and legal principles.`
        }
      ]
      
      const aiResponse = await callAIService(messages, userProfile.plan, 1500, 0.5)
      results.aiAnalysis = aiResponse.content
    } catch (error) {
      console.error('AI research analysis failed:', error)
      results.aiAnalysis = 'AI analysis temporarily unavailable'
    }

    // Save research query
    await prisma.research.create({
      data: {
        userId,
        query: sanitizedQuery,
        result: JSON.stringify(results),
        type: searchType
      }
    })

    await incrementUsage(userId, 'RESEARCH')

    // Add search metadata
    results.query = sanitizedQuery
    results.type = searchType
    results.timestamp = new Date().toISOString()

    return NextResponse.json({ ok: true, ...results })
  },
  { requireAuth: true }
)