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
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        shadow-2xl lg:shadow-lg
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64 md:w-72
      `}>
        {/* Header with Logo and Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/50 dark:border-slate-800/50">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white dark:text-black font-serif text-lg">⚖</span>
              </div>
              <span className="text-lg font-serif font-bold text-slate-900 dark:text-white truncate">LAW.AI</span>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                <span className="text-white dark:text-black font-serif text-lg">⚖</span>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-2">
            {/* Desktop Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
              aria-label="Toggle sidebar"
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                {isCollapsed ? (
                  <Menu className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </div>
            </button>

            {/* Mobile Close */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 relative stagger-item overflow-hidden
                  ${item.isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active/Hover Glow Indicator */}
                {item.isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white dark:bg-black rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.8)] dark:shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${item.isActive ? 'text-white dark:text-black' : 'text-slate-500 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white'}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  )}
                </div>
                {item.isActive && !isCollapsed && (
                  <ChevronRight className="h-4 w-4 text-white/60 dark:text-black/60 flex-shrink-0 relative z-10" />
                )}
                {item.isActive && isCollapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-black dark:bg-white rounded-l-full relative z-10" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Theme</span>
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
      </aside>
    </>
  )
})
