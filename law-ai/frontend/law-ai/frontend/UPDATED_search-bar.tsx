'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const searchSuggestions = [
  { title: 'AI Legal Assistant', description: 'Get instant legal advice', href: '/ai-assistant', icon: '🤖' },
  { title: 'Legal Research', description: 'Search case laws and acts', href: '/research', icon: '🔍' },
  { title: 'Document Generator', description: 'Create legal documents', href: '/drafts', icon: '📄' },
  { title: 'Case Tracker', description: 'Track court cases', href: '/case-tracker', icon: '⚖️' },
  { title: 'Judgment Summarizer', description: 'Summarize legal documents', href: '/summarizer', icon: '📋' },
  { title: 'Legal Notices', description: 'Generate legal notices', href: '/notices', icon: '📨' },
  { title: 'CRM System', description: 'Manage clients and cases', href: '/crm', icon: '👥' },
  { title: 'Legal News', description: 'Latest legal updates', href: '/news', icon: '📰' },
  { title: 'Acts Explorer', description: 'Browse Indian legal acts', href: '/acts', icon: '📚' },
  { title: 'Dashboard', description: 'Your legal workspace', href: '/dashboard', icon: '📊' }
]

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof searchSuggestions>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchSuggestions.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setIsOpen(true)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : prev)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex].href)
      } else if (results.length > 0) {
        handleResultClick(results[0]?.href || '/')
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const { user } = useAuth()
  
  const handleResultClick = (href: string) => {
    setQuery('')
    setIsOpen(false)
    
    // Add small delay to ensure state updates
    setTimeout(() => {
      if (user) {
        router.push(href)
      } else {
        router.push(`/auth/sign-in?redirect=${href}`)
      }
    }, 100)
  }

  return (
    <div className="max-w-4xl w-full mx-auto mb-6 sm:mb-8 relative px-4 sm:px-6">
      {/* Search Input - Theme-aware styling */}
      <div className="relative theme-bg-primary/95 backdrop-blur-[20px] rounded-2xl sm:rounded-[25px] p-3 sm:p-4 lg:p-6 shadow-[0_20px_40px_var(--theme-shadow)] border theme-border-primary/20 transition-all duration-300 ease-out">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-base sm:text-lg lg:text-xl shadow-lg flex-shrink-0">
            🔍
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setIsOpen(true)}
            placeholder="Search features, tools, or ask anything..."
            autoComplete="off"
            spellCheck="false"
            className="flex-1 border-none outline-none text-sm sm:text-base lg:text-lg bg-transparent theme-text-primary font-medium min-h-[44px] py-2"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              appearance: 'none',
              color: 'var(--theme-input-text)',
              caretColor: '#3b82f6'
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setIsOpen(false)
              }}
              className="bg-none border-none theme-text-muted hover:theme-text-secondary cursor-pointer text-base sm:text-lg p-2 sm:p-1 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown - Theme-aware */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 sm:mt-3 theme-bg-primary/98 backdrop-blur-[20px] rounded-xl sm:rounded-2xl shadow-2xl border theme-border-primary/50 max-h-80 sm:max-h-96 overflow-y-auto z-50">
          {results.map((result, index) => (
            <div
              key={result.href}
              onClick={() => handleResultClick(result.href)}
              className={`p-3 sm:p-4 lg:p-5 cursor-pointer transition-all duration-200 flex items-center gap-3 sm:gap-4 min-h-[60px] sm:min-h-[72px] touch-manipulation ${
                index < results.length - 1 ? 'border-b theme-border-primary/60' : ''
              } ${
                selectedIndex === index 
                  ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30' 
                  : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50'
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base lg:text-lg transition-all duration-200 flex-shrink-0 ${
                selectedIndex === index 
                  ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 text-white shadow-lg' 
                  : 'bg-blue-100/50 dark:bg-blue-900/30'
              }`}>
                {result.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold theme-text-primary mb-1 text-sm sm:text-base leading-tight">
                  {result.title}
                </h3>
                <p className="theme-text-secondary text-xs sm:text-sm m-0 leading-relaxed line-clamp-2">
                  {result.description}
                </p>
              </div>
              <div className={`text-base sm:text-lg transition-all duration-200 flex-shrink-0 ${
                selectedIndex === index ? 'text-blue-600 dark:text-blue-400' : 'theme-text-muted'
              }`}>
                →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}