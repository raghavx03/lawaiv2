
export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { hasFeatureAccess } from '@/lib/feature-access'
import { streamLegalResponse } from '@/lib/ai-service'
import { getServerUser } from '@/lib/auth'

export const runtime = 'nodejs'

const streamSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = streamSchema.parse(body)
    const sanitizedMessage = sanitizeInput(message)

    // Get authenticated user
    const user = await getServerUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Check feature access
    if (!hasFeatureAccess(user, 'AI_ASSISTANT')) {
      return new Response(JSON.stringify({ error: 'Feature not available in your plan' }), { status: 403 })
    }

    const userId = user.id

    // Get or create session
    let validSessionId = sessionId
    if (!validSessionId || validSessionId.startsWith('temp-')) {
      const newSession = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')
        return prisma.chatSession.create({
          data: {
            userId,
            title: sanitizedMessage.substring(0, 50) + '...',
            messages: {
              create: {
                role: 'user',
                content: sanitizedMessage,
                citations: []
              }
            }
          }
        })
      }, null)
      validSessionId = newSession?.id
    } else {
      // Save user message to existing session
      await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) return
        await prisma.chatMessage.create({
          data: {
            sessionId: validSessionId!,
            role: 'user',
            content: sanitizedMessage,
            citations: []
          }
        })
      }, null)
    }

    // Call the AI Service with Streaming
    // We pass a unique callback to save the *completed* AI response to DB
    const onFinish = async (completion: string) => {
      if (validSessionId) {
        await safeDbOperation(async () => {
          const { prisma } = await import('@/lib/prisma')
          if (!prisma) return
          await prisma.chatMessage.create({
            data: {
              sessionId: validSessionId!,
              role: 'assistant',
              content: completion,
              citations: [] // Citations in streaming are embedded in text
            }
          })
        }, null)
      }
    }

    // Call streamLegalResponse
    // IMPORTANT: Ensure headers are set for SSE
    const streamResponse = await streamLegalResponse(
      [{ role: 'user', content: sanitizedMessage }],
      onFinish
    )

    // Return the response directly
    return streamResponse

  } catch (error) {
    console.error('Streaming API Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}