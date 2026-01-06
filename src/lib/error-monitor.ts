interface ErrorLog {
  message: string
  stack?: string
  url: string
  timestamp: string
  userAgent: string
}

declare global {
  interface Window {
    ErrorMonitor: typeof ErrorMonitor;
  }
}

export class ErrorMonitor {
  private static instance: ErrorMonitor
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ErrorMonitor()
      if (typeof window !== 'undefined') {
        window.ErrorMonitor = ErrorMonitor
      }
    }
    return this.instance
  }
  
  init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleError.bind(this))
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
    }
  }
  
  private handleError(event: ErrorEvent) {
    this.logError({
      message: event.message,
      stack: event.error?.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }
  
  private handlePromiseRejection(event: PromiseRejectionEvent) {
    this.logError({
      message: `Unhandled Promise Rejection: ${event.reason}`,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }
  
  logError(error: ErrorLog) {
    console.error('🚨 Error logged:', error)
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      }).catch(() => {}) // Silent fail
    }
  }
}