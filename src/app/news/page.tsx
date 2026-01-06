'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Newspaper, Calendar, ExternalLink, RefreshCw, Loader2, Bookmark, BookmarkCheck } from 'lucide-react'

interface NewsArticle {
  id: string
  title: string
  content: string
  summary: string
  url: string
  source: string
  category: string
  publishedAt: string
  createdAt: string
}

const categories = ['All', 'Supreme Court', 'High Court', 'Legal Updates', 'Policy Changes', 'Bar News']

export default function NewsPage() {
  const { user, profile } = useAuth()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [savedArticles, setSavedArticles] = useState<string[]>([])

  useEffect(() => {
    fetchNews()
    // Load saved articles from localStorage
    const saved = localStorage.getItem('savedArticles')
    if (saved) setSavedArticles(JSON.parse(saved))
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setNews(Array.isArray(data) ? data : [])
      } else {
        toast.error('Failed to fetch news')
      }
    } catch (error) {
      console.error('News fetch error:', error)
      toast.error('Failed to fetch news')
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveArticle = (id: string) => {
    const newSaved = savedArticles.includes(id)
      ? savedArticles.filter(a => a !== id)
      : [...savedArticles, id]
    setSavedArticles(newSaved)
    localStorage.setItem('savedArticles', JSON.stringify(newSaved))
    toast.success(savedArticles.includes(id) ? 'Removed from saved' : 'Article saved')
  }

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const todayCount = news.filter(n => new Date(n.publishedAt).toDateString() === new Date().toDateString()).length

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Legal News</h1>
          <p className="text-gray-500 text-sm mt-1">Latest legal updates and developments</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {profile?.plan || 'FREE'} Plan
          </span>
          <button 
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Articles', value: news.length },
          { label: "Today's Updates", value: todayCount },
          { label: 'Saved', value: savedArticles.length },
          { label: 'Sources', value: new Set(news.map(n => n.source)).size || 3 }
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            />
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === category 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* News Articles */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="space-y-4">
          {filteredNews.map((article) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:border-gray-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                    {article.source}
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg">
                    {article.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 leading-snug">
                {article.title}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                {article.summary || article.content?.substring(0, 200) + '...'}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <button
                  onClick={() => toggleSaveArticle(article.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                    savedArticles.includes(article.id)
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {savedArticles.includes(article.id) ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {savedArticles.includes(article.id) ? 'Saved' : 'Save'}
                </button>
                
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Read More
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Newspaper className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* News Sources */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">News Sources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'LiveLaw', description: 'Supreme Court and High Court judgments', icon: '⚖️' },
            { name: 'Bar & Bench', description: 'Courts, law firms, and legal developments', icon: '🏛️' },
            { name: 'Legal Updates', description: 'Policies, amendments, and regulatory changes', icon: '📰' }
          ].map((source) => (
            <div key={source.name} className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl mb-2">{source.icon}</div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">{source.name}</h4>
              <p className="text-xs text-gray-500">{source.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
