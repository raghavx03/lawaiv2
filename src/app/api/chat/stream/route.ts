
export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { streamLegalResponse } from '@/lib/ai-service'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = (body.message || '').trim()

    if (!message || message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), { status: 400 })
    }

    // Stream IMMEDIATELY — no auth check, no DB write before first byte
    // This ensures <200ms time-to-first-token
    const streamResponse = await streamLegalResponse(
      [{ role: 'user', content: message }]
    )

    return streamResponse

  } catch (error) {
    console.error('Streaming API Error:', error)
    return new Response(JSON.stringify({ error: 'AI service error' }), { status: 500 })
  }
}