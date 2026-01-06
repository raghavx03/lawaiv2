'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Crown, Users } from 'lucide-react'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import NewsWidget from '@/components/dashboard/NewsWidget'
import { SimpleUpgradeModal } from '@/components/dashboard/SimpleUpgradeModal'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { EnhancedStatsCards } from '@/components/dashboard/EnhancedStatsCards'
import { DeadlinesWidget } from '@/components/dashboard/DeadlinesWidget'
import { RecentUpdatesWidget } from '@/components/dashboard/RecentUpdatesWidget'
import { AIPerformanceWidget } from '@/components/dashboard/AIPerformanceWidget'
import { LegalInsightsWidget } from '@/components/dashboard/LegalInsightsWidget'
import { GlobalSearchBar } from '@/components/dashboard/GlobalSearchBar'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useNavigationFix } from '@/hooks/useNavigationFix'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading, refreshProfile } = useAuth()
  const { stats, loading: statsLoading } = useDashboardData(user?.id)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Fix navigation history after OAuth login
  useNavigationFix()

  // Refresh profile if needed
  useEffect(() => {
    if (user && !profile) {
      refreshProfile().catch(console.error)
    }
  }, [user, profile, refreshProfile])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
      return
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userPlan = profile?.plan || 'FREE'
  const isAdmin = user?.email === 'admin@law.ai' || user?.email === 'raghav@law.ai' || user?.email === 'shivangibabbar0211@gmail.com'

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                profile?.plan === 'PRO' 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                  : profile?.plan === 'PLUS'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  : profile?.plan === 'BASIC'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
              }`}>
              {profile?.plan || 'FREE'} Plan
            </span>

          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your enhanced legal workspace
          </p>
        </div>
        
        {/* Global Search Bar */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:mx-8">
          <GlobalSearchBar />
        </div>
        
        {/* Add Case Button */}
        <div>
          <Link href="/case-tracker">
            <Button className="w-full lg:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <EnhancedStatsCards stats={stats} loading={statsLoading} />

      {/* Quick Actions */}
      <div>
        <QuickActions 
          userPlan={userPlan}
          userEmail={user?.email}
          onUpgradeClick={() => setShowUpgradeModal(true)}
          loading={statsLoading}
        />
      </div>

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div>
          <DeadlinesWidget />
        </div>
        <div>
          <RecentUpdatesWidget />
        </div>
        <div>
          <AIPerformanceWidget />
        </div>
      </div>

      {/* Legal Insights and News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <LegalInsightsWidget />
        </div>
        <div>
          <NewsWidget />
        </div>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <div>
          <Card className="border-yellow-200 dark:border-yellow-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      <SimpleUpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  )
}