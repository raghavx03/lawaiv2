export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }
  
  measurePageLoad(pageName: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const loadTime = performance.now()
      console.log(`📊 ${pageName} loaded in ${loadTime.toFixed(2)}ms`)
      
      // Send to analytics if needed
      if (loadTime > 3000) {
        console.warn(`⚠️ Slow page load: ${pageName} (${loadTime.toFixed(2)}ms)`)
      }
    }
  }
  
  measureApiCall(endpoint: string, startTime: number) {
    const duration = performance.now() - startTime
    console.log(`🔗 API ${endpoint}: ${duration.toFixed(2)}ms`)
    
    if (duration > 5000) {
      console.warn(`⚠️ Slow API call: ${endpoint} (${duration.toFixed(2)}ms)`)
    }
  }
}