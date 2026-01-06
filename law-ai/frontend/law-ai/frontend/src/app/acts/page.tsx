'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Book, FileText, ChevronRight, Filter, Scale, Sparkles, Database, Target } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Toaster } from 'react-hot-toast'

import { FeatureModal } from '@/components/auth/FeatureModal'


interface Act {
  id: string
  title: string
  year: string
  actId: string
  sectionsCount: number
  description: string
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



function ActsExplorerContent() {
  const [acts, setActs] = useState<Act[]>([])
  const [filteredActs, setFilteredActs] = useState<Act[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockActs: Act[] = [
      {
        id: '1',
        title: 'Indian Penal Code',
        year: '1860',
        actId: 'IPC-1860',
        sectionsCount: 511,
        description: 'The main criminal code of India covering all substantive aspects of criminal law'
      },
      {
        id: '2',
        title: 'Code of Criminal Procedure',
        year: '1973',
        actId: 'CrPC-1973',
        sectionsCount: 484,
        description: 'Procedural law for administration of substantive criminal law in India'
      },
      {
        id: '3',
        title: 'Indian Contract Act',
        year: '1872',
        actId: 'ICA-1872',
        sectionsCount: 266,
        description: 'Governs the law relating to contracts in India'
      },
      {
        id: '4',
        title: 'Indian Evidence Act',
        year: '1872',
        actId: 'IEA-1872',
        sectionsCount: 167,
        description: 'Rules of evidence in Indian courts'
      },
      {
        id: '5',
        title: 'Constitution of India',
        year: '1950',
        actId: 'COI-1950',
        sectionsCount: 395,
        description: 'Supreme law of India establishing fundamental rights and duties'
      },
      {
        id: '6',
        title: 'Companies Act',
        year: '2013',
        actId: 'CA-2013',
        sectionsCount: 470,
        description: 'Regulates incorporation, responsibilities and dissolution of companies'
      }
    ]

    setTimeout(() => {
      setActs(mockActs)
      setFilteredActs(mockActs)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter acts based on search and year
  useEffect(() => {
    let filtered = acts

    if (searchQuery) {
      filtered = filtered.filter(act =>
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.actId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedYear) {
      filtered = filtered.filter(act => act.year === selectedYear)
    }

    setFilteredActs(filtered)
  }, [searchQuery, selectedYear, acts])

  const years = [...new Set(acts.map(act => act.year))].sort()

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Book className="h-8 w-8 text-white" />
        </motion.div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
      }}
    >
      <Toaster position="top-right" />
      
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center py-8">
            <motion.div 
              className="flex items-center space-x-4"
              variants={itemVariants}
            >
              <motion.div 
                className="p-3 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <Book className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Acts Explorer
                </h1>
                <p className="text-gray-600 mt-1">Browse and explore Indian legal acts, sections, and related judgments</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-3"
              variants={itemVariants}
            >
              <Badge 
                variant="secondary" 
                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200"
              >
                <Database className="h-4 w-4 mr-2" />
                Legal Database
              </Badge>
              <Badge 
                variant="secondary" 
                className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Comprehensive
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={itemVariants}
        >
          {[
            { icon: Book, label: 'Total Acts', value: acts.length, color: 'blue' },
            { icon: FileText, label: 'Total Sections', value: acts.reduce((sum, act) => sum + act.sectionsCount, 0), color: 'green' },
            { icon: Target, label: 'Years Covered', value: years.length, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <motion.div 
                      className="p-3 rounded-2xl"
                      style={{
                        background: stat.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                   stat.color === 'green' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        boxShadow: `0 8px 25px rgba(${stat.color === 'blue' ? '59, 130, 246' : stat.color === 'green' ? '16, 185, 129' : '139, 92, 246'}, 0.3)`
                      }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <Card 
            className="border-0 shadow-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Search Bar */}
                <div className="md:col-span-2 relative">
                  <motion.div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    animate={{ scale: searchQuery ? [1, 1.2, 1] : 1 }}
                    transition={{ repeat: searchQuery ? Infinity : 0, duration: 1 }}
                  >
                    <Search className="h-5 w-5 text-blue-500" />
                  </motion.div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Example: Indian Penal Code, Contract Act, Evidence Act, IPC-1860..."
                    className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-2xl transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </div>

                {/* Year Filter */}
                <div className="flex items-center space-x-3">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-2xl text-base transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredActs.length > 0 ? (
              filteredActs.map((act, index) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)'
                    }}
                    onClick={() => toast.success(`Opening ${act.title}`)}
                  >
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <motion.div 
                          className="p-2 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                          }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <FileText className="h-5 w-5 text-white" />
                        </motion.div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary"
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 text-xs"
                          >
                            {act.year}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight flex-shrink-0">
                        {act.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                        {act.description}
                      </p>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 flex-shrink-0">
                        <div className="flex items-center space-x-2 text-gray-600 text-sm">
                          <Book className="h-4 w-4" />
                          <span>{act.sectionsCount} sections</span>
                        </div>

                        <Badge 
                          variant="outline"
                          className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 text-xs font-semibold"
                        >
                          {act.actId}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card 
                  className="border-0 shadow-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <CardContent className="p-16 text-center">
                    <motion.div 
                      className="max-w-sm mx-auto"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="p-8 rounded-3xl w-fit mx-auto mb-6"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                        }}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 4,
                          ease: "easeInOut"
                        }}
                      >
                        <Book className="h-20 w-20 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No acts found</h3>
                      <p className="text-gray-600 text-lg">Try adjusting your search criteria or filters</p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Features Section */}
        <motion.div 
          className="mt-12"
          variants={itemVariants}
        >
          <Card 
            className="border-0 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Legal Acts Database Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Scale,
                    title: 'Comprehensive Coverage',
                    description: 'Complete collection of Indian legal acts from historical to contemporary legislation',
                    color: 'blue'
                  },
                  {
                    icon: Search,
                    title: 'Advanced Search',
                    description: 'Powerful search capabilities across act titles, descriptions, and section content',
                    color: 'green'
                  },
                  {
                    icon: FileText,
                    title: 'Detailed Information',
                    description: 'In-depth information about each act including sections, amendments, and related cases',
                    color: 'purple'
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={feature.title}
                    className="text-center p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <motion.div 
                      className="p-4 rounded-2xl w-fit mx-auto mb-4"
                      style={{
                        background: feature.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                   feature.color === 'green' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        boxShadow: `0 8px 25px rgba(${feature.color === 'blue' ? '59, 130, 246' : feature.color === 'green' ? '16, 185, 129' : '139, 92, 246'}, 0.3)`
                      }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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

export default function ActsExplorerPage() {
  return (
    <FeatureModal feature="ACTS">
      <ActsExplorerContent />
    </FeatureModal>
  )
}