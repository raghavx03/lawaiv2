export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { hasFeatureAccess } from '@/lib/feature-access'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'

export const runtime = 'nodejs'

const streamSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional()
})

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json()
        const { message, sessionId } = streamSchema.parse(body)
        const sanitizedMessage = sanitizeInput(message)
        
        // Get authenticated user
        const { getServerUser } = await import('@/lib/auth/server')
        const user = await getServerUser()
        if (!user) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: 'Unauthorized' 
          })}\n\n`))
          controller.close()
          return
        }
        
        const userId = user.id
        const userProfile = { plan: user.user_metadata?.plan || 'FREE' }
        
        // Check feature access
        if (!hasFeatureAccess(userProfile.plan, 'AI_ASSISTANT')) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: 'Feature not available in your plan' 
          })}\n\n`))
          controller.close()
          return
        }
        
        // Get or create session
        console.log('Creating/finding session for user:', userId, 'sessionId:', sessionId)
        
        const session = await safeDbOperation(async () => {
          const { prisma } = await import('@/lib/prisma')
          if (!prisma) throw new Error('Database unavailable')
          
          let existingSession
          if (sessionId && sessionId !== `temp-${sessionId.split('-')[1]}`) {
            existingSession = await prisma.chatSession.findFirst({
              where: { id: sessionId, userId },
              include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } }
            })
            console.log('Found existing session:', !!existingSession)
          }

          if (!existingSession) {
            console.log('Creating new session')
            existingSession = await prisma.chatSession.create({
              data: {
                userId,
                title: sanitizedMessage.length > 50 ? sanitizedMessage.substring(0, 50) + '...' : sanitizedMessage,
              },
              include: { messages: true }
            })
            console.log('Created session with ID:', existingSession.id)
          }
          
          return existingSession
        }, {
          id: sessionId || `session-${Date.now()}`,
          userId,
          title: sanitizedMessage.length > 50 ? sanitizedMessage.substring(0, 50) + '...' : sanitizedMessage,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        // Save user message
        await safeDbOperation(async () => {
          const { prisma } = await import('@/lib/prisma')
          if (!prisma) return null
          
          return await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: 'user',
              content: sanitizedMessage,
              citations: []
            }
          })
        }, null)
        
        // Get AI response using server-side service
        const { callAIService } = await import('@/lib/ai-service')
        
        // Natural legal assistant prompt
        const systemPrompt = `You are an expert Indian legal assistant with decades of experience. Provide accurate, practical legal guidance.

Your expertise covers:
- Indian Penal Code (IPC) and Criminal Law
- Civil Procedure Code (CPC) and Civil Law  
- Constitutional Law and Fundamental Rights
- Corporate and Commercial Law
- Property and Real Estate Law
- Family and Personal Law
- Labour and Employment Law
- Consumer Protection Act
- Taxation and GST Law
- Intellectual Property Rights

Communication style:
- Respond naturally like a knowledgeable legal professional
- Use proper legal terminology and cite specific sections when applicable
- Provide practical, actionable legal advice
- Structure responses clearly with headings when helpful
- Be thorough but concise
- If uncertain, acknowledge limitations and suggest next steps
- Include brief disclaimer about consulting qualified lawyers

User Query: ${sanitizedMessage}`
        
        // Prepare conversation context
        const conversationMessages = [
          { role: 'system', content: systemPrompt },
          ...session.messages.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: sanitizedMessage }
        ]
        
        const aiResponse = await callAIService(conversationMessages, userProfile.plan)
        const responseContent = aiResponse.content
        
        // Stream the response word by word for better readability
        const words = responseContent.split(' ')
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '')
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            content: word,
            done: false 
          })}\n\n`))
          
          // Reasonable streaming speed
          await new Promise(resolve => setTimeout(resolve, 30))
        }
        
        // Save assistant response
        await safeDbOperation(async () => {
          const { prisma } = await import('@/lib/prisma')
          if (!prisma) return null
          
          return await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: 'assistant',
              content: responseContent,
              citations: []
            }
          })
        }, null)
        
        // Send completion signal
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          content: '',
          done: true,
          sessionId: session.id,
          title: session.title
        })}\n\n`))
        
        controller.close()
        
      } catch (error) {
        console.error('Streaming error:', error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          error: 'An error occurred while processing your request' 
        })}\n\n`))
        controller.close()
      }
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}