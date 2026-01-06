import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callAIService } from '@/lib/ai-service'

export const dynamic = 'force-dynamic'

// POST - Generate new legal notice with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { noticeType, recipient, recipientAddress, subject, details, amount, dueDate } = body

    if (!recipient || !subject) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Recipient and subject are required' 
      }, { status: 400 })
    }

    // Build context for AI
    let context = `Notice Type: ${noticeType || 'Legal Notice'}
Recipient: ${recipient}
${recipientAddress ? `Address: ${recipientAddress}` : ''}
Subject: ${subject}
${amount ? `Amount: ₹${amount}` : ''}
${dueDate ? `Due Date: ${dueDate}` : ''}
${details ? `Additional Details: ${details}` : ''}`

    // Generate legal notice using AI
    const messages = [
      {
        role: 'system' as const,
        content: `You are a legal expert specializing in drafting formal legal notices under Indian law. Generate professional legal notices with:
- Proper legal formatting and structure
- Formal legal language
- Reference to relevant laws and sections
- Clear demands and timelines
- Professional closing

Do not use asterisks for formatting. Use proper headings and paragraphs.`
      },
      {
        role: 'user' as const,
        content: `Generate a professional legal notice with the following details:\n\n${context}\n\nFormat it as a formal legal notice ready to be sent.`
      }
    ]

    const aiResponse = await callAIService(messages, 'FREE', 2000, 0.3)
    const content = aiResponse.content

    if (!content) {
      throw new Error('Failed to generate notice')
    }

    // Try to save to database
    let savedNotice = null
    try {
      if (prisma) {
        savedNotice = await prisma.notice.create({
          data: {
            userId: 'anonymous',
            type: noticeType || 'legal',
            title: subject,
            content: content,
            recipient: recipient
          }
        })
      }
    } catch (dbError) {
      console.warn('Database save failed:', dbError)
    }

    return NextResponse.json({
      ok: true,
      id: savedNotice?.id || `temp-${Date.now()}`,
      content: content,
      type: noticeType,
      recipient: recipient,
      subject: subject,
      createdAt: savedNotice?.createdAt || new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Notice generation error:', error)
    return NextResponse.json({ 
      ok: false, 
      message: error.message || 'Failed to generate notice' 
    }, { status: 500 })
  }
}

// GET - Fetch notice history
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json([])
    }

    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        recipient: true,
        createdAt: true
      }
    })

    // Map to expected format
    const formattedNotices = notices.map(n => ({
      id: n.id,
      type: n.type,
      subject: n.title,
      content: n.content,
      recipient: n.recipient,
      createdAt: n.createdAt
    }))

    return NextResponse.json(formattedNotices)
  } catch (error) {
    console.error('Get notices error:', error)
    return NextResponse.json([])
  }
}
