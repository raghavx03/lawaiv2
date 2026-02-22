export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getServerUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const performance = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Prisma not available')
      
      const [draftsCount, conversationsCount, researchCount, summariesCount] = await Promise.all([
        prisma.draft.count({ where: { userId: user.id } }),
        prisma.chatSession.count({ where: { userId: user.id } }),
        prisma.research.count({ where: { userId: user.id } }),
        prisma.summary.count({ where: { userId: user.id } })
      ])

      const totalQueries = draftsCount + conversationsCount + researchCount + summariesCount
      
      return {
        totalQueries,
        drafts: draftsCount,
        conversations: conversationsCount,
        research: researchCount,
        summaries: summariesCount,
        efficiency: totalQueries > 0 ? Math.min(95, 70 + (totalQueries * 2)) : 0
      }
    }, {
      totalQueries: 0,
      drafts: 0,
      conversations: 0,
      research: 0,
      summaries: 0,
      efficiency: 0
    })
    
    return NextResponse.json(performance)
  } catch (error) {
    console.error('AI performance fetch error:', error)
    return NextResponse.json({
      totalQueries: 0,
      drafts: 0,
      conversations: 0,
      research: 0,
      summaries: 0,
      efficiency: 0
    })
  }
}