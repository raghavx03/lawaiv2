// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Enhanced input sanitization (server-safe)
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Server-safe sanitization without DOMPurify
  return input
    .trim()
    .replace(/[<>"']/g, '') // Remove basic XSS chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\$\{.*\}/g, '') // Remove template literals
    .replace(/[\r\n\t]/g, '_') // Replace newlines for log safety
    .substring(0, 10000) // Limit length
}

/**
 * Sanitize log data to prevent log injection
 */
export function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    return sanitizeInput(data)
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[sanitizeInput(key)] = sanitizeLogData(value)
    }
    return sanitized
  }
  
  return data
}

/**
 * Rate limiting function
 */
export function rateLimit(
  identifier: string, 
  maxRequests: number, 
  windowMs: number
): boolean {
  const now = Date.now()
  const key = identifier
  
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Sanitize database query parameters
 */
export function sanitizeQueryParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'number') {
      sanitized[key] = Math.max(0, Math.min(value, 1000000)) // Reasonable bounds
    } else if (typeof value === 'boolean') {
      sanitized[key] = value
    } else if (value === null || value === undefined) {
      sanitized[key] = value
    }
    // Skip other types for security
  }
  
  return sanitized
}

/**
 * Clean up rate limit store periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute