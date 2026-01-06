export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chats = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      const sessions = await prisma.chatSession.findMany({
        where: { userId: user.id },
        include: { 
          messages: { 
            orderBy: { createdAt: 'asc' },
            take: 10 
          } 
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })

      return sessions.flatMap(session => 
        session.messages.map(msg => ({
          id: msg.id,
          prompt: msg.role === 'user' ? msg.content : '',
          response: msg.role === 'assistant' ? msg.content : '',
          createdAt: msg.createdAt.toISOString()
        }))
      ).filter(chat => chat.prompt || chat.response)
    }, [])

    return NextResponse.json(chats)
  } catch (error) {
    console.error('AI Assistant GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await request.json()
    
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('Database unavailable')
      
      // Create or get existing session
      let session = await prisma.chatSession.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
      })

      if (!session) {
        session = await prisma.chatSession.create({
          data: {
            userId: user.id,
            title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '')
          }
        })
      }

      // Real AI response using Gemini/OpenAI
      const { callAIService } = await import('@/lib/ai-service')
      
      // Get user plan from database
      const userProfile = await prisma.userApp.findUnique({
        where: { userId: user.id },
        select: { plan: true }
      })
      
      const userPlan = userProfile?.plan || 'FREE'
      
      // Generate AI response with legal context
      const aiResponse = await callAIService([
        {
          role: 'system',
          content: 'You are an expert legal AI assistant specializing in Indian law. Provide accurate, helpful legal information while always including a disclaimer to consult a qualified lawyer.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], userPlan, 1500, 0.7)
      
      const response = aiResponse.content
      
      // Create user message and AI response
      await prisma.$transaction([
        prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'user',
            content: prompt,
            citations: []
          }
        }),
        prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'assistant',
            content: response,
            citations: []
          }
        }),
        prisma.chatSession.update({
          where: { id: session.id },
          data: { updatedAt: new Date() }
        })
      ])
      
      return {
        id: session.id,
        prompt,
        response,
        createdAt: new Date().toISOString()
      }
    }, {
      id: 'fallback',
      prompt,
      response: 'Service temporarily unavailable. Please try again later.',
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI Assistant POST error:', error)
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
  }
}