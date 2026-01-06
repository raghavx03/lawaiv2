import { sanitizeForLog } from '../security/input-sanitizer-enhanced'

interface SecurityEvent {
  type: 'XSS_ATTEMPT' | 'SSRF_ATTEMPT' | 'SQL_INJECTION' | 'RATE_LIMIT_EXCEEDED' | 'AUTH_FAILURE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  ip?: string
  userAgent?: string
  details: any
  timestamp: Date
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private readonly maxEvents = 1000

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      details: sanitizeForLog(event.details)
    }

    this.events.push(securityEvent)
    
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      console.error('[SECURITY ALERT]', JSON.stringify(securityEvent))
    }
  }

  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit)
  }
}

export const securityMonitor = new SecurityMonitor()

export function detectXSSAttempt(input: string): boolean {
  const xssPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /<iframe/i, /eval\s*\(/i]
  return xssPatterns.some(pattern => pattern.test(input))
}

export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [/union\s+select/i, /drop\s+table/i, /delete\s+from/i, /--/, /\/\*/]
  return sqlPatterns.some(pattern => pattern.test(input))
}