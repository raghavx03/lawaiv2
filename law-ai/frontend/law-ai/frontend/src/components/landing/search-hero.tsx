'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export function SearchHero() {
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
        router.push(results[selectedIndex].href)
      } else if (results.length > 0) {
        router.push(results[0]?.href || '/')
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const handleResultClick = (href: string) => {
    router.push(href)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
        `,
        animation: 'float 6s ease-in-out infinite'
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            color: 'white',
            marginBottom: '1rem',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            lineHeight: '1.1'
          }}>
            Search Everything
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Find any feature, tool, or information across the entire LAW.AI platform
          </p>
        </div>

        {/* 3D Search Bar */}
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            transform: 'perspective(1000px) rotateX(5deg)',
            transformStyle: 'preserve-3d'
          }}>
            {/* Search Input Container */}
            <div className="bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-[20px] rounded-2xl p-4 shadow-2xl border border-white/20 dark:border-[#333]/50 transition-all duration-300 ease-out" style={{ transform: 'translateZ(20px)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg" style={{ transform: 'translateZ(10px)' }}>
                  🔍
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => query && setIsOpen(true)}
                  placeholder="Search features, tools, or ask anything..."
                  className="flex-1 border-none outline-none text-lg bg-transparent text-gray-900 dark:text-white font-medium placeholder-gray-500 dark:placeholder-[#aaa]"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
                <div className="py-2 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200" style={{ transform: 'translateZ(5px)' }}>
                  Search
                </div>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {isOpen && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/98 dark:bg-gray-900/98 backdrop-blur-[20px] rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 max-h-96 overflow-y-auto z-50" style={{ transform: 'translateZ(30px)' }}>
                {results.map((result, index) => (
                  <div
                    key={result.href}
                    onClick={() => handleResultClick(result.href)}
                    className={`p-4 px-6 cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                      index < results.length - 1 ? 'border-b border-gray-100/60 dark:border-gray-700/60' : ''
                    } ${
                      selectedIndex === index 
                        ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30' 
                        : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50'
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-200 ${
                      selectedIndex === index 
                        ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 text-white shadow-lg' 
                        : 'bg-blue-100/50 dark:bg-blue-900/30'
                    }`}>
                      {result.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-base">
                        {result.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm m-0">
                        {result.description}
                      </p>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-lg">
                      →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Buttons */}
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            {['AI Assistant', 'Doc Generator', 'Judgment Summarizer', 'Dashboard'].map((item) => {
              const routeMap = {
                'AI Assistant': '/ai-assistant',
                'Doc Generator': '/drafts', 
                'Judgment Summarizer': '/summarizer',
                'Dashboard': '/dashboard'
              }
              const suggestion = { href: (routeMap as any)[item] || '/dashboard', icon: item === 'AI Assistant' ? '🤖' : item === 'Doc Generator' ? '📄' : item === 'Judgment Summarizer' ? '📋' : '📊' }
              return (
                <button
                  key={item}
                  onClick={() => suggestion && router.push(suggestion.href)}
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-[10px] border border-white/30 dark:border-white/20 rounded-full py-2 px-4 text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-white/30 dark:hover:bg-white/20 hover:scale-105"
                  style={{ transform: 'translateZ(10px)' }}

                >
                  {suggestion?.icon} {item}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
      `}</style>
    </section>
  )
}