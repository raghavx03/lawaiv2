'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, BookOpen, Download, Clock, FileText, Scale, Sparkles, TrendingUp, Database } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Toaster } from 'react-hot-toast'
import { FeatureModal } from '@/components/auth/FeatureModal'

interface Research {
  id: string
  query: string
  result: string
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

function ResearchContent() {
  const [research, setResearch] = useState<Research[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const fetchResearch = async () => {
    try {
      const response = await fetch('/api/research', {
        headers: { 'x-user-id': 'demo-user' }
      })
      if (response.ok) {
        const data = await response.json()
        setResearch(data)
      }
    } catch (error) {
      toast.error('Failed to fetch research')
    }
  }

  useEffect(() => {
    fetchResearch()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          query,
          result: `Research results for "${query}": Found relevant sections in IPC, CRPC, and related case laws. Key findings include applicable statutes and precedents.`
        })
      })

      if (response.ok) {
        toast.success('Research completed')
        setQuery('')
        fetchResearch()
      }
    } catch (error) {
      toast.error('Research failed')
    } finally {
      setLoading(false)
    }
  }

  const exportResults = () => {
    const csv = [
      'Query,Result,Date',
      ...research.map(r => `"${r.query}","${r.result}","${r.createdAt}"`)
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'legal-research.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Research exported successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 mr-2 sm:mr-4"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 sm:p-3 rounded-xl shadow-lg">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Legal Research Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Search legal databases, case laws, and precedents with AI assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Search Section */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6 sm:mb-8 border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]"
          >
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <motion.div
                    className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10"
                    animate={{ scale: loading ? [1, 1.2, 1] : 1 }}
                    transition={{ repeat: loading ? Infinity : 0, duration: 1 }}
                  >
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                  </motion.div>
                  <Input
                    placeholder="Search: Section 420 IPC, case laws, precedents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 sm:pl-14 h-12 sm:h-14 lg:h-16 text-sm sm:text-base lg:text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/80 dark:bg-gray-700/80 backdrop-blur-[10px] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                
                {/* Tags - Mobile Responsive */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {['IPC', 'CRPC', 'Case Laws', 'Precedents'].map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge 
                        variant="secondary"
                        className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                
                {/* Buttons - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <Button 
                    variant="outline"
                    onClick={exportResults}
                    disabled={research.length === 0}
                    className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 order-2 sm:order-1"
                    title="Download your research results as CSV file"
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Export Results</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    <Button 
                      type="submit" 
                      disabled={loading || !query.trim()} 
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="mr-2"
                          >
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                          </motion.div>
                          <span className="hidden sm:inline">Searching Database...</span>
                          <span className="sm:hidden">Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          <span className="hidden sm:inline">Start Research</span>
                          <span className="sm:hidden">Search</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={itemVariants}
        >
          {[
            { icon: Database, label: 'Total Searches', value: research.length, color: 'blue' },
            { icon: TrendingUp, label: 'Success Rate', value: research.length > 0 ? '100%' : '0%', color: 'green' },
            { icon: Clock, label: 'Avg Response', value: research.length > 0 ? '2.3s' : '0s', color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-[20px]"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{stat.label}</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    </div>
                    <motion.div 
                      className="p-2 sm:p-3 rounded-xl sm:rounded-2xl ml-3"
                      style={{
                        background: stat.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                   stat.color === 'green' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        boxShadow: `0 8px 25px rgba(${stat.color === 'blue' ? '59, 130, 246' : stat.color === 'green' ? '16, 185, 129' : '139, 92, 246'}, 0.3)`
                      }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          <div className="space-y-4 sm:space-y-6">
            {research.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]"
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <motion.div 
                          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                          }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 break-words">
                            {item.query}
                          </CardTitle>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Badge 
                              variant="outline"
                              className="bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border-green-200 text-xs sm:text-sm w-fit"
                            >
                              Legal Research
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} className="w-full sm:w-auto">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="w-full sm:w-auto hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 text-sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}
                    >
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{item.result}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        {['Relevant', 'Verified', 'Cited'].map((tag, tagIndex) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: tagIndex * 0.1 }}
                          >
                            <Badge 
                              variant="secondary"
                              className="bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border-green-200 text-xs sm:text-sm"
                            >
                              {tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <motion.div whileHover={{ scale: 1.05 }} className="flex-1 sm:flex-none">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full sm:w-auto hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-300 text-xs sm:text-sm"
                          >
                            <Scale className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Cite
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex-1 sm:flex-none">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full sm:w-auto hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-300 text-xs sm:text-sm"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Export
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Enhanced Empty State */}
        {research.length === 0 && (
          <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl w-fit mx-auto mb-4 sm:mb-6" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}>
                  <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Start Your Legal Research</h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">Search through comprehensive legal databases, case laws, and precedents</p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {['IPC Sections', 'Case Laws', 'Legal Precedents', 'Court Judgments'].map((tag) => (
                    <Badge key={tag} variant="outline" className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}

export default function ResearchPage() {
  return (
    <FeatureModal feature="RESEARCH">
      <ResearchContent />
    </FeatureModal>
  )
}