'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, BarChart3, Users, MessageSquare, Scale, Briefcase, Newspaper, BookOpen, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'case' | 'draft' | 'client' | 'ai' | 'research' | 'news' | 'acts' | 'notices'
  title: string
  subtitle: string
  status?: string
  url: string
  icon: string
}

// Dashboard search suggestions similar to landing page
const dashboardSuggestions: SearchResult[] = [
  { id: '1', type: 'ai', title: 'AI Legal Assistant', subtitle: 'Get instant legal advice and answers', url: '/ai-assistant', icon: '🤖' },
  { id: '2', type: 'research', title: 'Legal Research', subtitle: 'Search case laws and legal precedents', url: '/research', icon: '🔍' },
  { id: '3', type: 'draft', title: 'Document Generator', subtitle: 'Create legal documents and contracts', url: '/drafts', icon: '📄' },
  { id: '4', type: 'case', title: 'Case Tracker', subtitle: 'Track and manage court cases', url: '/case-tracker', icon: '⚖️' },
  { id: '5', type: 'draft', title: 'Judgment Summarizer', subtitle: 'Summarize legal documents quickly', url: '/summarizer', icon: '📋' },
  { id: '6', type: 'notices', title: 'Legal Notices', subtitle: 'Generate and manage legal notices', url: '/notices', icon: '📨' },
  { id: '7', type: 'client', title: 'CRM System', subtitle: 'Manage clients and appointments', url: '/crm', icon: '👥' },
  { id: '8', type: 'news', title: 'Legal News', subtitle: 'Latest legal updates and news', url: '/news', icon: '📰' },
  { id: '9', type: 'acts', title: 'Acts Explorer', subtitle: 'Browse Indian legal acts and sections', url: '/acts', icon: '📚' },
]

export function GlobalSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length > 0) {
      const filtered = dashboardSuggestions.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setResults([])
      setIsOpen(false)
      setSelectedIndex(-1)
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
        handleResultClick(results[selectedIndex])
      } else if (results.length > 0) {
        handleResultClick(results[0])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    
    // Add small delay to ensure state updates
    setTimeout(() => {
      router.push(result.url)
    }, 100)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Search Input - Theme-aware styling */}
        <div className="relative theme-bg-primary/98 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border theme-border-primary/50 transition-all duration-500 hover:shadow-3xl hover:border-blue-300/50 dark:hover:border-blue-600/50 focus-within:border-blue-400/70 dark:focus-within:border-blue-500/70 focus-within:shadow-blue-200/20 dark:focus-within:shadow-blue-900/20 focus-within:shadow-2xl group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              🔍
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query && setIsOpen(true)}
              placeholder="Search features, cases, documents, clients..."
              className="flex-1 border-none outline-none text-lg bg-transparent theme-text-primary font-medium transition-colors duration-300"
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
                onClick={clearSearch}
                className="theme-text-muted hover:theme-text-secondary transition-all duration-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search Results Dropdown - Theme-aware */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="theme-bg-primary/99 backdrop-blur-2xl rounded-2xl shadow-2xl border theme-border-primary/60 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    flex items-center gap-4 p-4 cursor-pointer transition-all duration-300
                    border-b theme-border-primary/60 last:border-b-0
                    ${
                      selectedIndex === index 
                        ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 shadow-lg' 
                        : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300
                    ${
                      selectedIndex === index 
                        ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 shadow-xl scale-110 text-white' 
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 hover:scale-105'
                    }
                  `}>
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-base mb-1 truncate transition-colors duration-300 ${
                      selectedIndex === index 
                        ? 'theme-text-primary' 
                        : 'theme-text-primary'
                    }`}>
                      {result.title}
                    </h3>
                    <p className={`text-sm truncate transition-colors duration-300 ${
                      selectedIndex === index 
                        ? 'theme-text-secondary' 
                        : 'theme-text-secondary'
                    }`}>
                      {result.subtitle}
                    </p>
                  </div>
                  <div className={`
                    text-xl transition-all duration-300
                    ${
                      selectedIndex === index 
                        ? 'text-blue-600 dark:text-blue-400 transform translate-x-1 scale-110' 
                        : 'theme-text-muted'
                    }
                  `}>
                    →
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when no results - Theme-aware */}
      <AnimatePresence>
        {isOpen && query.length > 0 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="theme-bg-primary/99 backdrop-blur-2xl rounded-2xl shadow-2xl border theme-border-primary/60 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                🔍
              </div>
              <h3 className="font-semibold theme-text-primary mb-2">No results found</h3>
              <p className="theme-text-secondary text-sm">
                Try searching for features, cases, documents, or clients
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}