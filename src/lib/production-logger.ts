import { sanitizeForLog } from './security/input-sanitizer'

interface ErrorContext {
  userId?: string
  endpoint?: string
  userAgent?: string
  ip?: string
}

class ProductionLogger {
  private static instance: ProductionLogger

  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger()
    }
    return ProductionLogger.instance
  }

  logError(error: Error | string, context?: ErrorContext) {
    const sanitizedContext = {
      userId: context?.userId ? sanitizeForLog(context.userId) : undefined,
      endpoint: context?.endpoint ? sanitizeForLog(context.endpoint) : undefined,
      userAgent: context?.userAgent ? sanitizeForLog(context.userAgent) : undefined,
      ip: context?.ip ? sanitizeForLog(context.ip) : undefined
    }

    const errorLog = {
      message: typeof error === 'string' ? sanitizeForLog(error) : sanitizeForLog(error.message),
      stack: typeof error === 'object' ? error.stack : undefined,
      context: sanitizedContext,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }

    // Console logging (captured by Docker/PM2)
    console.error('[LAW-AI ERROR]', JSON.stringify(errorLog))

    // Send to external monitoring in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalMonitoring(errorLog).catch(() => {
        // Silent fail for monitoring
      })
    }
  }

  logInfo(message: string, context?: Record<string, any>) {
    const sanitizedMessage = sanitizeForLog(message)
    const sanitizedContext = context ? 
      Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key, 
          typeof value === 'string' ? sanitizeForLog(value) : value
        ])
      ) : undefined

    console.log('[LAW-AI INFO]', JSON.stringify({
      message: sanitizedMessage,
      context: sanitizedContext,
      timestamp: new Date().toISOString()
    }))
  }

  private async sendToExternalMonitoring(errorLog: any) {
    // Send to monitoring service (Sentry, DataDog, etc.)
    try {
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog)
      })
    } catch (e) {
      // Silent fail
    }
  }
}

export const logger = ProductionLogger.getInstance()

// API wrapper with automatic error logging
export function withErrorLogging<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      logger.logError(error as Error, { endpoint })
      throw error
    }
  }
}