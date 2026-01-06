import { prisma } from './prisma'

interface RateLimitConfig {
  key: string
  limit: number
  window: number // seconds
}

export async function rateLimit({ key, limit, window }: RateLimitConfig): Promise<boolean> {
  try {
    const now = new Date()
    const resetTime = new Date(now.getTime() + window * 1000)

    // Clean up expired entries
    await prisma.rateLimit.deleteMany({
      where: {
        resetTime: {
          lt: now
        }
      }
    })

    // Get or create rate limit entry
    const existing = await prisma.rateLimit.findUnique({
      where: { key }
    })

    if (!existing) {
      // Create new entry
      await prisma.rateLimit.create({
        data: {
          key,
          count: 1,
          resetTime
        }
      })
      return true
    }

    if (existing.resetTime < now) {
      // Reset expired entry
      await prisma.rateLimit.update({
        where: { key },
        data: {
          count: 1,
          resetTime
        }
      })
      return true
    }

    if (existing.count >= limit) {
      return false
    }

    // Increment counter
    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: (existing.count || 0) + 1
      }
    })

    return true
  } catch (error) {
    console.error('Rate limit error:', error)
    // Allow request on error (fail open)
    return true
  }
}

export function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`
}

export function getIPFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}