'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Search, BookOpen, Download, Clock, FileText, History, Loader2, Sparkles, Copy, Eye, X } from 'lucide-react'
import { PremiumButton, PremiumCard, StatCard } from '@/components/premium'

interface Research {
  id: string
  query: string
  result: string
  createdAt: string
}

const quickSearches = [
  'Section 420 IPC - Cheating',
  'Section 138 NI Act - Cheque Bounce',
  'Section 498A IPC - Cruelty',
  'Bail provisions under CrPC',
  'Anticipatory bail conditions',
  'Divorce grounds under Hindu Marriage Act',
  'Consumer Protection Act remedies',
  'RTI Act provisions'
]

export default function ResearchPage() {
  const { user, profile } = useAuth()
  const [research, setResearch] = useState<Research[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingHistory, setFetchingHistory] = useState(false)
  const [query, setQuery] = useState('')
  const [currentResult, setCurrentResult] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [viewingResearch, setViewingResearch] = useState<Research | null>(null)

  useEffect(() => {
    if (user) {
      fetchResearch()
    }
  }, [user])

  const fetchResearch = async () => {
    setFetchingHistory(true)
    try {
      const response = await fetch('/api/research')
      if (response.ok) {
        const data = await response.json()
        setResearch(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to fetch research:', error)
    } finally {
      setFetchingHistory(false)
    }
  }

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query
    if (!q.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setLoading(true)
    setCurrentResult('')
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() })
      })

      const data = await response.json()
      
      if (response.ok) {
        setCurrentResult(data.result || data.content || '')
        toast.success('Research completed')
        setQuery('')
        fetchResearch()
      } else {
        throw new Error(data.message || data.error || 'Research failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Research failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const content = viewingResearch?.result || currentResult
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  const exportResults = () => {
    if (research.length === 0) {
      toast.error('No research to export')
      return
    }
    
    const content = research.map(r => 
      `Query: ${r.query}\n\nResult:\n${r.result}\n\nDate: ${new Date(r.createdAt).toLocaleDateString()}\n\n${'='.repeat(50)}\n\n`
    ).join('')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'legal-research.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Research exported')
  }

  const viewResearch = (item: Research) => {
    setViewingResearch(item)
    setShowHistory(false)
  }

  const reset = () => {
    setCurrentResult('')
    setViewingResearch(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-premium-h1 text-slate-900 dark:text-white">Legal Research</h1>
          <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-1">AI-powered legal research assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
            {profile?.plan || 'FREE'} Plan
          </span>
          <PremiumButton 
            onClick={() => setShowHistory(!showHistory)}
            variant="secondary"
            size="md"
            icon={<History className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">History</span>
          </PremiumButton>
          <PremiumButton 
            onClick={exportResults}
            disabled={research.length === 0}
            variant="secondary"
            size="md"
            icon={<Download className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Export</span>
          </PremiumButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Searches', value: research.length },
          { label: 'This Month', value: research.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length },
          { label: 'Today', value: research.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length }
        ].map((stat) => (
          <StatCard 
            key={stat.label}
            label={stat.label}
            value={stat.value}
            color="indigo"
          />
        ))}
      </div>

      {/* History Panel */}
      {showHistory && (
        <PremiumCard className="mb-6" title="Recent Research">
          {fetchingHistory ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : research.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {research.slice(0, 10).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                  onClick={() => viewResearch(item)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{item.query}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Eye className="h-4 w-4 text-slate-400 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">No research history yet</p>
          )}
        </PremiumCard>
      )}

      {/* Viewing Saved Research */}
      {viewingResearch && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-premium-h2 text-slate-900 dark:text-white truncate">{viewingResearch.query}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{new Date(viewingResearch.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <PremiumButton onClick={copyToClipboard} variant="ghost" size="sm" icon={<Copy className="h-5 w-5" />} />
              <PremiumButton onClick={reset} variant="ghost" size="sm" icon={<X className="h-5 w-5" />} />
            </div>
          </div>
          <PremiumCard hoverable={false}>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 max-h-[50vh] overflow-y-auto rounded-lg">
              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm">{viewingResearch.result}</p>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Search Box */}
      <PremiumCard className="mb-6" title="Search Legal Database">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: Section 420 IPC, bail provisions, case laws..."
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {/* Quick Searches */}
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Quick searches:</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.slice(0, 4).map((tag) => (
                <PremiumButton 
                  key={tag}
                  onClick={() => { setQuery(tag); handleSearch(tag); }}
                  variant="secondary"
                  size="sm"
                >
                  {tag}
                </PremiumButton>
              ))}
            </div>
          </div>
          
          <PremiumButton 
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()} 
            variant="primary"
            size="md"
            className="w-full"
            icon={loading ? undefined : <Sparkles className="h-5 w-5" />}
          >
            {loading ? 'Researching...' : 'Search'}
          </PremiumButton>
        </div>
      </PremiumCard>

      {/* Current Result */}
      {currentResult && !viewingResearch && (
        <PremiumCard className="mb-6" title="Research Result">
          <div className="flex items-center justify-between mb-4">
            <PremiumButton onClick={copyToClipboard} variant="ghost" size="sm" icon={<Copy className="h-5 w-5" />} />
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 max-h-[50vh] overflow-y-auto">
            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm">{currentResult}</p>
          </div>
        </PremiumCard>
      )}

      {/* Empty State */}
      {!currentResult && !viewingResearch && research.length === 0 && (
        <PremiumCard hoverable={false} className="mb-6">
          <div className="text-center py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-premium-h3 text-slate-900 dark:text-white mb-2">Start Your Research</h3>
            <p className="text-premium-body text-slate-600 dark:text-slate-400 mb-4">Search through legal databases, case laws, and precedents</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['IPC Sections', 'Case Laws', 'Legal Precedents', 'Court Judgments'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </PremiumCard>
      )}

      {/* More Quick Searches */}
      <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Popular Legal Topics</h3>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((tag) => (
            <PremiumButton 
              key={tag}
              onClick={() => { setQuery(tag); handleSearch(tag); }}
              variant="ghost"
              size="sm"
            >
              {tag}
            </PremiumButton>
          ))}
        </div>
      </div>
    </div>
  )
}
