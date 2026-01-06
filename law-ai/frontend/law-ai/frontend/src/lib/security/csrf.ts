import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function signCSRFToken(token: string): string {
  const hmac = crypto.createHmac('sha256', CSRF_SECRET)
  hmac.update(token)
  return hmac.digest('hex')
}

export function verifyCSRFToken(token: string, signature: string): boolean {
  if (!token || !signature || token.length > 64 || signature.length > 64) {
    return false
  }
  
  try {
    const expectedSignature = signCSRFToken(token)
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
  } catch {
    return false
  }
}

export function csrfGuard(request: NextRequest): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true
  }

  const token = request.headers.get('x-csrf-token')
  const cookieValue = request.cookies.get('csrf-token')?.value

  if (!token || !cookieValue) {
    return false
  }

  try {
    const parts = cookieValue.split('.')
    if (parts.length !== 2) return false
    const [tokenValue, signature] = parts
    if (!tokenValue || !signature) return false
    return token === tokenValue && verifyCSRFToken(tokenValue, signature)
  } catch {
    return false
  }
}

export function getCSRFToken(request: NextRequest): string | null {
  const cookieValue = request.cookies.get('csrf-token')?.value
  if (!cookieValue) return null
  
  try {
    const parts = cookieValue.split('.')
    return parts.length === 2 && parts[0] ? parts[0] : null
  } catch {
    return null
  }
}

export function setCSRFCookie(response: NextResponse): NextResponse {
  const token = generateCSRFToken()
  const signature = signCSRFToken(token)
  const cookieValue = `${token}.${signature}`
  
  response.cookies.set('csrf-token', cookieValue, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  })
  
  return response
}