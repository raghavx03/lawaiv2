'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopNav } from './TopNav'
import { useAuth } from '@/context/AuthContext'
import { AdminOverride } from './AdminOverride'
import { PageTransition } from '@/components/ui/PageTransition'
import { LoadingBar } from '@/components/ui/LoadingBar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-4" />
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Dashboard...</p>
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
    <AdminOverride>
      <LoadingBar isLoading={loading} />
      <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </main>
        </div>
        

      </div>
    </AdminOverride>
  )
}