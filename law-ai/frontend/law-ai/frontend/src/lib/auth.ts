import { createServerSupabaseClient } from './supabase-server'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getServerUserFallback, hasFeatureAccessFallback } from './auth-fallback'

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  profilePic?: string
  plan: 'FREE' | 'BASIC' | 'PLUS' | 'PRO'
  usageCount: number
  expiryDate?: Date
}

// Get authenticated user from server components
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured')
      return null
    }
    
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.warn('Auth error:', error?.message)
      return null
    }

    // Try database first, fallback to Supabase-only auth
    try {
      const { prisma } = await import('./prisma')
      
      // Get or create user profile with retry logic
      let userProfile = await prisma.userApp.findUnique({
        where: { userId: user.id }
      })

      if (!userProfile) {
        try {
          userProfile = await prisma.userApp.create({
            data: {
              userId: user.id,
              email: user.email!,
              fullName: user.user_metadata?.full_name || null,
              profilePic: user.user_metadata?.avatar_url || null,
            }
          })
        } catch (createError) {
          // Handle race condition - try to find again
          userProfile = await prisma.userApp.findUnique({
            where: { userId: user.id }
          })
          if (!userProfile) throw createError
        }
      }

      const result: AuthUser = {
        id: user.id,
        email: userProfile.email,
        plan: userProfile.plan,
        usageCount: userProfile.usageCount,
      }

      if (userProfile.fullName) result.fullName = userProfile.fullName
      if (userProfile.profilePic) result.profilePic = userProfile.profilePic
      if (userProfile.expiryDate) result.expiryDate = userProfile.expiryDate

      return result
    } catch (dbError) {
      console.warn('Database unavailable, using fallback auth:', (dbError as Error)?.message || 'Unknown error')
      return getServerUserFallback()
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

// Validate API request authentication from cookies
export async function validateApiAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const { prisma } = await import('./prisma')
    const userProfile = await prisma.userApp.findUnique({
      where: { userId: user.id }
    })

    if (!userProfile) return null

    const result: AuthUser = {
      id: user.id,
      email: userProfile.email,
      plan: userProfile.plan,
      usageCount: userProfile.usageCount,
    }

    if (userProfile.fullName) result.fullName = userProfile.fullName
    if (userProfile.profilePic) result.profilePic = userProfile.profilePic
    if (userProfile.expiryDate) result.expiryDate = userProfile.expiryDate

    return result
  } catch (error) {
    console.error('API auth error:', error)
    return null
  }
}

// Check if user has access to feature
export function hasFeatureAccess(user: AuthUser, feature: string): boolean {
  // Check if plan is expired first
  if (isPlanExpired(user)) {
    return ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'].includes(feature) && user.usageCount < 10
  }

  return hasFeatureAccessFallback(user, feature)
}

// Check if user's plan is expired
export function isPlanExpired(user: AuthUser): boolean {
  if (user.plan === 'FREE') return false
  if (!user.expiryDate) return true
  return new Date() > user.expiryDate
}