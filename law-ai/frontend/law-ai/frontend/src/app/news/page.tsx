'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Newspaper, TrendingUp, Filter, Rss, Globe, Zap, BookOpen, Menu, X, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { FeatureModal } from '@/components/auth/FeatureModal'
import { useTheme } from '@/context/ThemeContext'
import { ThemeToggleSimple } from '@/components/ui/theme-toggle'
import { useRouter } from 'next/navigation'

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
}

function NewsContent() {
  const { user, loading: authLoading } = useAuth()
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const categories = ['Supreme Court', 'High Court', 'Legal Updates', 'Policy Changes', 'Bar News']

  const fetchNews = async () => {
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

  useEffect(() => {
    fetchNews()
  }, [])

  // Show loading during authentication
  if (authLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please login to access legal news</p>
          <a href="/auth/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    )
  }

  // Filter news based on search and category
  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Utility functions for styling (commented out as not used in current UI)
  // const getCategoryColor = (category: string) => {
  //   switch (category) {
  //     case 'Supreme Court': return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200'
  //     case 'High Court': return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200'
  //     case 'Legal Updates': return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200'
  //     case 'Policy Changes': return 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-800 border-purple-200'
  //     case 'Bar News': return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-200'
  //     default: return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200'
  //   }
  // }

  // const getSourceIcon = (source: string) => {
  //   switch (source) {
  //     case 'LiveLaw': return '⚖️'
  //     case 'Bar & Bench': return '🏛️'
  //     case 'Legal News': return '📰'
  //     default: return '📄'
  //   }
  // }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
    >
      <Toaster position="top-right" />
      
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px] border-b border-white/20 dark:border-gray-700/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 dark:from-green-400/10 dark:to-blue-400/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center py-8">
            <motion.div 
              className="flex items-center space-x-4"
              variants={itemVariants}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <motion.div 
                className="p-3 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Newspaper className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-green-600 dark:to-green-400 bg-clip-text text-transparent">
                  Legal News Feed
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Stay updated with the latest legal news and developments</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-3"
              variants={itemVariants}
            >
              <ThemeToggleSimple />
              <Badge 
                variant="secondary" 
                className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
              >
                <Rss className="h-4 w-4 mr-2" />
                Live Feed
              </Badge>
              <Badge 
                variant="secondary" 
                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
              >
                <Globe className="h-4 w-4 mr-2" />
                Real-time
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8"
          variants={itemVariants}
        >
          {[
            { 
              icon: Newspaper, 
              label: 'Total Articles', 
              value: news.length, 
              color: 'green',
              trend: '+24'
            },
            { 
              icon: TrendingUp, 
              label: 'Today\'s Updates', 
              value: news.filter(n => new Date(n.publishedAt).toDateString() === new Date().toDateString()).length, 
              color: 'blue',
              trend: '+12'
            },
            { 
              icon: BookOpen, 
              label: 'Categories', 
              value: categories.length, 
              color: 'purple',
              trend: 'All'
            },
            { 
              icon: Zap, 
              label: 'Live Sources', 
              value: '3', 
              color: 'orange',
              trend: 'Active'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-[20px] border border-gray-200/50 dark:border-gray-700/50"
              >
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between mb-2 lg:mb-4">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <motion.div 
                      className="p-2 lg:p-3 rounded-xl lg:rounded-2xl"
                      style={{
                        background: stat.color === 'green' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   stat.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                   stat.color === 'purple' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                                   'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: `0 8px 25px rgba(${
                          stat.color === 'green' ? '16, 185, 129' : 
                          stat.color === 'blue' ? '59, 130, 246' : 
                          stat.color === 'purple' ? '139, 92, 246' : 
                          '245, 158, 11'
                        }, 0.3)`
                      }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <stat.icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                    </motion.div>
                  </div>
                  <div className="flex items-center">
                    <Badge 
                      variant="secondary"
                      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs hidden lg:flex"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Desktop Search and Filter */}
        <motion.div 
          className="hidden lg:block mb-6 lg:mb-8"
          variants={itemVariants}
        >
          <Card 
            className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px] border border-gray-200/50 dark:border-gray-700/50"
          >
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 relative">
                  <motion.div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    animate={{ scale: searchTerm ? [1, 1.2, 1] : 1 }}
                    transition={{ repeat: searchTerm ? Infinity : 0, duration: 1 }}
                  >
                    <Search className="h-5 w-5 text-green-500" />
                  </motion.div>
                  <Input
                    placeholder="Example: Supreme Court judgment, new law amendment, legal policy update..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-xl lg:rounded-2xl transition-all duration-300 bg-white/80 dark:bg-gray-700/80 backdrop-blur-[10px] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 lg:px-4 py-2 lg:py-3 border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-xl lg:rounded-2xl text-sm lg:text-base transition-all duration-300 bg-white/80 dark:bg-gray-700/80 backdrop-blur-[10px] text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button 
                      variant="outline"
                      className="h-10 lg:h-12 px-4 lg:px-6 rounded-xl lg:rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* News Articles */}
        {filteredNews.length > 0 ? (
          <motion.div className="grid gap-6">
            {filteredNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px] border border-gray-200/50 dark:border-gray-700/50"
                >
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 lg:mb-4 space-y-2 sm:space-y-0">
                      <Badge className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs w-fit">
                        {article.source}
                      </Badge>
                      <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h3 className="text-base lg:text-xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3 hover:text-green-600 dark:hover:text-green-400 transition-colors leading-tight">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base">
                      {article.summary || article.content.substring(0, 150) + '...'}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                      <Badge variant="outline" className="text-xs w-fit">
                        {article.category}
                      </Badge>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          <span className="sm:hidden">Read Full Article</span>
                          <span className="hidden sm:inline">Read More</span>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card 
              className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px] border border-gray-200/50 dark:border-gray-700/50"
            >
              <CardContent className="p-8 lg:p-16 text-center">
                <motion.div 
                  className="max-w-sm mx-auto"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="p-6 lg:p-8 rounded-3xl w-fit mx-auto mb-4 lg:mb-6"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
                    }}

                  >
                    <Newspaper className="h-16 lg:h-20 w-16 lg:w-20 text-white" />
                  </motion.div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">No News Found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 lg:mb-8 text-base lg:text-lg">No articles match your current filters</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sources Section */}
        <motion.div 
          className="mt-8"
          variants={itemVariants}
        >
          <Card 
            className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px] border border-gray-200/50 dark:border-gray-700/50"
          >
            <CardContent className="p-4 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 text-center">News Sources</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {[
                  {
                    name: 'LiveLaw',
                    description: 'Leading legal news platform covering Supreme Court and High Court judgments',
                    icon: '⚖️',
                    color: 'red'
                  },
                  {
                    name: 'Bar & Bench',
                    description: 'Comprehensive legal news covering courts, law firms, and legal developments',
                    icon: '🏛️',
                    color: 'blue'
                  },
                  {
                    name: 'Legal Updates',
                    description: 'Latest updates on legal policies, amendments, and regulatory changes',
                    icon: '📰',
                    color: 'green'
                  }
                ].map((source, index) => (
                  <motion.div 
                    key={source.name}
                    className="text-center p-3 lg:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <motion.div 
                      className="p-3 lg:p-4 rounded-xl lg:rounded-2xl w-fit mx-auto mb-3 lg:mb-4"
                      style={{
                        background: source.color === 'red' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                   source.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                   'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: `0 8px 25px rgba(${source.color === 'red' ? '239, 68, 68' : source.color === 'blue' ? '59, 130, 246' : '16, 185, 129'}, 0.3)`
                      }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <span className="text-2xl lg:text-4xl">{source.icon}</span>
                    </motion.div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 lg:mb-3 text-base lg:text-lg">{source.name}</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm lg:text-base">{source.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <FeatureModal feature="NEWS">
      <NewsContent />
    </FeatureModal>
  )
}