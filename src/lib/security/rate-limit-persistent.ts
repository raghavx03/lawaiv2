import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Database-backed rate limiting for production
export async function rateLimitGuard(request: NextRequest, userId?: string): Promise<boolean> {
  const now = Date.now()
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // IP-based rate limiting (30 requests per minute)
  const ipKey = `rate_limit_ip_${ip}`
  const ipLimit = 30
  const windowMs = 60 * 1000 // 1 minute
  
  try {
    // Use database for persistent rate limiting
    const ipRecord = await prisma.$queryRaw<Array<{count: number, reset_time: Date}>>`
      SELECT count, reset_time FROM rate_limits 
      WHERE key = ${ipKey} AND reset_time > NOW()
    `
    
    if (ipRecord.length > 0) {
      const record = ipRecord[0]
      if (record && record.count >= ipLimit) {
        return false
      }
      
      // Increment count
      await prisma.$executeRaw`
        UPDATE rate_limits 
        SET count = count + 1 
        WHERE key = ${ipKey}
      `
    } else {
      // Create new record
      await prisma.$executeRaw`
        INSERT INTO rate_limits (key, count, reset_time) 
        VALUES (${ipKey}, 1, ${new Date(now + windowMs)})
        ON CONFLICT (key) DO UPDATE SET 
          count = 1, 
          reset_time = ${new Date(now + windowMs)}
      `
    }
    
    // User-based rate limiting if authenticated (120 requests per minute)
    if (userId) {
      const userKey = `rate_limit_user_${userId}`
      const userLimit = 120
      
      const userRecord = await prisma.$queryRaw<Array<{count: number, reset_time: Date}>>`
        SELECT count, reset_time FROM rate_limits 
        WHERE key = ${userKey} AND reset_time > NOW()
      `
      
      if (userRecord.length > 0) {
        const record = userRecord[0]
        if (record && record.count >= userLimit) {
          return false
        }
        
        await prisma.$executeRaw`
          UPDATE rate_limits 
          SET count = count + 1 
          WHERE key = ${userKey}
        `
      } else {
        await prisma.$executeRaw`
          INSERT INTO rate_limits (key, count, reset_time) 
          VALUES (${userKey}, 1, ${new Date(now + windowMs)})
          ON CONFLICT (key) DO UPDATE SET 
            count = 1, 
            reset_time = ${new Date(now + windowMs)}
        `
      }
    }
    
    return true
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow request if rate limiting fails
    return true
  }
}

// Cleanup expired rate limit records (run periodically)
export async function cleanupRateLimits() {
  try {
    await prisma.$executeRaw`
      DELETE FROM rate_limits WHERE reset_time < NOW()
    `
  } catch (error) {
    console.error('Rate limit cleanup error:', error)
  }
}