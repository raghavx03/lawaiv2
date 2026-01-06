// Shared feature access logic for both frontend and backend
export const PLAN_FEATURES = {
  FREE: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'],
  EXPIRED_FREE: [], // No access to any features
  BASIC: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'],
  PLUS: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS'],
  PRO: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS', 'CASE_TRACKER', 'NOTICES', 'RESEARCH', 'DRAFTS']
} as const

export const FEATURE_ROUTES = {
  AI_ASSISTANT: '/ai-assistant',
  DOC_GENERATOR: '/drafts',
  JUDGMENT_SUMMARIZER: '/summarizer',
  CRM: '/crm',
  ACTS: '/acts',
  NEWS: '/news',
  CASE_TRACKER: '/case-tracker',
  NOTICES: '/notices',
  RESEARCH: '/research'
} as const

export type PlanType = keyof typeof PLAN_FEATURES
export type FeatureType = 'AI_ASSISTANT' | 'DOC_GENERATOR' | 'JUDGMENT_SUMMARIZER' | 'CRM' | 'ACTS' | 'NEWS' | 'CASE_TRACKER' | 'NOTICES' | 'RESEARCH' | 'DRAFTS'

// Check if user has access to a specific feature
export function hasFeatureAccess(userPlan: string | null | undefined, feature: FeatureType, userEmail?: string): boolean {
  console.log('hasFeatureAccess called with:', { userPlan, feature, userEmail })
  
  // Admin access for specific email - always return true
  if (userEmail === 'shivangibabbar0211@gmail.com') {
    console.log('Admin access granted')
    return true
  }
  
  // Grant access to core features for all users by default
  if (['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'].includes(feature)) {
    console.log(`${feature} access granted for all users`)
    return true
  }
  
  if (!userPlan) {
    console.log('No user plan provided, granting basic access')
    return ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'].includes(feature)
  }
  
  const planKey = userPlan.toUpperCase() as PlanType
  console.log('Plan key:', planKey)
  console.log('Available features for plan:', PLAN_FEATURES[planKey])
  
  if (!PLAN_FEATURES[planKey]) {
    console.log('Plan not found in PLAN_FEATURES, granting basic access')
    return ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'].includes(feature)
  }
  
  const hasAccess = (PLAN_FEATURES[planKey] as readonly string[]).includes(feature)
  console.log('Feature access result:', hasAccess)
  return hasAccess
}

// Check if user has access based on profile object
export function hasFeatureAccessFromProfile(profile: { plan: string } | null, feature: FeatureType, userEmail?: string): boolean {
  // Admin access for specific email - always return true
  if (userEmail === 'shivangibabbar0211@gmail.com') return true
  
  if (!profile?.plan) return false
  return hasFeatureAccess(profile.plan, feature, userEmail)
}

// Get feature key from route path
export function getFeatureFromRoute(route: string): FeatureType | null {
  const featureEntry = Object.entries(FEATURE_ROUTES).find(([, path]) => path === route)
  return featureEntry ? featureEntry[0] as FeatureType : null
}