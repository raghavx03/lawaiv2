import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbConnected: boolean
}

let connectionStatus = false

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/fallback'
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'connection_limit=10&pool_timeout=20&pgbouncer=true'
      }
    },
    transactionOptions: {
      timeout: 8000,
      maxWait: 3000,
    }
  })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test connection with timeout
export async function testConnection(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Connection timeout'))
        })
      })
    ])
    
    clearTimeout(timeoutId)
    connectionStatus = true
    return true
  } catch (error: any) {
    connectionStatus = false
    console.warn('Database connection test failed:', error?.message || error)
    return false
  }
}

// Safe database operations with fallbacks
export async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Operation timeout'))
        })
      })
    ])
    
    clearTimeout(timeoutId)
    return result
  } catch (error: any) {
    console.warn('Database operation failed, using fallback:', error?.message || error)
    return fallback
  }
}

export function isDbConnected(): boolean {
  return connectionStatus
}

// Initialize connection test (skip during build)
if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  testConnection().catch(() => {
    console.warn('Initial database connection test failed')
  })
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma:', error)
    }
  }

  process.on('beforeExit', cleanup)
  process.on('SIGINT', async () => {
    await cleanup()
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    await cleanup()
    process.exit(0)
  })
}