import { prisma } from './prisma'

export async function checkUsageLimit(userId: string, feature: 'AI_ASSISTANT' | 'DOC_GENERATOR' | 'JUDGMENT_SUMMARIZER' | 'CRM' | 'ACTS' | 'NEWS' | 'CASE_TRACKER' | 'NOTICES' | 'DRAFTS' | 'RESEARCH'): Promise<{ allowed: boolean; reason?: string }> {
  // Get user plan and usage count
  const user = await prisma.userApp.findUnique({
    where: { userId },
    select: { plan: true, createdAt: true, expiryDate: true, usageCount: true }
  })

  if (!user) {
    return { allowed: false, reason: 'user_not_found' }
  }

  // Check if paid plan is expired
  if (user.plan !== 'FREE' && user.expiryDate && new Date() > user.expiryDate) {
    // Downgrade to FREE plan
    await prisma.userApp.update({
      where: { userId },
      data: { plan: 'FREE' }
    })
    user.plan = 'FREE'
  }

  // Allow unlimited usage for paid plans
  if (user.plan !== 'FREE') {
    return { allowed: true }
  }

  const now = new Date()
  const daysSinceCreation = Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))

  // Check 7-day trial limit
  if (daysSinceCreation > 7) {
    return { allowed: false, reason: 'trial_expired' }
  }

  // Check 10 query limit for free users (total across all features)
  if (user.usageCount >= 10) {
    return { allowed: false, reason: 'query_limit' }
  }

  return { allowed: true }
}

export async function incrementUsage(userId: string, feature: 'AI_ASSISTANT' | 'DOC_GENERATOR' | 'JUDGMENT_SUMMARIZER' | 'CRM' | 'ACTS' | 'NEWS' | 'CASE_TRACKER' | 'NOTICES' | 'DRAFTS' | 'RESEARCH') {
  // Increment both the total usage count and feature-specific count
  await prisma.$transaction([
    // Update total usage count in UserApp
    prisma.userApp.update({
      where: { userId },
      data: { usageCount: { increment: 1 } }
    }),
    // Track feature-specific usage
    prisma.usageEvent.upsert({
      where: {
        userId_feature: { userId, feature }
      },
      update: {
        count: { increment: 1 }
      },
      create: {
        userId,
        feature,
        count: 1
      }
    })
  ])
}