import { createServerSupabaseClient } from './supabase-server'

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  profilePic?: string
  plan: 'FREE' | 'BASIC' | 'PLUS' | 'PRO'
  usageCount: number
  expiryDate?: Date
}

// Fallback auth that works without Prisma
export async function getServerUserFallback(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null

    // Return user with default values if database is not available
    const result: AuthUser = {
      id: user.id,
      email: user.email!,
      plan: 'FREE',
      usageCount: 0,
    }

    if (user.user_metadata?.full_name) result.fullName = user.user_metadata.full_name
    if (user.user_metadata?.avatar_url) result.profilePic = user.user_metadata.avatar_url

    return result
  } catch (error) {
    console.error('Auth fallback error:', error)
    return null
  }
}

export function hasFeatureAccessFallback(user: AuthUser, feature: string): boolean {
  const freeFeatures = ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER']
  const basicFeatures = [...freeFeatures]
  const plusFeatures = [...basicFeatures, 'CRM', 'ACTS', 'NEWS']
  const proFeatures = [...plusFeatures, 'CASE_TRACKER', 'NOTICES', 'RESEARCH']

  switch (user.plan) {
    case 'FREE':
      return freeFeatures.includes(feature) && user.usageCount < 10
    case 'BASIC':
      return basicFeatures.includes(feature)
    case 'PLUS':
      return plusFeatures.includes(feature)
    case 'PRO':
      return proFeatures.includes(feature)
    default:
      return false
  }
}