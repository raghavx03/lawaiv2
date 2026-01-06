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

    const deadlines = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Prisma not available')
      
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      return await prisma.caseTracker.findMany({
        where: {
          userId: user.id,
          nextDate: {
            gte: now,
            lte: nextWeek
          }
        },
        orderBy: { nextDate: 'asc' },
        take: 5,
        select: {
          id: true,
          cnr: true,
          partyName: true,
          court: true,
          nextDate: true,
          status: true
        }
      })
    }, [])
    
    return NextResponse.json(deadlines)
  } catch (error) {
    console.error('Deadlines fetch error:', error)
    return NextResponse.json([])
  }
}