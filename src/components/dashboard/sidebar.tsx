'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Home,
  // ...
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
  Phone
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
  isOpen: boolean
  onClose: () => void
}

export const Sidebar = memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const navigationItems = useMemo(() => {
    return navigation.map((item) => {
      const isActive = pathname === item.href
      return { ...item, isActive }
    })
  }, [pathname])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-serif text-lg">⚖</span>
            </div>
            <span className="text-xl font-serif font-bold text-gray-900">LAW.AI</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${item.isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={onClose}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{item.name}</span>
                </div>
                {item.isActive && <ChevronRight className="h-4 w-4 text-white/60" />}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Theme</span>
            <ThemeToggle />
          </div>
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2026 LAW.AI
            </p>
          </div>
        </div>
      </div>
    </>
  )
})
