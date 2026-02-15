import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkIPRateLimit } from '@/lib/ip-rate-limit'

// This file is dynamically imported by rate-limit-persistent.ts to avoid circular deps
// It contains the implementation logic
export async function _failSafeRateLimit(request: NextRequest, userId?: string): Promise<boolean> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip'

    // 1. Try DB Rate Limiting (Persistent)
    try {
        const key = userId ? `user:${userId}` : `ip:${ip}`
        const limit = userId ? 100 : 20 // 100 req/min for users, 20 for IPs

        const now = new Date()

        // Use transaction for atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Find existing record
            let record = await tx.rateLimit.findUnique({
                where: { key }
            })

            // If no record or expired, create/reset
            if (!record || record.resetTime < now) {
                // Upsert handles race conditions better
                record = await tx.rateLimit.upsert({
                    where: { key },
                    update: {
                        count: 1,
                        resetTime: new Date(now.getTime() + 60 * 1000),
                        createdAt: now
                    },
                    create: {
                        key,
                        count: 1,
                        resetTime: new Date(now.getTime() + 60 * 1000)
                    }
                })
                return true
            }

            // Check limit
            if (record.count >= limit) {
                return false
            }

            // Increment
            await tx.rateLimit.update({
                where: { key },
                data: { count: record.count + 1 }
            })

            return true
        })

        return result

    } catch (dbError) {
        // 2. Fallback to Memory Rate Limiting (In-memory LRU)
        // For authenticated users, allow higher limits
        const limit = userId ? 50 : 10
        const checkKey = userId || ip
        const result = checkIPRateLimit(checkKey, limit, 1) // 1 minute window
        return result.allowed
    }
}
