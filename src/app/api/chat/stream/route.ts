
export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { streamLegalResponse } from '@/lib/ai-service'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message = (body.message || '').trim()

    if (!message || message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if NVIDIA API key is configured
    if (!process.env.NVIDIA_LLAMA_API_KEY || process.env.NVIDIA_LLAMA_API_KEY.includes('your_')) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stream IMMEDIATELY — no auth check, no DB write before first byte
    // This ensures <200ms time-to-first-token
    const streamResponse = await streamLegalResponse(
      [{ role: 'user', content: message }]
    )

    return streamResponse

  } catch (error: any) {
    console.error('Streaming API Error:', error)
    const errorMessage = error?.message || 'AI service error'
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}