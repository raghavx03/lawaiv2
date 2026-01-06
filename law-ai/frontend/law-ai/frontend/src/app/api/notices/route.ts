export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { hasFeatureAccess } from '@/lib/feature-access'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { env } from '@/lib/env'

const noticeSchema = z.object({
  noticeType: z.string().min(1).max(100),
  recipient: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  details: z.string().min(1).max(2000)
})

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json()
    const { noticeType, recipient, subject, details } = noticeSchema.parse(body)
    const userId = auth.user.id

    const userProfile = await prisma.userApp.findUnique({
      where: { userId },
      select: { plan: true }
    })

    if (!userProfile || !hasFeatureAccess(userProfile.plan, 'NOTICES')) {
      return NextResponse.json({ 
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Feature not available in your plan'
      }, { status: 403 })
    }

    const usageCheck = await checkUsageLimit(userId, 'NOTICES')
    if (!usageCheck.allowed) {
      return NextResponse.json({ 
        ok: false, 
        code: 'USAGE_LIMIT', 
        message: 'Usage limit reached',
        reason: usageCheck.reason 
      }, { status: 402 })
    }

    const sanitizedNoticeType = sanitizeInput(noticeType)
    const sanitizedRecipient = sanitizeInput(recipient)
    const sanitizedSubject = sanitizeInput(subject)
    const sanitizedDetails = sanitizeInput(details)

    // Generate legal notice using AI service (Gemini for free users, OpenAI for paid users)
    const { callAIService } = await import('@/lib/ai-service')
    
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a legal expert specializing in drafting formal legal notices. Generate professional legal notices with proper legal formatting, language, and structure according to Indian law.'
      },
      {
        role: 'user' as const,
        content: `Generate a professional legal notice for ${sanitizedNoticeType} with the following details:\nRecipient: ${sanitizedRecipient}\nSubject: ${sanitizedSubject}\nDetails: ${sanitizedDetails}\n\nPlease format it as a formal legal notice with proper legal language, structure, and formatting.`
      }
    ]
    
    const aiResponse = await callAIService(messages, userProfile.plan, 2000, 0.3)
    const content = aiResponse.content
    
    if (!content) {
      return NextResponse.json({ ok: false, code: 'AI_ERROR', message: 'Failed to generate notice' }, { status: 500 })
    }

    const notice = await prisma.notice.create({
      data: {
        userId,
        type: sanitizedNoticeType,
        title: sanitizedSubject,
        content,
        recipient: sanitizedRecipient
      }
    })

    await incrementUsage(userId, 'NOTICES')

    return NextResponse.json({ 
      ok: true,
      id: notice.id, 
      content, 
      type: sanitizedNoticeType, 
      recipient: sanitizedRecipient, 
      subject: sanitizedSubject, 
      createdAt: notice.createdAt 
    })
  },
  { requireAuth: true, requireCSRF: true }
)

export const GET = createGuardedHandler(
  async (_request: NextRequest, { auth }) => {
    const notices = await prisma.notice.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        recipient: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ ok: true, notices })
  },
  { requireAuth: true }
)