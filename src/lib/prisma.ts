import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    if (fallback !== undefined) return fallback
    throw error
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}
