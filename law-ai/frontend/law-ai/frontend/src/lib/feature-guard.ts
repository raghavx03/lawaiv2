import { NextRequest, NextResponse } from 'next/server'
import { hasFeatureAccess, getFeatureFromRoute } from '@/lib/feature-access'

// Backend middleware to protect feature routes based on user plan
export async function validateFeatureAccess(
  request: NextRequest,
  userPlan: string | null
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  
  // Get feature from route
  const feature = getFeatureFromRoute(pathname)
  if (!feature) return null // Not a protected feature route
  
  // Check access
  if (!hasFeatureAccess(userPlan, feature)) {
    return NextResponse.json(
      { 
        error: 'Plan Upgrade Required',
        message: `This feature requires a higher plan. Current plan: ${userPlan || 'FREE'}`,
        requiredFeature: feature
      },
      { status: 403 }
    )
  }
  
  return null // Access granted
}