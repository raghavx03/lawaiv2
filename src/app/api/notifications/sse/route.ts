export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { validateApiAuth } from '@/lib/auth'

const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  // Temporarily disable SSE to prevent errors
  return new Response('SSE temporarily disabled', { status: 503 })

  const stream = new ReadableStream({
    start(controller) {
      connections.set(user.id, controller)
      
      try {
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId: user.id, timestamp: Date.now() })}\n\n`)
      } catch (error) {
        console.error('SSE connection error:', error)
        connections.delete(user.id)
        return
      }
      
      const keepAlive = setInterval(() => {
        try {
          if (connections.has(user.id)) {
            controller.enqueue(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`)
          } else {
            clearInterval(keepAlive)
          }
        } catch (error) {
          console.error('SSE ping error:', error)
          clearInterval(keepAlive)
          connections.delete(user.id)
        }
      }, 30000)
      
      const cleanup = () => {
        clearInterval(keepAlive)
        connections.delete(user.id)
        try {
          controller.close()
        } catch (error) {
          console.error('SSE cleanup error:', error)
        }
      }
      
      request.signal.addEventListener('abort', cleanup)
      
      // Cleanup on controller error
      controller.error = (error: any) => {
        console.error('SSE controller error:', error)
        cleanup()
      }
    },
    cancel() {
      connections.delete(user.id)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

// Notification sender function (internal use only)
function sendNotification(userId: string, notification: any) {
  const controller = connections.get(userId)
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`)
    } catch (error) {
      connections.delete(userId)
    }
  }
}