import { TTLCache } from './performance'

// In-memory cache fallback when Redis is not available
const memoryCache = new TTLCache()

interface CacheAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlSeconds?: number): Promise<void>
  del(key: string): Promise<void>
  clear(): Promise<void>
}

class MemoryCacheAdapter implements CacheAdapter {
  async get(key: string): Promise<string | null> {
    const value = memoryCache.get(key)
    return typeof value === 'string' ? value : null
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    memoryCache.set(key, value, ttlSeconds * 1000)
  }

  async del(key: string): Promise<void> {
    memoryCache.clear() // Simple implementation
  }

  async clear(): Promise<void> {
    memoryCache.clear()
  }
}

class RedisCacheAdapter implements CacheAdapter {
  private client: any = null

  constructor() {
    this.initRedis()
  }

  private async initRedis() {
    if (!process.env.REDIS_URL) return

    try {
      // Dynamic import for Redis (optional dependency)
      const { createClient } = await import('redis')
      this.client = createClient({ url: process.env.REDIS_URL })
      await this.client.connect()
    } catch (error: any) {
      console.warn('Redis not available, using memory cache:', error?.message || error)
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      const value = memoryCache.get(key)
      return typeof value === 'string' ? value : null
    }
    try {
      return await this.client.get(key)
    } catch (error: any) {
      console.warn('Redis get failed:', error?.message || error)
      const value = memoryCache.get(key)
      return typeof value === 'string' ? value : null
    }
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (!this.client) {
      memoryCache.set(key, value, ttlSeconds * 1000)
      return
    }
    try {
      await this.client.setEx(key, ttlSeconds, value)
    } catch (error) {
      memoryCache.set(key, value, ttlSeconds * 1000)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return
    try {
      await this.client.del(key)
    } catch (error) {
      console.warn('Redis delete failed:', error)
    }
  }

  async clear(): Promise<void> {
    if (!this.client) {
      memoryCache.clear()
      return
    }
    try {
      await this.client.flushAll()
    } catch (error) {
      console.warn('Redis clear failed:', error)
    }
  }
}

// Global cache instance
export const cache: CacheAdapter = process.env.REDIS_URL 
  ? new RedisCacheAdapter() 
  : new MemoryCacheAdapter()

// Helper functions
export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 300): Promise<T> {
  const cached = await cache.get(key)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch (error) {
      await cache.del(key)
    }
  }

  const data = await fetcher()
  await cache.set(key, JSON.stringify(data), ttl)
  return data
}