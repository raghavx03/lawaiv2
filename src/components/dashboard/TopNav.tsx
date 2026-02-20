'use client'

import { Menu, Bell, Home, Crown, LogOut, Clock } from 'lucide-react'
import { ProfileDropdown } from '@/components/auth/ProfileDropdown'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { useTrialStatus } from '@/hooks/useTrialStatus'
import { TrialExpiredModal } from '@/components/modals/TrialExpiredModal'
import { CaseSelector } from './CaseSelector'

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user, profile } = useAuth()
  const trialStatus = useTrialStatus()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={onMenuClick}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Case Selector - Always visible */}
              <CaseSelector />
              
              <div className="hidden lg:flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile?.plan === 'PRO' 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                    : profile?.plan === 'PLUS'
                    ? 'bg-gray-700 dark:bg-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {profile?.plan || 'FREE'}
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Trial Status Badge */}
              {!trialStatus.isPaidUser && trialStatus.daysLeft > 0 && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {trialStatus.daysLeft} day{trialStatus.daysLeft !== 1 ? 's' : ''} left
                </button>
              )}

              {/* Home button */}
              <Link href="/">
                <button className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Home className="h-5 w-5" />
                </button>
              </Link>

              {/* Upgrade Button */}
              {profile?.plan !== 'PRO' && (
                <Button 
                  size="sm" 
                  className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <Crown className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              )}
              
              {/* Notifications */}
              <button className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Profile */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <TrialExpiredModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        daysLeft={trialStatus.daysLeft}
      />
    </>
  )
}
