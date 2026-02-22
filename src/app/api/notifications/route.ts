
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth'
import { safeDbOperation } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'success', 'warning', 'error', 'welcome', 'feature', 'payment', 'system']).default('info'),
  category: z.enum(['system', 'user', 'payment', 'feature', 'security']).default('system'),
  userId: z.string().uuid().optional(),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request)
    if (!user) {
      return NextResponse.json({ notifications: [], ok: true })
    }

    const notifications = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return []

      return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    }, [])

    return NextResponse.json({
      notifications,
      ok: true
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, category, userId, actionUrl, metadata } = notificationSchema.parse(body)

    let targetUserId = userId
    if (!targetUserId) {
      const user = await getServerUser(request)
      if (user) targetUserId = user.id
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const notification = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) throw new Error('DB unavailable')

      return prisma.notification.create({
        data: {
          userId: targetUserId!,
          title,
          message,
          type: type as any,
          read: false,
          actionUrl,
          metadata: {
            ...metadata,
            category
          }
        }
      })
    }, null)

    return NextResponse.json({
      ok: true,
      notification
    })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ ok: false, error: 'Failed' }, { status: 500 })
  }
}
