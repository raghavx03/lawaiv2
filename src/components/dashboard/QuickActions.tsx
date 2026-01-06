'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, FileText, Search, BarChart3, Bell, Users, Newspaper, Lock, Crown } from 'lucide-react'
import { hasFeatureAccess, type FeatureType } from '@/lib/feature-access'

interface QuickActionsProps {
  userPlan: string
  userEmail?: string
  onUpgradeClick: () => void
  loading?: boolean
}

const quickActions = [
  { title: 'AI Assistant', href: '/ai-assistant', icon: Bot, color: 'bg-green-500', feature: 'AI_ASSISTANT' as FeatureType },
  { title: 'Draft Generator', href: '/drafts', icon: FileText, color: 'bg-red-500', feature: 'DOC_GENERATOR' as FeatureType },
  { title: 'Summarizer', href: '/summarizer', icon: FileText, color: 'bg-orange-500', feature: 'JUDGMENT_SUMMARIZER' as FeatureType },
  { title: 'Legal Research', href: '/research', icon: Search, color: 'bg-blue-500', feature: 'RESEARCH' as FeatureType },
  { title: 'Case Tracker', href: '/case-tracker', icon: BarChart3, color: 'bg-purple-500', feature: 'CASE_TRACKER' as FeatureType },
  { title: 'Legal Notices', href: '/notices', icon: Bell, color: 'bg-yellow-500', feature: 'NOTICES' as FeatureType },
  { title: 'CRM', href: '/crm', icon: Users, color: 'bg-indigo-500', feature: 'CRM' as FeatureType },
  { title: 'Legal News', href: '/news', icon: Newspaper, color: 'bg-pink-500', feature: 'NEWS' as FeatureType }
] as const

export function QuickActions({ userPlan, userEmail, onUpgradeClick, loading = false }: QuickActionsProps) {
  // Force admin for Shivangi
  const isShivangi = userEmail === 'shivangibabbar0211@gmail.com'
  const isAdmin = isShivangi || userEmail === 'admin@law.ai' || userEmail === 'raghav@law.ai'
  
  const sortedActions = useMemo(() => {
    return [...quickActions].sort((a, b) => {
      const aHasAccess = hasFeatureAccess(userPlan, a.feature, userEmail)
      const bHasAccess = hasFeatureAccess(userPlan, b.feature, userEmail)
      if (aHasAccess && !bHasAccess) return -1
      if (!aHasAccess && bHasAccess) return 1
      return 0
    })
  }, [userPlan, userEmail])

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sortedActions.map((action) => {
            const Icon = action.icon
            // Check actual feature access
            const hasAccess = hasFeatureAccess(userPlan, action.feature, userEmail)
            
            return (
              <div key={action.title} className="relative">
                {hasAccess ? (
                  <Link href={action.href}>
                    <div className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <div className={`p-3 rounded-full ${action.color} text-white mb-3 group-hover:scale-105 transition-transform shadow-md`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium text-center text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {action.title}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div 
                    className="group flex flex-col items-center p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/80 cursor-pointer transition-all duration-200 relative"
                    onClick={onUpgradeClick}
                    title={`Upgrade to access ${action.title}`}
                  >
                    <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-full shadow-sm">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                    
                    <div className="p-3 rounded-full bg-gray-400 dark:bg-gray-600 text-white mb-3 opacity-60 shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <span className="text-sm font-medium text-center text-gray-500 dark:text-gray-400 mb-2">
                      {action.title}
                    </span>
                    
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-sm">
                      <Crown className="h-3 w-3" />
                      <span>Upgrade</span>
                    </div>
                  </div>
                )}
              </div>
            )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}