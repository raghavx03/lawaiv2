'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, FileText, Calendar, User, AlertCircle, Download, Filter, BarChart3, TrendingUp, Clock, Zap, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react'
import { AddCaseModal } from '@/components/case-tracker/AddCaseModal'
import { toast } from '@/components/ui/toast'
import { Toaster } from 'react-hot-toast'
import { NavigationHeader } from '@/components/layout/NavigationHeader'
import { FeatureModal } from '@/components/auth/FeatureModal'
import { SmallLoader } from '@/components/ui/LegalLoader'


interface Case {
  id: string
  cnr: string
  partyName: string
  court: string
  status: string
  lastUpdate: string
  nextDate?: string
  createdAt: string
  updatedAt: string
  details?: any
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

function CaseTrackerContent() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [stats, setStats] = useState({ total: 0, pending: 0, disposed: 0, nextHearing: 0 })
  
  const fetchCases = async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const response = await fetch('/api/case-tracker', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setCases(data.cases || [])
          setStats(data.stats || { total: 0, pending: 0, disposed: 0, nextHearing: 0 })
        } else {
          setCases([])
          setStats({ total: 0, pending: 0, disposed: 0, nextHearing: 0 })
        }
      }
    } catch (error) {
      toast.error('Failed to fetch cases')
      setCases([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshCases = async () => {
    setRefreshing(true)
    await fetchCases()
    toast.success('Cases refreshed')
  }

  useEffect(() => {
    fetchCases(true)
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchCases(), 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredCases = cases.filter(case_ => 
    case_.cnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.court.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filed':
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'under hearing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'judgment reserved': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'disposed':
      case 'allowed': return 'bg-green-100 text-green-800 border-green-200'
      case 'dismissed': return 'bg-red-100 text-red-800 border-red-200'
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const exportCases = () => {
    const csv = [
      'CNR,Party Name,Court,Status,Last Update,Next Date',
      ...cases.map(c => `"${c.cnr}","${c.partyName}","${c.court}","${c.status}","${c.lastUpdate}","${c.nextDate || 'N/A'}"`)
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'case-tracker.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Cases exported successfully')
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Toaster position="top-right" />
      
      <NavigationHeader
        title="Case Tracker"
        subtitle="Monitor and manage your legal cases with real-time updates"
        helpText="Track case progress, manage documents, and stay updated with hearing dates and case developments."
      />
      
      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshCases}
            disabled={refreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCases}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Case
          </Button>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: FileText, label: 'Total Cases', value: stats.total, color: 'blue' },
            { icon: Clock, label: 'Pending', value: stats.pending, color: 'yellow' },
            { icon: TrendingUp, label: 'Disposed', value: stats.disposed, color: 'green' },
            { icon: Calendar, label: 'Next Hearing', value: stats.nextHearing, color: 'purple' }
          ].map((stat, index) => (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                    stat.color === 'green' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cases by CNR, party name, or court..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-[#1E1E1E] dark:border-[#333] dark:text-white dark:placeholder-[#aaa]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map((case_) => (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {case_.cnr}
                        </h3>
                        <Badge className={`${getStatusColor(case_.status)} text-xs px-2 py-1`}>
                          {case_.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Party:</span>
                        <span className="font-medium">{case_.partyName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Court:</span>
                        <span className="font-medium">{case_.court}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                        <span className="font-medium">{formatDate(case_.lastUpdate)}</span>
                      </div>
                      {case_.nextDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Next Date:</span>
                          <span className="font-medium text-blue-600">{formatDate(case_.nextDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <SmallLoader />
          </div>
        )}

        {/* Empty State */}
        {filteredCases.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? 'No cases found' : 'No cases yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first case to track'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Case
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <AddCaseModal 
          open={showAddModal} 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchCases(true)}
        />
      </motion.div>
    </div>
  )
}

export default function CaseTrackerPage() {
  return (
    <FeatureModal feature="CASE_TRACKER">
      <CaseTrackerContent />
    </FeatureModal>
  )
}