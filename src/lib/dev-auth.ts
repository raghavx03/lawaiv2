import { AuthUser } from './auth'

// Development mode authentication fallback
export function createDevUser(): AuthUser {
  return {
    id: 'dev-user-' + Date.now(),
    email: 'dev@lawai.com',
    plan: 'FREE',
    usageCount: 0,
    fullName: 'Development User'
  }
}

// Check if we should use development mode
export function shouldUseDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
         !process.env.NEXT_PUBLIC_SUPABASE_URL ||
         process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_')
}