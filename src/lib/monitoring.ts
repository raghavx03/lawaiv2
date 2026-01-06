import { sanitizeForLog } from './security/input-sanitizer-enhanced'

interface ErrorReport {
  message: string
  stack?: string
  userId?: string
  url?: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
}

class SimpleMonitoring {
  private errors: ErrorReport[] = []
  private maxErrors = 100

  captureException(error: Error, context?: { userId?: string; extra?: any }) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      userId: context?.userId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
      level: 'error'
    }

    this.errors.push(report)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Monitoring:', sanitizeForLog(report))
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      this.sendToSentry(report)
    }
  }

  captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info') {
    const report: ErrorReport = {
      message,
      timestamp: Date.now(),
      level,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    this.errors.push(report)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }
  }

  private async sendToSentry(report: ErrorReport) {
    try {
      // Simple Sentry-compatible error reporting
      await fetch('https://sentry.io/api/embed/error-page/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: report.message,
          level: report.level,
          timestamp: report.timestamp,
          extra: { userId: report.userId, url: report.url }
        })
      })
    } catch (error) {
      console.warn('Failed to send error to Sentry:', sanitizeForLog(error))
    }
  }

  getRecentErrors(): ErrorReport[] {
    return this.errors.slice(-10)
  }
}

export const monitoring = new SimpleMonitoring()

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    monitoring.captureException(new Error(event.message), {
      extra: { filename: event.filename, lineno: event.lineno }
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    monitoring.captureException(new Error(event.reason))
  })
}