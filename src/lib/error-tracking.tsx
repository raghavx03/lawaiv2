// Error tracking utility
// Replace with Sentry or your preferred error tracking service

interface ErrorContext {
  userId?: string
  page?: string
  action?: string
  extra?: Record<string, any>
}

class ErrorTracker {
  private static instance: ErrorTracker
  private isInitialized = false

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  init() {
    if (this.isInitialized) return
    
    // Initialize error tracking (e.g., Sentry)
    // Sentry.init({
    //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: 1.0,
    // })
    
    // Global error handler
    if (typeof window !== 'undefined') {
      window.onerror = (message, source, lineno, colno, error) => {
        this.captureException(error || new Error(String(message)), {
          extra: { source, lineno, colno }
        })
      }

      window.onunhandledrejection = (event) => {
        this.captureException(event.reason, {
          action: 'unhandledrejection'
        })
      }
    }

    this.isInitialized = true
    console.log('Error tracking initialized')
  }

  captureException(error: Error | unknown, context?: ErrorContext) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Captured Error:', errorObj, context)
    }

    // Send to error tracking service
    // Sentry.captureException(errorObj, {
    //   extra: context
    // })

    // You can also send to your own API
    this.sendToAPI(errorObj, context)
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}]`, message, context)
    }

    // Sentry.captureMessage(message, level)
  }

  setUser(userId: string, email?: string) {
    // Sentry.setUser({ id: userId, email })
    console.log('User set for error tracking:', userId)
  }

  clearUser() {
    // Sentry.setUser(null)
  }

  private async sendToAPI(error: Error, context?: ErrorContext) {
    try {
      // Optional: Send errors to your own API endpoint
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : 'server'
        })
      })
    } catch (e) {
      // Silently fail - don't want error tracking to cause more errors
    }
  }
}

export const errorTracker = ErrorTracker.getInstance()

// React Error Boundary helper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    // This would be implemented with a proper Error Boundary component
    return <Component {...props} />
  }
}

// Hook for tracking errors in components
export function useErrorTracking() {
  return {
    trackError: (error: Error, context?: ErrorContext) => {
      errorTracker.captureException(error, context)
    },
    trackMessage: (message: string, level?: 'info' | 'warning' | 'error') => {
      errorTracker.captureMessage(message, level)
    }
  }
}
