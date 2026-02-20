'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo, useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Home,
  MessageSquare,
  FileText,
  Scale,
  Briefcase,
  Users,
  Newspaper,
  BookOpen,
  Bell,
  Search,
  X,
  ChevronRight,
  Phone,
  ChevronLeft,
  Menu
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Cases', href: '/cases', icon: Briefcase },
  { name: 'AI Assistant', href: '/ai-assistant', icon: MessageSquare },
  { name: 'Voice Lawyer', href: '/voice-lawyer', icon: Phone },
  { name: 'Drafts', href: '/drafts', icon: Scale },
  { name: 'Summarizer', href: '/summarizer', icon: FileText },
  { name: 'Case Tracker', href: '/case-tracker', icon: Search },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Acts', href: '/acts', icon: BookOpen },
  { name: 'Notices', href: '/notices', icon: Bell },
  { name: 'Research', href: '/research', icon: Search },
] as const

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar = memo(function Sidebar({ isOpen: mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load collapsed state from localStorage
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  const navigationItems = useMemo(() => {
    return navigation.map((item) => {
      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
      return { ...item, isActive }
    })
  }, [pathname])

  if (!isMounted) return null

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-r border-slate-700 dark:border-slate-800 transform transition-all duration-300 ease-out flex flex-col
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        shadow-2xl lg:shadow-lg
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64 md:w-72
      `}>
        {/* Header with Logo and Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700 dark:border-slate-800">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-serif text-lg">⚖</span>
              </div>
              <span className="text-lg font-serif font-bold text-white truncate">LAW.AI</span>
            </Link>
          )}
          
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-serif text-lg">⚖</span>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-2">
            {/* Desktop Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Close */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 relative
                  ${item.isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${item.isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  )}
                </div>
                {item.isActive && !isCollapsed && (
                  <ChevronRight className="h-4 w-4 text-white/60 flex-shrink-0" />
                )}
                {item.isActive && isCollapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 dark:border-slate-800 space-y-3">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-700/30 rounded-lg">
              <span className="text-xs font-medium text-slate-300">Theme</span>
              <ThemeToggle />
            </div>
          )}
          
          {isCollapsed && (
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          )}

          {!isCollapsed && (
            <div className="px-3 py-2">
              <p className="text-xs text-slate-500 text-center">
                © 2026 LAW.AI
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
})
