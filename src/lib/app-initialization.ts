// App Initialization and Optimization
import { initMobileOptimizations } from './mobile-optimization'

export const initializeApp = () => {
  // Mobile optimizations
  initMobileOptimizations()
  
  // Performance monitoring
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          console.log('Page Load Time:', navEntry.loadEventEnd - navEntry.fetchStart, 'ms')
        }
        
        if (entry.entryType === 'paint') {
          console.log(`${entry.name}:`, entry.startTime, 'ms')
        }
      })
    })
    
    observer.observe({ entryTypes: ['navigation', 'paint'] })
  }
  
  // Error tracking
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    // Send to monitoring service in production
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // Send to monitoring service in production
  })
  
  // Accessibility improvements
  document.addEventListener('keydown', (event) => {
    // Add keyboard navigation class for focus indicators
    if (event.key === 'Tab') {
      document.body.classList.add('keyboard-navigation')
    }
  })
  
  document.addEventListener('mousedown', () => {
    // Remove keyboard navigation class when using mouse
    document.body.classList.remove('keyboard-navigation')
  })
  
  // Theme initialization
  const theme = localStorage.getItem('law-ai-theme') || 'system'
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
  
  // Service worker registration
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('ServiceWorker registration failed:', error)
    })
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp)
  } else {
    initializeApp()
  }
}