// Robust in-memory rate limiter with LRU cache and auto-cleanup
// Serves as a fallback when database rate limiting is unavailable

interface RateLimitInfo {
  count: number
  resetTime: number
}

// Map to store rate limit data
const ipCache = new Map<string, RateLimitInfo>()

// Max cache size to prevent memory leaks
const MAX_CACHE_SIZE = 10000

// Automatic cleanup interval (every hour)
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of ipCache.entries()) {
    if (now > value.resetTime) {
      ipCache.delete(key)
    }
  }
}, 60 * 60 * 1000)

export function checkIPRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMinutes: number = 60 * 24 // 24 hours by default
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowMs = windowMinutes * 60 * 1000

  // LRU eviction if cache is full
  if (ipCache.size >= MAX_CACHE_SIZE) {
    const iterator = ipCache.keys()
    const firstKey = iterator.next().value
    if (firstKey) ipCache.delete(firstKey)
  }

  const usage = ipCache.get(ip)

  // New entry
  if (!usage) {
    const resetTime = now + windowMs
    ipCache.set(ip, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }

  // Time window expired
  if (now > usage.resetTime) {
    const resetTime = now + windowMs
    ipCache.set(ip, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }

  // Rate limit exceeded
  if (usage.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: usage.resetTime }
  }

  // Increment usage
  usage.count++
  // Refresh the entry to mark as recently used
  ipCache.delete(ip)
  ipCache.set(ip, usage)

  return { allowed: true, remaining: maxRequests - usage.count, resetTime: usage.resetTime }
}

export function getClientIP(request: Request): string {
  // Try various headers for authentic IP
  const headers = request.headers
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()

  const realIP = headers.get('x-real-ip')
  if (realIP) return realIP.trim()

  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP) return cfIP.trim()

  return 'unknown-ip'
}