import { hasFeatureAccess as checkFeatureAccess, type FeatureType } from './feature-access'

// Feature mapping for dashboard actions
export const FEATURE_MAP = {
  'ai-assistant': 'AI_ASSISTANT',
  'drafts': 'DOC_GENERATOR', 
  'summarizer': 'JUDGMENT_SUMMARIZER',
  'research': 'RESEARCH',
  'case-tracker': 'CASE_TRACKER',
  'notices': 'NOTICES',
  'crm': 'CRM',
  'news': 'NEWS'
} as const

// Check if user has access to a specific feature
export function hasFeatureAccess(userPlan: string | null | undefined, feature: string): boolean {
  if (!userPlan) return false
  
  const featureKey = FEATURE_MAP[feature as keyof typeof FEATURE_MAP] as FeatureType
  
  if (!featureKey) return false
  
  return checkFeatureAccess(userPlan, featureKey)
}

// Get plan priority for sorting (Free features first)
export function getPlanPriority(userPlan: string | null | undefined, feature: string): number {
  if (hasFeatureAccess(userPlan, feature)) return 1 // Available features first
  return 2 // Locked features last
}