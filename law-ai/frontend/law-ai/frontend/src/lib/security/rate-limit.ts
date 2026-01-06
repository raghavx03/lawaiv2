import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const ipLimits = new Map<string, RateLimitEntry>()
const userLimits = new Map<string, RateLimitEntry>()

const IP_LIMIT = 20 // requests per minute (reduced for security)
const USER_LIMIT = 60 // requests per minute (reduced for security)
const WINDOW_MS = 60 * 1000 // 1 minute

export function rateLimitGuard(request: NextRequest, userId?: string): boolean {
  const now = Date.now()
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Check IP rate limit
  const ipEntry = ipLimits.get(ip)
  if (!ipEntry || now > ipEntry.resetTime) {
    ipLimits.set(ip, { count: 1, resetTime: now + WINDOW_MS })
  } else {
    if (ipEntry.count >= IP_LIMIT) {
      return false
    }
    ipEntry.count++
  }
  
  // Check user rate limit if authenticated
  if (userId) {
    const userEntry = userLimits.get(userId)
    if (!userEntry || now > userEntry.resetTime) {
      userLimits.set(userId, { count: 1, resetTime: now + WINDOW_MS })
    } else {
      if (userEntry.count >= USER_LIMIT) {
        return false
      }
      userEntry.count++
    }
  }
  
  return true
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of ipLimits.entries()) {
    if (now > entry.resetTime) {
      ipLimits.delete(key)
    }
  }
  for (const [key, entry] of userLimits.entries()) {
    if (now > entry.resetTime) {
      userLimits.delete(key)
    }
  }
}, 5 * 60 * 1000)