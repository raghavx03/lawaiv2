// Simple in-memory IP rate limiting
const ipUsage = new Map<string, { count: number; resetTime: number }>()

export function checkIPRateLimit(ip: string, maxRequests: number = 3): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000
  
  // Clean old entries
  for (const [key, value] of ipUsage.entries()) {
    if (now > value.resetTime) {
      ipUsage.delete(key)
    }
  }
  
  const usage = ipUsage.get(ip)
  
  if (!usage) {
    // First request from this IP
    const resetTime = now + dayInMs
    ipUsage.set(ip, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (now > usage.resetTime) {
    // Reset expired, start fresh
    const resetTime = now + dayInMs
    ipUsage.set(ip, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (usage.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: usage.resetTime }
  }
  
  // Increment usage
  usage.count++
  ipUsage.set(ip, usage)
  
  return { allowed: true, remaining: maxRequests - usage.count, resetTime: usage.resetTime }
}

export function getClientIP(request: Request): string {
  // Try various headers for IP detection
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (cfIP) {
    return cfIP.trim()
  }
  
  return 'unknown'
}