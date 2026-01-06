'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'law-ai-theme'
const ATTRIBUTE = 'data-theme'
const DEFAULT_THEME: Theme = 'system'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // Get system preference
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // Resolve theme based on current setting
  const resolveTheme = useCallback((themeValue: Theme): ResolvedTheme => {
    return themeValue === 'system' ? getSystemTheme() : themeValue
  }, [getSystemTheme])

  // Apply theme to DOM
  const applyTheme = useCallback((resolvedTheme: ResolvedTheme) => {
    const root = document.documentElement
    const isDark = resolvedTheme === 'dark'
    
    root.classList.toggle('dark', isDark)
    root.setAttribute(ATTRIBUTE, resolvedTheme)
    root.style.colorScheme = resolvedTheme
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#111827' : '#ffffff')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = isDark ? '#111827' : '#ffffff'
      document.head.appendChild(meta)
    }
  }, [])

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch (e) {
      console.warn('Failed to save theme preference:', e)
    }

    const resolved = resolveTheme(newTheme)
    setResolvedTheme(resolved)
    
    if (mounted) {
      applyTheme(resolved)
    }
  }, [mounted, resolveTheme, applyTheme])

  // Toggle between light and dark (skip system)
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [resolvedTheme, setTheme])

  // Sync theme with server
  const syncThemeWithServer = async (themeValue: Theme) => {
    try {
      const response = await fetch('/api/user/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeValue })
      })
      if (!response.ok) {
        console.warn('Failed to sync theme with server:', response.statusText)
      }
    } catch (error) {
      // Silently fail - theme will still work locally
      console.warn('Theme sync failed:', error)
    }
  }

  // Load theme from server for authenticated users
  const loadThemeFromServer = async () => {
    try {
      const response = await fetch('/api/user/theme')
      if (response.ok) {
        const { theme: serverTheme } = await response.json()
        if (serverTheme && ['light', 'dark', 'system'].includes(serverTheme)) {
          const resolved = resolveTheme(serverTheme)
          setThemeState(serverTheme)
          setResolvedTheme(resolved)
          applyTheme(resolved)
          return true
        }
      }
    } catch (error) {
      // Silently fail - use local storage
      console.warn('Failed to load theme from server:', error)
    }
    return false
  }

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      let savedTheme: Theme = 'light' // Default to light
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          savedTheme = stored
        }
      } catch (e) {
        // Use default light theme
      }

      const resolved = resolveTheme(savedTheme)
      setThemeState(savedTheme)
      setResolvedTheme(resolved)
      applyTheme(resolved)
      setMounted(true)
    }

    initializeTheme()
  }, [resolveTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme()
        setResolvedTheme(resolved)
        applyTheme(resolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted, getSystemTheme, applyTheme])

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedTheme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}