// Performance optimization utilities
export const preloadRoute = (href: string) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

export const preloadRoutes = (routes: string[]) => {
  routes.forEach(preloadRoute)
}

// Simple TTL Cache implementation
export class TTLCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>()

  set(key: string, value: T, ttlMs: number): void {
    const expiry = Date.now() + ttlMs
    this.cache.set(key, { value, expiry })
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }
    
    return item.value
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Preload critical routes
if (typeof window !== 'undefined') {
  setTimeout(() => {
    preloadRoutes([
      '/dashboard',
      '/ai-assistant', 
      '/summarizer',
      '/drafts',
      '/auth/sign-in'
    ])
  }, 1000)
}