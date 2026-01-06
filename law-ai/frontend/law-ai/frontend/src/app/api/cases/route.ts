export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cases = await prisma.caseTracker.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    // Transform to match frontend expectations
    const transformedCases = cases.map(case_ => ({
      id: case_.id,
      title: case_.partyName,
      description: `Case: ${case_.cnr}`,
      clientName: case_.partyName,
      status: case_.status.toLowerCase().replace(' ', '_'),
      createdAt: case_.createdAt.toISOString(),
      updatedAt: case_.updatedAt.toISOString()
    }))
    
    return NextResponse.json(transformedCases)
  } catch (error) {
    console.error('Cases GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, clientName, status } = await request.json()
    
    if (!title || !clientName) {
      return NextResponse.json({ error: 'Title and client name are required' }, { status: 400 })
    }
    
    const case_ = await prisma.caseTracker.create({
      data: { 
        cnr: `CASE-${Date.now()}`,
        partyName: clientName,
        court: 'District Court',
        status: status === 'open' ? 'Filed' : 'Pending',
        lastUpdate: new Date(),
        userId: user.id,
        details: {
          title,
          description: description || '',
          caseType: 'General'
        }
      }
    })
    
    // Transform response to match frontend expectations
    const transformedCase = {
      id: case_.id,
      title: case_.partyName,
      description: `Case: ${case_.cnr}`,
      clientName: case_.partyName,
      status: case_.status.toLowerCase().replace(' ', '_'),
      createdAt: case_.createdAt.toISOString(),
      updatedAt: case_.updatedAt.toISOString()
    }
    
    return NextResponse.json(transformedCase)
  } catch (error) {
    console.error('Cases POST error:', error)
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}