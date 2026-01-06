import { NextRequest, NextResponse } from 'next/server'
import { sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize all inputs for logging
    const sanitizedError = {
      message: sanitizeForLog(body.message),
      endpoint: sanitizeForLog(body.endpoint),
      userId: body.userId ? sanitizeForLog(body.userId) : undefined,
      severity: body.severity,
      timestamp: new Date().toISOString()
    }

    // Log to console (will be captured by Docker/PM2 logs)
    console.error('[PRODUCTION ERROR]', JSON.stringify(sanitizedError))

    // In production, you would send this to:
    // - Sentry
    // - DataDog
    // - CloudWatch
    // - Custom logging service

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error logging failed:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}