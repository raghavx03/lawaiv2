export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createGuardedHandler } from '@/lib/security/guards'

const trackUsageSchema = z.object({
  feature: z.enum(['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS', 'CASE_TRACKER', 'NOTICES', 'DRAFTS'])
})

export const POST = createGuardedHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json()
    const { feature } = trackUsageSchema.parse(body)
    const userId = auth.user.id

    await prisma.usageEvent.create({
      data: {
        userId,
        feature,
        count: 1
      }
    })

    return NextResponse.json({ ok: true })
  },
  { requireAuth: true }
)