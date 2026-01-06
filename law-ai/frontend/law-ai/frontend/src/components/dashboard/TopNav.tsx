'use client'

import { motion } from 'framer-motion'
import { Menu, Bell, Home, Crown } from 'lucide-react'
import { ProfileDropdown } from '@/components/auth/ProfileDropdown'
import { NotificationsDropdown } from './NotificationsDropdown'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggleSimple } from '@/components/ui/theme-toggle'
import { SimpleUpgradeModal } from './SimpleUpgradeModal'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user, profile, loading, profileLoading } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)


  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-300"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Mobile menu button and title */}
          <div className="flex items-center flex-1">
            <motion.button
              type="button"
              className="lg:hidden p-3 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation"
              onClick={onMenuClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
            
            {/* Dashboard title */}
            <div className="ml-4 flex items-center space-x-4">
              <motion.h1 
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 lg:text-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="lg:hidden">LAW.AI</span>
                <span className="hidden lg:inline">LAW-AI Dashboard</span>
              </motion.h1>
              
              {/* Home button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="hidden sm:block"
              >
                <Link href="/">
                  <motion.button
                    className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Go to Home"
                  >
                    <Home className="h-5 w-5" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>


          </div>

          {/* Right side - Upgrade, Theme, Notifications and Profile */}
          <div className="flex items-center space-x-3">
            {/* Upgrade Button - Show if not PRO plan */}
            {profile?.plan !== 'PRO' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              </motion.div>
            )}
            
            {/* Theme Toggle - Hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="hidden sm:block"
            >
              <ThemeToggleSimple />
            </motion.div>
            
            {/* Notifications - Hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="hidden sm:block"
            >
              <NotificationsDropdown />
            </motion.div>
            
            {/* Profile - Always visible */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <ProfileDropdown />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <SimpleUpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </motion.div>
  )
}