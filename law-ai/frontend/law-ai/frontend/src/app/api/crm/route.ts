export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { hasFeatureAccess } from '@/lib/feature-access'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'

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

    const userProfile = await prisma.userApp.findUnique({
      where: { userId },
      select: { plan: true }
    })

    if (!userProfile || !hasFeatureAccess(userProfile.plan, 'CRM')) {
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
      // Generate AI-powered client insights
      let aiInsights = ''
      try {
        const { callAIService } = await import('@/lib/ai-service')
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
        
        const aiResponse = await callAIService(messages, userProfile.plan, 300, 0.7)
        aiInsights = aiResponse.content
      } catch (error) {
        aiInsights = 'AI insights temporarily unavailable'
      }
      
      const contact = await prisma.cRM.create({
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
      
      await incrementUsage(userId, 'CRM')
      return NextResponse.json({ ok: true, contact, aiInsights })
    } else if (data.type === 'appointment') {
      const appointmentDate = new Date(`${data.date}T${data.time}`)
      const appointment = await prisma.cRM.create({
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
      
      await incrementUsage(userId, 'CRM')
      return NextResponse.json({ ok: true, appointment })
    } else {
      const task = await prisma.cRM.create({
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
      
      await incrementUsage(userId, 'CRM')
      return NextResponse.json({ ok: true, task })
    }
  },
  { requireAuth: true, requireCSRF: true }
)

export const GET = createGuardedHandler(
  async (_request: NextRequest, { auth }) => {
    const crmData = await prisma.cRM.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    const contacts = crmData
      .filter(item => item.status === 'contact')
      .map(item => ({
        id: item.id,
        name: item.clientName,
        email: item.clientEmail || '',
        phone: item.clientPhone || '',
        notes: item.description || '',
        createdAt: item.createdAt.toISOString()
      }))
    
    const appointments = crmData
      .filter(item => item.status === 'scheduled')
      .map(item => ({
        id: item.id,
        clientName: item.clientName,
        date: item.date.toISOString().split('T')[0],
        time: item.date.toISOString().split('T')[1].slice(0, 5),
        type: item.title,
        status: 'confirmed'
      }))
    
    const tasks = crmData
      .filter(item => ['low', 'medium', 'high'].includes(item.status))
      .map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        priority: item.status,
        status: 'pending',
        dueDate: item.date.toISOString(),
        clientName: item.clientName || ''
      }))
    
    return NextResponse.json({ ok: true, contacts, appointments, tasks })
  },
  { requireAuth: true }
)