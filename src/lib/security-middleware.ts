import { NextRequest, NextResponse } from 'next/server'
import { sanitizeInput } from './security/input-sanitizer'

export function withSecurity(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    // Rate limiting (IP tracking for future use)
    // const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // CSRF protection for POST/PUT/DELETE
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      if (!csrfToken) {
        return NextResponse.json({ error: 'CSRF token required' }, { status: 403 })
      }
    }

    // Input sanitization
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const body = await request.json()
        const sanitizedBody = sanitizeRequestBody(body)
        // Replace request body with sanitized version
        const newRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(sanitizedBody)
        })
        return handler(newRequest, context)
      } catch (e) {
        // If not JSON, proceed normally
      }
    }

    // Security headers
    const response = await handler(request, context)
    if (response instanceof NextResponse) {
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    
    return response
  }
}

function sanitizeRequestBody(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeRequestBody)
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeRequestBody(value)
    }
    return sanitized
  }
  return obj
}