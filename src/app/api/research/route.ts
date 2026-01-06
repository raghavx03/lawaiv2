import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callAIService } from '@/lib/ai-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST - Create new research query with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ 
        ok: false, 
        message: 'Please provide a valid search query' 
      }, { status: 400 })
    }

    const sanitizedQuery = query.trim().substring(0, 500)

    // Generate AI-powered legal research
    const messages = [
      {
        role: 'system' as const,
        content: `You are a legal research expert specializing in Indian law. Provide comprehensive, accurate legal analysis including:
- Relevant statutory provisions (IPC, CrPC, Constitution, etc.)
- Key case laws and precedents
- Legal principles and interpretations
- Practical implications

Format your response clearly with sections. Do not use asterisks for formatting.`
      },
      {
        role: 'user' as const,
        content: `Provide detailed legal research on: "${sanitizedQuery}"`
      }
    ]

    const aiResponse = await callAIService(messages, 'FREE', 2000, 0.5)
    const result = aiResponse.content

    if (!result) {
      throw new Error('No response from AI service')
    }

    // Try to save to database
    let savedResearch = null
    try {
      if (prisma) {
        savedResearch = await prisma.research.create({
          data: {
            userId: 'anonymous',
            query: sanitizedQuery,
            result: result,
            type: 'all'
          }
        })
      }
    } catch (dbError) {
      console.warn('Database save failed:', dbError)
    }

    return NextResponse.json({
      ok: true,
      id: savedResearch?.id || `temp-${Date.now()}`,
      query: sanitizedQuery,
      result: result,
      createdAt: savedResearch?.createdAt || new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Research error:', error)
    return NextResponse.json({ 
      ok: false, 
      message: error.message || 'Research failed. Please try again.' 
    }, { status: 500 })
  }
}

// GET - Fetch research history
export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json([])
    }

    const research = await prisma.research.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        query: true,
        result: true,
        createdAt: true
      }
    })

    return NextResponse.json(research)
  } catch (error) {
    console.error('Get research error:', error)
    return NextResponse.json([])
  }
}
