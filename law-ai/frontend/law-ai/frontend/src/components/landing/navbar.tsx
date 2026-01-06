'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ProfileDropdown } from '@/components/auth/ProfileDropdown'
import { ThemeToggle } from '@/components/ui/theme-toggle'

function AuthButton() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  // Check if we're on a dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard')
  
  // Show loading placeholder during authentication
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-12 h-9 sm:w-16 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="w-16 h-9 sm:w-20 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    )
  }
  
  if (user) {
    // Only show ProfileDropdown on dashboard pages
    if (isDashboardPage) {
      return <ProfileDropdown />
    }
    
    // On public pages, show dashboard link for authenticated users
    return (
      <Link 
        href="/dashboard" 
        className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 no-underline min-h-[44px] touch-manipulation"
      >
        <span className="hidden sm:inline">Dashboard</span>
        <span className="sm:hidden">📊</span>
      </Link>
    )
  }
  
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link 
        href="/auth/sign-in" 
        className="px-3 py-2 sm:px-4 sm:py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 no-underline text-sm sm:text-base font-medium min-h-[44px] flex items-center justify-center touch-manipulation"
      >
        <span className="hidden sm:inline">Sign In</span>
        <span className="sm:hidden">👤</span>
      </Link>
      <Link 
        href="/auth/sign-up" 
        className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 no-underline min-h-[44px] touch-manipulation"
      >
        <span className="hidden sm:inline">Get Started</span>
        <span className="sm:hidden">🚀</span>
      </Link>
    </div>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'pricing', 'about', 'contact']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/80 dark:border-gray-700/80 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
              ⚖
            </div>
            <span className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-gray-100 transition-colors">
              LAW.AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link 
              href="#features" 
              className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors relative pb-1 ${
                activeSection === 'features' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Features
              {activeSection === 'features' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
            <Link 
              href="#pricing" 
              className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors relative pb-1 ${
                activeSection === 'pricing' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Pricing
              {activeSection === 'pricing' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
            <Link 
              href="/indian-law-ai" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors relative pb-1"
            >
              Legal Insights
            </Link>
            <Link 
              href="/about" 
              className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors relative pb-1 ${
                activeSection === 'about' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              About
              {activeSection === 'about' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
            <Link 
              href="/contact" 
              className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 no-underline transition-colors relative pb-1 ${
                activeSection === 'contact' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Contact
              {activeSection === 'contact' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>



          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-lg border-none bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label={isOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <div className={`w-full h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`w-full h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${isOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-full h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-200 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div 
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <div className="px-4 py-6 space-y-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <Link href="#features" className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors no-underline text-base font-medium" onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link href="#pricing" className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors no-underline text-base font-medium" onClick={() => setIsOpen(false)}>
              Pricing
            </Link>
            <Link href="/indian-law-ai" className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors no-underline text-base font-medium" onClick={() => setIsOpen(false)}>
              Legal Insights
            </Link>
            <Link href="/about" className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors no-underline text-base font-medium" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors no-underline text-base font-medium" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
            <div className="flex items-center justify-between py-3 px-4 border-t border-gray-200 dark:border-gray-700 mt-4 pt-6">
              <ThemeToggle showLabel />
              <AuthButton />
            </div>
          </div>
        </div>
      </div>


    </nav>
  )
}