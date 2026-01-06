export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'
import { callAIService } from '@/lib/ai-service'
import { checkIPRateLimit, getClientIP } from '@/lib/ip-rate-limit'

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Check IP rate limit (3 queries per day)
    const clientIP = getClientIP(request)
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
    
    const body = await request.json()
    const { message, sessionId } = chatSchema.parse(body)
    const userId = `ip-${clientIP}`
    const sanitizedMessage = sanitizeInput(message)

    // Get or create session (with fallback)
    let session
    try {
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
      console.warn('Database session error, using fallback:', sanitizeForLog(dbError))
      session = {
        id: 'fallback-session-' + Date.now(),
        userId,
        title: 'Chat Session',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Prepare conversation
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful legal AI assistant. Provide accurate legal information while reminding users to consult qualified legal professionals. Use clear formatting without asterisks (*) for emphasis. Use proper headings and bullet points instead.'
      },
      ...session.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: sanitizedMessage }
    ]

    // Add user message to database (with fallback)
    try {
      if (prisma && session.id.startsWith('fallback-') === false) {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'user',
            content: sanitizedMessage,
            citations: []
          }
        })
      }
    } catch (dbError) {
      console.warn('Failed to save user message:', sanitizeForLog(dbError))
    }

    // Call AI service (Gemini for free users)
    const aiResponse = await callAIService(messages, 'FREE', 1000, 0.7)
    const assistantMessage = aiResponse.content

    if (!assistantMessage) {
      throw new Error('No response generated')
    }

    // Save assistant response (with fallback)
    try {
      if (prisma && session.id.startsWith('fallback-') === false) {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: 'assistant',
            content: assistantMessage,
            citations: []
          }
        })
      }
    } catch (dbError) {
      console.warn('Failed to save assistant message:', sanitizeForLog(dbError))
    }

    return NextResponse.json({
      ok: true,
      message: assistantMessage,
      sessionId: session.id,
      remaining: rateLimit.remaining,
      info: rateLimit.remaining === 0 ? 'This was your last free AI query today. Sign up for unlimited access!' : `${rateLimit.remaining} AI queries remaining today`
    })
  } catch (error) {
    console.error('Chat API error:', sanitizeForLog(error))
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage === 'Request timeout') {
      return NextResponse.json({ 
        ok: false, 
        code: 'TIMEOUT', 
        message: 'Request timed out. Please try again.' 
      }, { status: 408 })
    }
    
    if (errorMessage.includes('AI')) {
      return NextResponse.json({ 
        ok: false, 
        code: 'AI_ERROR', 
        message: 'AI service temporarily unavailable' 
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      ok: false, 
      code: 'INTERNAL_ERROR', 
      message: 'An unexpected error occurred' 
    }, { status: 500 })
  }
}