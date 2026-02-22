'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Menu } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  useScrollReveal()

  // Sync collapsed state with sidebar
  import('react').then(React => {
    React.useEffect(() => {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved) setIsCollapsed(JSON.parse(saved))

      const handleStorage = () => {
        const current = localStorage.getItem('sidebar-collapsed')
        if (current) setIsCollapsed(JSON.parse(current))
      }
      window.addEventListener('storage', handleStorage)

      // Also poll for changes in case it happens in same tab
      const interval = setInterval(() => {
        const current = localStorage.getItem('sidebar-collapsed')
        if (current && JSON.parse(current) !== isCollapsed) {
          setIsCollapsed(JSON.parse(current))
        }
      }, 500)

      return () => {
        window.removeEventListener('storage', handleStorage)
        clearInterval(interval)
      }
    }, [isCollapsed])
  })

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className={`hidden lg:block transition-all duration-500 flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6 text-slate-900 dark:text-white" />
          </button>
          <div className="text-lg font-bold text-slate-900 dark:text-white">LAW.AI</div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
