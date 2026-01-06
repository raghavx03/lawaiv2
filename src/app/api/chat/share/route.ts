export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'

export const runtime = 'nodejs'

const shareSchema = z.object({
  sessionId: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = shareSchema.parse(body)
    
    // For now, use debug user - in production, get from auth
    const userId = 'debug-user'
    
    // Verify session exists and belongs to user
    const session = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      return await prisma.chatSession.findFirst({
        where: { 
          id: sessionId,
          userId 
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    }, null)
    
    if (!session) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Session not found' 
      }, { status: 404 })
    }
    
    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/chat/shared/${sessionId}`
    
    return NextResponse.json({ 
      ok: true, 
      shareUrl 
    })
    
  } catch (error) {
    console.error('Share chat error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to create share link' 
    }, { status: 500 })
  }
}

// Get shared chat for public viewing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Session ID required' 
      }, { status: 400 })
    }
    
    const session = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      return await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true
            }
          }
        }
      })
    }, null)
    
    if (!session) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Shared chat not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      ok: true, 
      session: {
        id: session.id,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt
      }
    })
    
  } catch (error) {
    console.error('Get shared chat error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to load shared chat' 
    }, { status: 500 })
  }
}