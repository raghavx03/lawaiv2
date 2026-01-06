'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Search, BookOpen, Download, Clock, FileText, History, Loader2, Sparkles, Copy, Eye, X } from 'lucide-react'

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Legal Research</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered legal research assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {profile?.plan || 'FREE'} Plan
          </span>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button 
            onClick={exportResults}
            disabled={research.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Searches', value: research.length },
          { label: 'This Month', value: research.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length },
          { label: 'Today', value: research.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length }
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Recent Research</h3>
          {fetchingHistory ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : research.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {research.slice(0, 10).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer"
                  onClick={() => viewResearch(item)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.query}</p>
                    <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No research history yet</p>
          )}
        </div>
      )}

      {/* Viewing Saved Research */}
      {viewingResearch && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{viewingResearch.query}</h2>
              <p className="text-sm text-gray-500">{new Date(viewingResearch.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                <Copy className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={reset} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">{viewingResearch.result}</p>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Legal Database</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: Section 420 IPC, bail provisions, case laws..."
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {/* Quick Searches */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick searches:</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.slice(0, 4).map((tag) => (
                <button 
                  key={tag}
                  onClick={() => { setQuery(tag); handleSearch(tag); }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()} 
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Result */}
      {currentResult && !viewingResearch && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Research Result</h2>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="p-2 rounded-xl hover:bg-gray-100">
                <Copy className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 max-h-[50vh] overflow-y-auto">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">{currentResult}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentResult && !viewingResearch && research.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Research</h3>
          <p className="text-gray-500 mb-4 text-sm">Search through legal databases, case laws, and precedents</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['IPC Sections', 'Case Laws', 'Legal Precedents', 'Court Judgments'].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* More Quick Searches */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Legal Topics</h3>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((tag) => (
            <button 
              key={tag}
              onClick={() => { setQuery(tag); handleSearch(tag); }}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs rounded-xl hover:border-gray-300 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
