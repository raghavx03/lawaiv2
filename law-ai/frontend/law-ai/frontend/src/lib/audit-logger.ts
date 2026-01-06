import { safeDbOperation } from './prisma'

interface AuditEvent {
  userId: string
  action: string
  resource: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

const SENSITIVE_ACTIONS = [
  'LOGIN',
  'LOGOUT', 
  'PLAN_UPGRADE',
  'PAYMENT_SUCCESS',
  'PROFILE_UPDATE',
  'PASSWORD_CHANGE',
  'API_KEY_ROTATION',
  'ADMIN_ACCESS'
]

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  // Always log sensitive actions
  if (SENSITIVE_ACTIONS.includes(event.action)) {
    console.log(`[AUDIT] ${event.action} by ${event.userId} on ${event.resource}`, {
      timestamp: new Date().toISOString(),
      details: event.details,
      ip: event.ipAddress
    })
  }

  // Store in database if available
  await safeDbOperation(async () => {
    const { prisma } = await import('./prisma')
    await prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        details: event.details ? JSON.stringify(event.details) : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: new Date()
      }
    })
  }, null)
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || 'unknown'
}