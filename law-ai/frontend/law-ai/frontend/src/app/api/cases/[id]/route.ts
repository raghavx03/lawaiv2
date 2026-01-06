export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'
import { sanitizeInput } from '@/lib/security/input-sanitizer'
import { sanitizeForLog } from '@/lib/security/log-sanitizer'
import { hasFeatureAccess } from '@/lib/feature-access'

export const GET = createGuardedHandler(
  async (_request: NextRequest, { auth, params }: { auth: any, params: { id: string } }) => {
    const caseId = z.string().uuid().parse(params.id)
    
    const case_ = await prisma.caseTracker.findFirst({
      where: { 
        id: caseId,
        userId: auth.user.id
      }
    })
    
    if (!case_) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      ok: true,
      case: {
        ...case_,
        partyName: sanitizeInput(case_.partyName),
        court: sanitizeInput(case_.court),
        status: sanitizeInput(case_.status)
      }
    })
  },
  { requireAuth: true }
)

const updateCaseSchema = z.object({
  partyName: z.string().min(1).max(200),
  court: z.string().min(1).max(200),
  status: z.string().min(1).max(100)
})

export const PUT = createGuardedHandler(
  async (request: NextRequest, { auth, params }: { auth: any, params: { id: string } }) => {
    const caseId = z.string().uuid().parse(params.id)
    const body = await request.json()
    const { partyName, court, status } = updateCaseSchema.parse(body)
    
    const userProfile = await prisma.userApp.findUnique({
      where: { userId: auth.user.id },
      select: { plan: true }
    })

    if (!userProfile || !hasFeatureAccess(userProfile.plan, 'CASE_TRACKER')) {
      return NextResponse.json({ 
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Feature not available in your plan'
      }, { status: 403 })
    }
    
    const case_ = await prisma.caseTracker.update({
      where: { 
        id: caseId,
        userId: auth.user.id
      },
      data: { 
        partyName: sanitizeInput(partyName),
        court: sanitizeInput(court),
        status: sanitizeInput(status),
        lastUpdate: new Date()
      }
    })
    
    return NextResponse.json({
      ok: true,
      case: case_
    })
  },
  { requireAuth: true, requireCSRF: true }
)

export const DELETE = createGuardedHandler(
  async (_request: NextRequest, { auth, params }: { auth: any, params: { id: string } }) => {
    const caseId = z.string().uuid().parse(params.id)
    
    const userProfile = await prisma.userApp.findUnique({
      where: { userId: auth.user.id },
      select: { plan: true }
    })

    if (!userProfile || !hasFeatureAccess(userProfile.plan, 'CASE_TRACKER')) {
      return NextResponse.json({ 
        ok: false,
        code: 'FEATURE_LOCKED',
        message: 'Feature not available in your plan'
      }, { status: 403 })
    }

    await prisma.caseTracker.delete({
      where: { 
        id: caseId,
        userId: auth.user.id
      }
    })
    
    return NextResponse.json({ ok: true })
  },
  { requireAuth: true, requireCSRF: true }
)