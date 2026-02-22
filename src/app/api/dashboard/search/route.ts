export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const user = await getServerUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const type = searchParams.get('type') || 'all'

    if (!query) {
      return NextResponse.json([])
    }

    const results = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Prisma not available')
      
      // Execute all queries in parallel for better performance
      const queries = []
      
      if (type === 'all' || type === 'cases') {
        queries.push(
          prisma.caseTracker.findMany({
            where: {
              userId: user.id,
              OR: [
                { partyName: { contains: query, mode: 'insensitive' } },
                { cnr: { contains: query, mode: 'insensitive' } },
                { court: { contains: query, mode: 'insensitive' } }
              ]
            },
            take: 5,
            select: {
              id: true,
              partyName: true,
              cnr: true,
              court: true,
              status: true
            }
          }).then(cases => cases.map(c => ({
            id: c.id,
            type: 'case' as const,
            title: c.partyName,
            subtitle: `${c.cnr} - ${c.court}`,
            status: c.status,
            url: `/case-tracker?id=${c.id}`
          })))
        )
      }

      if (type === 'all' || type === 'drafts') {
        queries.push(
          prisma.draft.findMany({
            where: {
              userId: user.id,
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { type: { contains: query, mode: 'insensitive' } }
              ]
            },
            take: 5,
            select: {
              id: true,
              title: true,
              type: true,
              createdAt: true
            }
          }).then(drafts => drafts.map(d => ({
            id: d.id,
            type: 'draft' as const,
            title: d.title,
            subtitle: d.type,
            status: 'completed',
            url: `/drafts?id=${d.id}`
          })))
        )
      }

      if (type === 'all' || type === 'crm') {
        queries.push(
          prisma.cRM.findMany({
            where: {
              userId: user.id,
              OR: [
                { clientName: { contains: query, mode: 'insensitive' } },
                { title: { contains: query, mode: 'insensitive' } }
              ]
            },
            take: 5,
            select: {
              id: true,
              clientName: true,
              title: true,
              status: true
            }
          }).then(clients => clients.map(c => ({
            id: c.id,
            type: 'client' as const,
            title: c.clientName,
            subtitle: c.title,
            status: c.status,
            url: `/crm?id=${c.id}`
          })))
        )
      }

      const results = await Promise.all(queries)
      const searchResults = results.flat()

      return searchResults.slice(0, 10)
    }, [])
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json([])
  }
}