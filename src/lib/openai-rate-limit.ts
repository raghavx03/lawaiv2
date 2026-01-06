import { TTLCache } from './performance'

interface RateLimitConfig {
  requests: number
  windowMs: number
  tokensPerMinute: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  FREE: { requests: 10, windowMs: 60000, tokensPerMinute: 1000 },
  BASIC: { requests: 50, windowMs: 60000, tokensPerMinute: 5000 },
  PLUS: { requests: 100, windowMs: 60000, tokensPerMinute: 10000 },
  PRO: { requests: 200, windowMs: 60000, tokensPerMinute: 20000 }
}

const requestCache = new TTLCache<number>()
const tokenCache = new TTLCache<number>()

interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
}

export function checkOpenAIRateLimit(userId: string, plan: string, estimatedTokens: number = 100): boolean | RateLimitResult {
  const config = RATE_LIMITS[plan] || RATE_LIMITS.FREE
  
  // Check request rate limit
  const requestKey = `req_${userId}`
  const currentRequests = requestCache.get(requestKey) || 0
  
  if (currentRequests >= config.requests) {
    return { allowed: false, retryAfter: Math.ceil(config.windowMs / 1000) }
  }
  
  // Check token rate limit
  const tokenKey = `tok_${userId}`
  const currentTokens = tokenCache.get(tokenKey) || 0
  
  if (currentTokens + estimatedTokens > config.tokensPerMinute) {
    return { allowed: false, retryAfter: 60 }
  }
  
  // Update counters
  requestCache.set(requestKey, currentRequests + 1, config.windowMs)
  tokenCache.set(tokenKey, currentTokens + estimatedTokens, config.windowMs)
  
  return true
}

export function getRemainingRequests(userId: string, plan: string): number {
  const config = RATE_LIMITS[plan] || RATE_LIMITS.FREE
  const requestKey = `req_${userId}`
  const currentRequests = requestCache.get(requestKey) || 0
  return Math.max(0, config.requests - currentRequests)
}