export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeDbOperation } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput, sanitizeForLog } from '@/lib/security/input-sanitizer-enhanced'
import { hasFeatureAccess } from '@/lib/auth'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { callAIQuick } from '@/lib/ai-service'

const contactSchema = z.object({
  type: z.literal('contact'),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal(''))
})

const appointmentSchema = z.object({
  type: z.literal('appointment'),
  clientName: z.string().min(1).max(200),
  date: z.string(),
  time: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional()
})

const taskSchema = z.object({
  type: z.literal('task'),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string(),
  clientName: z.string().max(200).optional()
})

const crmSchema = z.union([contactSchema, appointmentSchema, taskSchema])

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json()
    const data = crmSchema.parse(body)
    const userId = auth.user.id

    if (!hasFeatureAccess(auth.user, 'CRM')) {
      return NextResponse.json({
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Feature not available in your plan'
      }, { status: 403 })
    }

    const usageCheck = await checkUsageLimit(userId, 'CRM')
    if (!usageCheck.allowed) {
      return NextResponse.json({
        ok: false,
        code: 'USAGE_LIMIT',
        message: 'Usage limit reached',
        reason: usageCheck.reason
      }, { status: 402 })
    }

    if (data.type === 'contact') {
      let aiInsights = ''
      try {
        const messages = [
          {
            role: 'system' as const,
            content: 'You are a legal CRM assistant. Provide brief professional insights and suggestions for client management based on the provided information.'
          },
          {
            role: 'user' as const,
            content: `New client contact: ${data.name}. Email: ${data.email || 'Not provided'}. Phone: ${data.phone || 'Not provided'}. Notes: ${data.notes || 'None'}. Provide brief professional insights and next steps.`
          }
        ]

        // Use AI quick for fast insights
        const aiResponse = await callAIQuick(messages, 300, 0.7)
        aiInsights = aiResponse.content
      } catch (error) {
        console.warn('AI insights error:', error)
      }

      const contact = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')

        return prisma.cRM.create({
          data: {
            userId,
            clientName: sanitizeInput(data.name),
            clientEmail: data.email ? sanitizeInput(data.email) : null,
            clientPhone: data.phone ? sanitizeInput(data.phone) : null,
            title: 'Contact',
            description: data.notes ? sanitizeInput(data.notes) : null,
            date: new Date(),
            duration: 0,
            status: 'contact'
          }
        })
      }, null)

      if (!contact) throw new Error('Failed to create contact')

      await incrementUsage(userId, 'CRM')
      return NextResponse.json({ ok: true, contact, aiInsights })

    } else if (data.type === 'appointment') {
      const appointmentDate = new Date(`${data.date}T${data.time}`)
      const appointment = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')

        return prisma.cRM.create({
          data: {
            userId,
            clientName: sanitizeInput(data.clientName),
            title: data.title ? sanitizeInput(data.title) : 'Meeting',
            description: data.description ? sanitizeInput(data.description) : null,
            date: appointmentDate,
            duration: 60,
            status: 'scheduled'
          }
        })
      }, null)

      if (!appointment) throw new Error('Failed to create appointment')

      await incrementUsage(userId, 'CRM')
      return NextResponse.json({ ok: true, appointment })

    } else {
      const task = await safeDbOperation(async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) throw new Error('Database unavailable')

        return prisma.cRM.create({
          data: {
            userId,
            clientName: data.clientName ? sanitizeInput(data.clientName) : '',
            title: sanitizeInput(data.title),
            description: data.description ? sanitizeInput(data.description) : null,
            date: new Date(data.dueDate),
            duration: 0,
            status: data.priority
          }
        })
      }, null)

      if (!task) throw new Error('Failed to create task')

      await incrementUsage(userId, 'CRM')
      return NextResponse.json({ ok: true, task })
    }
  },
  { requireAuth: true, requireCSRF: true }
)

export const GET = createGuardedHandler(
  async (_request: NextRequest, { auth }) => {
    const crmData = await safeDbOperation(async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) return []
      return prisma.cRM.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    }, [])

    // Process contacts, appointments, tasks
    const contacts: any[] = []
    const appointments: any[] = []
    const tasks: any[] = []

    crmData.forEach((item: any) => {
      if (item.status === 'contact') {
        contacts.push({
          id: item.id,
          name: item.clientName,
          email: item.clientEmail || '',
          phone: item.clientPhone || '',
          notes: item.description || '',
          createdAt: item.createdAt.toISOString()
        })
      } else if (item.status === 'scheduled') {
        appointments.push({
          id: item.id,
          clientName: item.clientName,
          date: item.date.toISOString().split('T')[0],
          time: item.date.toISOString().split('T')[1].slice(0, 5),
          type: item.title,
          status: 'confirmed'
        })
      } else {
        tasks.push({
          id: item.id,
          title: item.title,
          description: item.description || '',
          priority: item.status,
          status: 'pending',
          dueDate: item.date.toISOString(),
          clientName: item.clientName || ''
        })
      }
    })

    return NextResponse.json({ ok: true, contacts, appointments, tasks })
  },
  { requireAuth: true }
)