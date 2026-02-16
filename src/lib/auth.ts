import { createServerSupabaseClient } from './supabase-server'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getServerUserFallback, hasFeatureAccessFallback } from './auth-fallback'
import { shouldUseDevelopmentMode, createDevUser } from './dev-auth'

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
    // Dev mode: return dev user with PRO access
    if (shouldUseDevelopmentMode()) {
      return createDevUser()
    }

    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Try database first, fallback to Supabase-only auth
    try {
      const { prisma } = await import('./prisma')

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
      console.warn('Database unavailable, using fallback auth')
      return getServerUserFallback()
    }
  } catch (error) {
    console.error('Auth error:', error)
    // Final fallback for dev mode
    if (shouldUseDevelopmentMode()) {
      return createDevUser()
    }
    return null
  }
}

// Validate API request authentication from cookies
export async function validateApiAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Dev mode: return dev user
    if (shouldUseDevelopmentMode()) {
      return createDevUser()
    }

    // Check for demo mode header
    if (process.env.NODE_ENV === 'development') {
      const demoMode = request.headers.get('x-demo-mode')
      if (demoMode === 'true') {
        return createDevUser()
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      return createDevUser()
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    })

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return null
    }

    try {
      const { prisma } = await import('./prisma')
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
      console.warn('Database error, using fallback auth')
      return getServerUserFallback()
    }
  } catch (error) {
    console.error('API auth error:', error)
    if (shouldUseDevelopmentMode()) {
      return createDevUser()
    }
    return null
  }
}

// Check if user has access to feature
export function hasFeatureAccess(user: AuthUser, feature: string): boolean {
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