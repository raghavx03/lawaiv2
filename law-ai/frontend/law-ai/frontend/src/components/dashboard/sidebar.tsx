'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useMemo } from 'react'
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
  X
} from 'lucide-react'

// Memoize navigation array to prevent re-creation
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Assistant', href: '/ai-assistant', icon: MessageSquare },
  { name: 'Summarizer', href: '/summarizer', icon: FileText },
  { name: 'Drafts', href: '/drafts', icon: Scale },
  { name: 'Case Tracker', href: '/case-tracker', icon: Briefcase },
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
  
  // Memoize navigation items to prevent re-renders
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 sm:w-80 lg:w-64 bg-white dark:bg-gray-900 shadow-xl lg:shadow-lg dark:shadow-gray-900/50 transform transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:shadow-none lg:border-r lg:border-gray-200 dark:lg:border-gray-700
      `}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">⚖</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
              LAW.AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-4 text-base font-medium rounded-lg transition-all duration-200 min-h-[56px] touch-manipulation
                    ${item.isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                  onClick={onClose}
                >
                  <item.icon className={`
                    mr-4 h-6 w-6 flex-shrink-0 transition-colors
                    ${item.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}
                  `} />
                  <span className="truncate font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
})