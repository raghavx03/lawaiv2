import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'law-ai-theme'
export const THEME_ATTRIBUTE = 'data-theme'

/**
 * Get system theme preference
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolve theme to actual theme (system -> light/dark)
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const isDark = theme === 'dark'
  
  // Add transition class to prevent flashing
  root.classList.add('theme-transitioning')
  
  // Apply theme
  root.classList.toggle('dark', isDark)
  root.setAttribute(THEME_ATTRIBUTE, theme)
  root.style.colorScheme = theme
  
  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(theme)
  
  // Remove transition class after a short delay
  setTimeout(() => {
    root.classList.remove('theme-transitioning')
  }, 100)
}

/**
 * Update meta theme-color for mobile browsers
 */
export function updateMetaThemeColor(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return

  const themeColor = theme === 'dark' ? '#111827' : '#ffffff'
  let metaThemeColor = document.querySelector('meta[name="theme-color"]')
  
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColor)
  } else {
    metaThemeColor = document.createElement('meta')
    metaThemeColor.setAttribute('name', 'theme-color')
    metaThemeColor.setAttribute('content', themeColor)
    document.head.appendChild(metaThemeColor)
  }
}

/**
 * Get theme-aware class names
 */
export function getThemeClasses(baseClasses: string, darkClasses?: string) {
  if (!darkClasses) return baseClasses
  return `${baseClasses} dark:${darkClasses}`
}

/**
 * Theme-aware component class builder
 */
export function themeClasses(config: {
  base?: string
  light?: string
  dark?: string
  hover?: {
    light?: string
    dark?: string
  }
  focus?: {
    light?: string
    dark?: string
  }
}) {
  const classes = []
  
  if (config.base) classes.push(config.base)
  if (config.light) classes.push(config.light)
  if (config.dark) classes.push(`dark:${config.dark}`)
  
  if (config.hover?.light) classes.push(`hover:${config.hover.light}`)
  if (config.hover?.dark) classes.push(`dark:hover:${config.hover.dark}`)
  
  if (config.focus?.light) classes.push(`focus:${config.focus.light}`)
  if (config.focus?.dark) classes.push(`dark:focus:${config.focus.dark}`)
  
  return classes.join(' ')
}

/**
 * Common theme-aware component styles
 */
export const themeStyles = {
  // Cards
  card: themeClasses({
    base: 'rounded-lg border transition-all duration-300',
    light: 'bg-white border-gray-200 shadow-card-light',
    dark: 'bg-gray-900 border-gray-700 shadow-card-dark',
    hover: {
      light: 'shadow-md',
      dark: 'shadow-lg'
    }
  }),
  
  // Buttons
  button: {
    primary: themeClasses({
      base: 'px-4 py-2 rounded-md font-medium transition-all duration-200',
      light: 'bg-blue-600 text-white hover:bg-blue-700',
      dark: 'bg-blue-600 text-white hover:bg-blue-500',
      focus: {
        light: 'ring-2 ring-blue-500 ring-offset-2',
        dark: 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900'
      }
    }),
    
    secondary: themeClasses({
      base: 'px-4 py-2 rounded-md font-medium transition-all duration-200',
      light: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      dark: 'bg-gray-700 text-gray-100 hover:bg-gray-600',
      focus: {
        light: 'ring-2 ring-gray-500 ring-offset-2',
        dark: 'ring-2 ring-gray-400 ring-offset-2 ring-offset-gray-900'
      }
    }),
    
    ghost: themeClasses({
      base: 'px-4 py-2 rounded-md font-medium transition-all duration-200',
      light: 'text-gray-700 hover:bg-gray-100',
      dark: 'text-gray-300 hover:bg-gray-800',
      focus: {
        light: 'ring-2 ring-gray-500 ring-offset-2',
        dark: 'ring-2 ring-gray-400 ring-offset-2 ring-offset-gray-900'
      }
    })
  },
  
  // Inputs
  input: themeClasses({
    base: 'w-full px-3 py-2 rounded-md border transition-all duration-200',
    light: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    dark: 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400',
    focus: {
      light: 'border-blue-500 ring-1 ring-blue-500',
      dark: 'border-blue-400 ring-1 ring-blue-400'
    }
  }),
  
  // Text
  text: {
    primary: themeClasses({
      light: 'text-gray-900',
      dark: 'text-gray-100'
    }),
    
    secondary: themeClasses({
      light: 'text-gray-600',
      dark: 'text-gray-400'
    }),
    
    muted: themeClasses({
      light: 'text-gray-500',
      dark: 'text-gray-500'
    })
  },
  
  // Backgrounds
  background: {
    primary: themeClasses({
      light: 'bg-white',
      dark: 'bg-gray-900'
    }),
    
    secondary: themeClasses({
      light: 'bg-gray-50',
      dark: 'bg-gray-800'
    }),
    
    muted: themeClasses({
      light: 'bg-gray-100',
      dark: 'bg-gray-700'
    })
  },
  
  // Borders
  border: {
    default: themeClasses({
      light: 'border-gray-200',
      dark: 'border-gray-700'
    }),
    
    muted: themeClasses({
      light: 'border-gray-100',
      dark: 'border-gray-800'
    })
  }
}

/**
 * Validate theme value
 */
export function isValidTheme(theme: string): theme is Theme {
  return ['light', 'dark', 'system'].includes(theme)
}

/**
 * Get theme from localStorage with fallback
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored && isValidTheme(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

/**
 * Store theme in localStorage
 */
export function storeTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Failed to store theme preference:', error)
  }
}