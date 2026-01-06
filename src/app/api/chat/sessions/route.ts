export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { createGuardedHandler } from '@/lib/security/guards'
import { safeDbOperation } from '@/lib/prisma'

export const GET = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    try {
      if (!auth?.user?.id) {
        return NextResponse.json({
          ok: false,
          sessions: [],
          error: 'User not authenticated'
        }, { status: 401 })
      }

      const userId = auth.user.id

      const sessions = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')
        
        return await prisma.chatSession.findMany({
          where: { userId },
          include: { 
            messages: { 
              orderBy: { createdAt: 'asc' },
              take: 50 // Limit messages per session
            } 
          },
          orderBy: { updatedAt: 'desc' },
          take: 20 // Limit total sessions
        })
      }, [])

      return NextResponse.json({
        ok: true,
        sessions: sessions || []
      })
    } catch (error) {
      console.error('Sessions API error:', error)
      return NextResponse.json({
        ok: false,
        sessions: [],
        error: 'Internal server error'
      }, { status: 500 })
    }
  },
  { requireAuth: false }
)

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    try {
      const userId = auth.user.id
      const { session } = await request.json()

      if (!session) {
        return NextResponse.json({ ok: false, error: 'Session data required' }, { status: 400 })
      }

      await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')
        
        // Upsert session
        await prisma.chatSession.upsert({
          where: { id: session.id },
          update: {
            title: session.title,
            updatedAt: new Date(session.updatedAt)
          },
          create: {
            id: session.id,
            userId,
            title: session.title,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          }
        })

        // Save messages
        if (session.messages && session.messages.length > 0) {
          for (const message of session.messages) {
            await prisma.chatMessage.upsert({
              where: { id: message.id },
              update: {
                content: message.content
              },
              create: {
                id: message.id,
                sessionId: session.id,
                role: message.role,
                content: message.content,
                createdAt: new Date(message.timestamp),
                citations: []
              }
            })
          }
        }
      }, null)

      return NextResponse.json({ ok: true })
    } catch (error) {
      console.error('Save session error:', error)
      return NextResponse.json({ ok: false, error: 'Failed to save session' }, { status: 500 })
    }
  },
  { requireAuth: true }
)