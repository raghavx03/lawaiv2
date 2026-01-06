'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Crown, Zap, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { SimpleUpgradeModal } from '@/components/dashboard/SimpleUpgradeModal'

interface FeatureModalProps {
  feature: string
  children: React.ReactNode
}

const FEATURE_ACCESS = {
  FREE: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'],
  BASIC: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER'],
  PLUS: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS'],
  PRO: ['AI_ASSISTANT', 'DOC_GENERATOR', 'JUDGMENT_SUMMARIZER', 'CRM', 'ACTS', 'NEWS', 'CASE_TRACKER', 'NOTICES', 'RESEARCH']
}

export function FeatureModal({ feature, children }: FeatureModalProps) {
  const { user, profile } = useAuth()
  const [showUpgrade, setShowUpgrade] = useState(false)
  
  // Admin always has access
  const isAdmin = user?.email === 'shivangibabbar0211@gmail.com'
  if (isAdmin) {
    return <>{children}</>
  }
  
  const userPlan = profile?.plan || 'FREE'
  const hasAccess = FEATURE_ACCESS[userPlan as keyof typeof FEATURE_ACCESS]?.includes(feature)

  if (!hasAccess) {
    return (
      <>
        <div className="relative">
          <div className="pointer-events-none opacity-50 blur-sm">
            {children}
          </div>
          
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Upgrade Required</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-gray-600 mb-4">
                  This feature requires a higher subscription plan. Upgrade now to unlock all premium features.
                </p>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={() => setShowUpgrade(true)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SimpleUpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </>
    )
  }

  return <>{children}</>
}