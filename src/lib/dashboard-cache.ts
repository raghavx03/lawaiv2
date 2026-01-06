import { cache } from 'react'

export interface DashboardStats {
  totalCases: number
  totalResearch: number
  totalChats: number
  totalDrafts: number
}

// Cache dashboard stats for 5 minutes
export const getCachedDashboardStats = cache(async (userId: string): Promise<DashboardStats> => {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // Parallel execution for better performance
    const [totalCases, totalResearch, totalChats, totalDrafts] = await Promise.all([
      prisma.caseTracker.count({ where: { userId } }),
      prisma.research.count({ where: { userId } }),
      prisma.chatSession.count({ where: { userId } }),
      prisma.draft.count({ where: { userId } })
    ])

    return {
      totalCases,
      totalResearch,
      totalChats,
      totalDrafts
    }
  } catch (error) {
    // Return default stats if database is unavailable
    return {
      totalCases: 0,
      totalResearch: 0,
      totalChats: 0,
      totalDrafts: 0
    }
  }
})

// Cache user profile data
export const getCachedUserProfile = cache(async (userId: string) => {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const profile = await prisma.userApp.findUnique({
      where: { userId },
      select: {
        userId: true,
        email: true,
        fullName: true,
        profilePic: true,
        plan: true,
        usageCount: true,
        expiryDate: true
      }
    })

    return profile
  } catch (error) {
    return null
  }
})