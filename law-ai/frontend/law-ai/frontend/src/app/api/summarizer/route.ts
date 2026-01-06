export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sanitizeInput, sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'
import { callAIService } from '@/lib/ai-service'
import { checkIPRateLimit, getClientIP } from '@/lib/ip-rate-limit'

const summarizerSchema = z.object({
  text: z.string().min(10).max(50000),
  title: z.string().min(1).max(200),
})

export async function POST(request: NextRequest) {
  try {
    // Check IP rate limit (3 summaries per day)
    const clientIP = getClientIP(request)
    const rateLimit = checkIPRateLimit(clientIP, 3)
    
    if (!rateLimit.allowed) {
      const hoursLeft = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60))
      return NextResponse.json({
        ok: false,
        message: `Daily limit reached (3 summaries per day). Try again in ${hoursLeft} hours or sign up for unlimited access.`,
        code: 'RATE_LIMIT_EXCEEDED',
        resetTime: rateLimit.resetTime
      }, { status: 429 })
    }
    
    const body = await request.json()
    const { text, title } = summarizerSchema.parse(body)
    const userId = `ip-${clientIP}`
    const sanitizedText = sanitizeInput(text)
    const sanitizedTitle = sanitizeInput(title)

    // Generate summary using AI service (Gemini for free users)
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a legal expert specializing in summarizing court judgments and legal documents. Provide concise, accurate summaries that capture the key legal principles, facts, and decisions. Use clear formatting without asterisks (*) for emphasis.'
      },
      {
        role: 'user' as const,
        content: `Please summarize this legal document titled "${sanitizedTitle}":\n\n${sanitizedText}`
      }
    ]

    const aiResponse = await callAIService(messages, 'FREE', 1000, 0.3)
    const summary = aiResponse.content
    
    if (!summary) {
      throw new Error('No summary generated')
    }

    // Save summary to database (with fallback)
    let savedSummary
    try {
      if (prisma) {
        savedSummary = await prisma.summary.create({
          data: {
            userId,
            title: sanitizedTitle,
            originalText: sanitizedText,
            summary,
          }
        })
      } else {
        throw new Error('Database unavailable')
      }
    } catch (dbError) {
      console.warn('Database save failed, returning summary only:', sanitizeForLog(dbError))
      savedSummary = {
        id: 'temp-' + Date.now(),
        title: sanitizedTitle,
        summary,
        createdAt: new Date()
      }
    }

    return NextResponse.json({
      ok: true,
      id: savedSummary.id,
      title: savedSummary.title,
      summary: savedSummary.summary,
      createdAt: savedSummary.createdAt,
      remaining: rateLimit.remaining,
      info: rateLimit.remaining === 0 ? 'This was your last free summary today. Sign up for unlimited access!' : `${rateLimit.remaining} summaries remaining today`
    })
  } catch (error) {
    console.error('Summarizer error:', sanitizeForLog(error))
    return NextResponse.json({ 
      ok: false, 
      code: 'INTERNAL_ERROR', 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const userId = `ip-${clientIP}`
    
    if (!prisma) {
      return NextResponse.json({ ok: true, summaries: [] })
    }
    
    const summaries = await prisma.summary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        summary: true,
        createdAt: true
      }
    })

    return NextResponse.json({ ok: true, summaries })
  } catch (error) {
    console.error('Get summaries error:', sanitizeForLog(error))
    return NextResponse.json({ ok: true, summaries: [] })
  }
}