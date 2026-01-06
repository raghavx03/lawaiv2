'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { TopNav } from './TopNav'
import { useAuth } from '@/context/AuthContext'
import { CaseProvider } from '@/context/CaseContext'
import { TrialExpiredModal } from '@/components/modals/TrialExpiredModal'
import { useTrialStatus } from '@/hooks/useTrialStatus'

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const trialStatus = useTrialStatus()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Show upgrade modal when trial expires or is about to expire
  useEffect(() => {
    if (!loading && user && trialStatus.shouldShowUpgradeModal && !trialStatus.isPaidUser) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowUpgradeModal(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [loading, user, trialStatus.shouldShowUpgradeModal, trialStatus.isPaidUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    return null
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-white">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Trial Expired Modal */}
      <TrialExpiredModal 
        isOpen={showUpgradeModal}
        onClose={trialStatus.isTrialExpired ? undefined : () => setShowUpgradeModal(false)}
        daysLeft={trialStatus.daysLeft}
      />
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <CaseProvider>
      <DashboardContent>{children}</DashboardContent>
    </CaseProvider>
  )
}
