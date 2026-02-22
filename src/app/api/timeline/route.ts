export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'

// GET recent activities across all cases for dashboard
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const caseId = searchParams.get('caseId')

    const activities = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return []

      // Try new CaseActivity model first
      try {
        const whereClause: any = { userId: user.id }
        if (caseId) whereClause.caseId = caseId

        const results = await (prisma as any).caseActivity.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            case: {
              select: {
                id: true,
                title: true,
                cnrNumber: true
              }
            }
          }
        })

        return results.map((a: any) => ({
          id: a.id,
          type: a.type,
          feature: a.feature,
          title: a.title,
          content: a.content?.substring(0, 200),
          caseId: a.caseId,
          caseTitle: a.case?.title,
          caseCnr: a.case?.cnrNumber,
          referenceId: a.referenceId,
          createdAt: a.createdAt
        }))
      } catch (e) {
        // Fallback: aggregate from multiple tables
        const [chats, drafts, summaries] = await Promise.all([
          prisma.chatSession.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } }
          }),
          prisma.draft.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
          }),
          prisma.summary.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
          })
        ])

        const activities = [
          ...chats.map(c => ({
            id: c.id,
            type: 'AI_CHAT',
            feature: 'AI_ASSISTANT',
            title: c.title || 'AI Conversation',
            content: c.messages[0]?.content?.substring(0, 200),
            caseId: c.caseId,
            createdAt: c.updatedAt
          })),
          ...drafts.map(d => ({
            id: d.id,
            type: 'DRAFT_CREATED',
            feature: 'DRAFTS',
            title: d.title,
            content: `Created ${d.type} document`,
            caseId: d.caseId,
            createdAt: d.createdAt
          })),
          ...summaries.map(s => ({
            id: s.id,
            type: 'SUMMARY_CREATED',
            feature: 'JUDGMENT_SUMMARIZER',
            title: s.title,
            content: s.summary?.substring(0, 200),
            caseId: s.caseId,
            createdAt: s.createdAt
          }))
        ]

        return activities
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      }
    }, [])

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Timeline GET error:', error)
    return NextResponse.json({ activities: [] })
  }
}
