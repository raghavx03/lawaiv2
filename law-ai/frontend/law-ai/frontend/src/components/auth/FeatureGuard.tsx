'use client'

import { useAuth } from '@/context/AuthContext'
import { hasFeatureAccess, type FeatureType } from '@/lib/feature-access'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FeatureGuardProps {
  feature: FeatureType
  children: React.ReactNode
}

export function FeatureGuard({ feature, children }: FeatureGuardProps) {
  const { profile, loading } = useAuth()
  const router = useRouter()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Check feature access properly
  // Always allow AI_ASSISTANT for any logged-in user
  if (feature === 'AI_ASSISTANT') {
    console.log('AI_ASSISTANT access granted for all users')
    return <>{children}</>
  }
  
  const hasAccess = hasFeatureAccess(profile?.plan, feature, profile?.email)
  console.log('Feature Access Result:', hasAccess)

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Feature Locked
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature requires a higher subscription plan. Current plan: {profile?.plan || 'FREE'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/#pricing')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}