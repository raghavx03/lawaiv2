export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Prisma not available')
      
      const [cases, drafts, research] = await Promise.all([
        prisma.caseTracker.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: 'desc' },
          take: 2,
          select: {
            id: true,
            partyName: true,
            updatedAt: true,
            status: true
          }
        }),
        prisma.draft.findMany({
          where: { userId: user.id },
          orderBy: { updatedAt: 'desc' },
          take: 2,
          select: {
            id: true,
            title: true,
            updatedAt: true,
            type: true
          }
        }),
        prisma.research.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            query: true,
            createdAt: true,
            type: true
          }
        })
      ])

      const allUpdates = [
        ...cases.map(c => ({
          id: c.id,
          type: 'case',
          title: c.partyName,
          subtitle: `Status: ${c.status}`,
          timestamp: c.updatedAt,
          color: 'blue'
        })),
        ...drafts.map(d => ({
          id: d.id,
          type: 'draft',
          title: d.title,
          subtitle: d.type,
          timestamp: d.updatedAt,
          color: 'green'
        })),
        ...research.map(r => ({
          id: r.id,
          type: 'research',
          title: r.query.substring(0, 50) + '...',
          subtitle: 'Legal Research',
          timestamp: r.createdAt,
          color: 'purple'
        }))
      ]

      return allUpdates
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
    }, [])
    
    return NextResponse.json(updates)
  } catch (error) {
    console.error('Recent updates fetch error:', error)
    return NextResponse.json([])
  }
}