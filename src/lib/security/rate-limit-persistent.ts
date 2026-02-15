import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkIPRateLimit } from '@/lib/ip-rate-limit'

// Database-backed rate limiting for production with memory fallback
export async function rateLimitGuard(request: NextRequest, userId?: string): Promise<boolean> {
  // If we're in a critical failure state (DB down), fail open or use memory fallback
  try {
    const { _failSafeRateLimit } = await import('./fail-safe-rate-limit')
    return _failSafeRateLimit(request, userId)
  } catch (e) {
    // Ultimate fallback if even imports fail
    return true
  }
}

// Internal implementation
async function _failSafeRateLimit(request: NextRequest, userId?: string): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip'

  // 1. Try DB Rate Limiting (Persistent)
  try {
    const key = userId ? `user:${userId}` : `ip:${ip}`
    const limit = userId ? 100 : 20 // 100 req/min for users, 20 for IPs

    // Check if table exists implicitly via try/catch on query
    const now = new Date()
    const windowStart = new Date(now.getTime() - 60 * 1000) // 1 minute window

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Find existing record
      let record = await tx.rateLimit.findUnique({
        where: { key }
      })

      // If no record or expired, create/reset
      if (!record || record.resetTime < now) {
        // Upsert handles race conditions better
        record = await tx.rateLimit.upsert({
          where: { key },
          update: {
            count: 1,
            resetTime: new Date(now.getTime() + 60 * 1000),
            createdAt: now
          },
          create: {
            key,
            count: 1,
            resetTime: new Date(now.getTime() + 60 * 1000)
          }
        })
        return true
      }

      // Check limit
      if (record.count >= limit) {
        return false
      }

      // Increment
      await tx.rateLimit.update({
        where: { key },
        data: { count: record.count + 1 }
      })

      return true
    })

    return result

  } catch (dbError) {
    // 2. Fallback to Memory Rate Limiting (In-memory LRU)
    console.warn('DB Rate Limit failed, using memory fallback:', dbError)

    // For authenticated users, allow higher limits
    const limit = userId ? 50 : 10
    const result = checkIPRateLimit(userId || ip, limit, 1) // 1 minute window
    return result.allowed
  }
}