import { NextRequest, NextResponse } from 'next/server'
import { validateApiAuth } from '@/lib/auth'
import { rateLimitGuard } from './rate-limit-persistent'
import { csrfGuard } from './csrf'

export async function authGuard(request: NextRequest) {
  const user = await validateApiAuth(request)
  if (!user) {
    return NextResponse.json({ ok: false, code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
  }
  return { user }
}

export function createGuardedHandler(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireCSRF?: boolean
    rateLimit?: boolean
  } = {}
) {
  return async (request: NextRequest, context: any = {}) => {
    try {
      // Rate limiting
      if (options.rateLimit !== false) {
        const user = options.requireAuth ? await validateApiAuth(request) : null
        const rateLimitPassed = await rateLimitGuard(request, user?.id)
        if (!rateLimitPassed) {
          return NextResponse.json({ ok: false, code: 'RATE_LIMIT', message: 'Too many requests' }, { status: 429 })
        }
      }

      // CSRF protection for mutations
      if (options.requireCSRF && request.method !== 'GET' && request.method !== 'HEAD') {
        if (!csrfGuard(request)) {
          return NextResponse.json({ ok: false, code: 'CSRF_ERROR', message: 'Invalid CSRF token' }, { status: 403 })
        }
      }

      // Authentication
      if (options.requireAuth) {
        const authResult = await authGuard(request)
        if (authResult instanceof NextResponse) {
          return authResult
        }
        context.auth = authResult
      }

      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json({ 
        ok: false, 
        code: 'INTERNAL_ERROR', 
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error' 
      }, { status: 500 })
    }
  }
}