export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { sanitizeInput, sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'
import { callAIService } from '@/lib/ai-service'
import { checkIPRateLimit, getClientIP } from '@/lib/ip-rate-limit'
import { getServerUser } from '@/lib/auth'

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const user = await getServerUser(request).catch(() => null)

    // Rate limit for non-authenticated users
    if (!user) {
      const rateLimit = checkIPRateLimit(clientIP, 3)
      if (!rateLimit.allowed) {
        const hoursLeft = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60))
        return NextResponse.json({
          ok: false,
          message: `Daily limit reached (3 AI queries per day). Try again in ${hoursLeft} hours or sign up for unlimited access.`,
          code: 'RATE_LIMIT_EXCEEDED',
          resetTime: rateLimit.resetTime
        }, { status: 429 })
      }
    }

    const body = await request.json()
    const { message, sessionId } = chatSchema.parse(body)
    const userId = user?.id || `ip-${clientIP}`
    const sanitizedMessage = sanitizeInput(message)

    // Get or create session (with fallback)
    let session: any
    try {
      const { prisma } = await import('@/lib/prisma')
      if (prisma && sessionId) {
        session = await prisma.chatSession.findFirst({
          where: { id: sessionId, userId },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } }
        })
      }

      if (!session && prisma) {
        session = await prisma.chatSession.create({
          data: {
            userId,
            title: sanitizedMessage.length > 50 ? sanitizedMessage.substring(0, 50) + '...' : sanitizedMessage,
          },
          include: { messages: true }
        })
      }
    } catch (dbError) {
      console.warn('Database session error, using fallback')
      session = {
        id: 'fallback-session-' + Date.now(),
        userId,
        title: 'Chat Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    if (!session) {
      session = {
        id: 'fallback-session-' + Date.now(),
        userId,
        title: 'Chat Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Prepare conversation with legal citation enforcement
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert legal AI assistant specializing in Indian law. You help lawyers and legal professionals with accurate, well-cited legal information.

RESPONSE RULES:
1. Every legal claim must cite a specific source (Section, Article, Case law, Act, or Rule)
2. Use proper headings, numbered lists, and paragraphs for formatting
3. Do NOT use asterisks for emphasis
4. Always remind users to verify with a qualified legal professional
5. End responses with a "Sources" section listing all cited authorities
6. If you cannot find a source for a claim, state: "Source not confirmed -- consult a legal professional"
7. Use Indian legal terminology and cite Indian statutes and precedents`
      },
      ...session.messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: sanitizedMessage }
    ]

    // Save user message to database
    try {
      if (!session.id.startsWith('fallback-')) {
        const { prisma } = await import('@/lib/prisma')
        if (prisma) {
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: 'user',
              content: sanitizedMessage,
              citations: []
            }
          })
        }
      }
    } catch (dbError) {
      console.warn('Failed to save user message')
    }

    // Call NVIDIA AI service with citation enforcement
    const aiResponse = await callAIService(
      messages,
      user?.plan || 'FREE',
      4096,
      0.6
    )
    const assistantMessage = aiResponse.content

    if (!assistantMessage) {
      throw new Error('No response generated')
    }

    // Save assistant response
    try {
      if (!session.id.startsWith('fallback-')) {
        const { prisma } = await import('@/lib/prisma')
        if (prisma) {
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: 'assistant',
              content: assistantMessage,
              citations: aiResponse.citations || []
            }
          })
        }
      }
    } catch (dbError) {
      console.warn('Failed to save assistant message')
    }

    return NextResponse.json({
      ok: true,
      message: assistantMessage,
      sessionId: session.id,
      citations: aiResponse.citations || [],
      model: aiResponse.model,
      verified: aiResponse.verified
    })
  } catch (error) {
    console.error('Chat API error:', sanitizeForLog(error))

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('timeout')) {
      return NextResponse.json({
        ok: false, code: 'TIMEOUT',
        message: 'Request timed out. Please try again.'
      }, { status: 408 })
    }

    if (errorMessage.includes('NVIDIA') || errorMessage.includes('API')) {
      return NextResponse.json({
        ok: false, code: 'AI_ERROR',
        message: 'AI service temporarily unavailable. Please try again in a moment.'
      }, { status: 503 })
    }

    return NextResponse.json({
      ok: false, code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred'
    }, { status: 500 })
  }
}