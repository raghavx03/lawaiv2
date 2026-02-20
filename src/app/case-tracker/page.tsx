'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Plus, Briefcase, Calendar, MapPin, Clock, Trash2, RefreshCw, Loader2, Bell, Eye } from 'lucide-react'
import { PremiumButton, PremiumCard, StatCard } from '@/components/premium'

interface Case {
  id: string
  cnrNumber: string
  caseType?: string
  court?: string
  status?: string
  nextHearing?: string
  petitioner?: string
  respondent?: string
  filingDate?: string
  judge?: string
  createdAt: string
}

export default function CaseTrackerPage() {
  const { user, profile } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [cnrInput, setCnrInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    if (user) {
      fetchCases()
    }
  }, [user])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/case-tracker')
      const data = await response.json()
      if (data.cases) {
        setCases(data.cases)
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackCase = async () => {
    if (!cnrInput.trim()) {
      toast.error('Please enter a CNR number')
      return
    }

    // Validate CNR format (16 alphanumeric characters)
    const cnr = cnrInput.trim().toUpperCase().replace(/\s/g, '')
    if (cnr.length < 10) {
      toast.error('CNR number should be at least 10 characters')
      return
    }

    setSearching(true)
    try {
      const response = await fetch('/api/case-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnrNumber: cnr })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('Case added successfully')
        setCnrInput('')
        fetchCases()
      } else {
        throw new Error(data.error || 'Failed to track case')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to track case')
    } finally {
      setSearching(false)
    }
  }

  const deleteCase = async (id: string) => {
    if (!confirm('Remove this case from tracking?')) return

    try {
      const response = await fetch(`/api/case-tracker?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Case removed')
        setCases(prev => prev.filter(c => c.id !== id))
        if (selectedCase?.id === id) setSelectedCase(null)
      }
    } catch (error) {
      toast.error('Failed to delete case')
    }
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-600'
    const s = status.toLowerCase()
    if (s.includes('pending')) return 'bg-yellow-100 text-yellow-700'
    if (s.includes('disposed') || s.includes('closed')) return 'bg-green-100 text-green-700'
    if (s.includes('hearing')) return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  const filteredCases = filterStatus
    ? cases.filter(c => c.status?.toLowerCase().includes(filterStatus.toLowerCase()))
    : cases

  const upcomingHearings = cases.filter(c => c.nextHearing && new Date(c.nextHearing) >= new Date())

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-premium-h1 text-gray-900 dark:text-white flex items-center gap-3">
              Case Tracker
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">LIVE</span>
            </h1>
            <p className="text-premium-body text-gray-600 dark:text-gray-400 mt-2">Real-time court updates from e-Courts services</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-700">
              {profile?.plan || 'FREE'} Plan
            </span>
            <PremiumButton
              variant="secondary"
              size="sm"
              onClick={fetchCases}
              icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />}
            >
              <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Refresh'}</span>
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Cases', value: cases.length, icon: <Briefcase className="h-6 w-6" />, color: 'indigo' },
          { label: 'Pending', value: cases.filter(c => c.status?.toLowerCase().includes('pending')).length, icon: <Clock className="h-6 w-6" />, color: 'amber' },
          { label: 'Upcoming Hearings', value: upcomingHearings.length, icon: <Calendar className="h-6 w-6" />, color: 'emerald' },
          { label: 'Disposed', value: cases.filter(c => c.status?.toLowerCase().includes('disposed')).length, icon: <Bell className="h-6 w-6" />, color: 'rose' }
        ].map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value.toString()}
            icon={stat.icon}
            color={stat.color as any}
          />
        ))}
      </div>

      {/* Add Case */}
      <PremiumCard className="mb-6">
        <h2 className="text-premium-h2 text-gray-900 dark:text-white mb-4">Track New Case</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={cnrInput}
              onChange={(e) => setCnrInput(e.target.value.toUpperCase())}
              placeholder="Enter CNR Number (e.g., DLHC010234562024)"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              onKeyDown={(e) => e.key === 'Enter' && trackCase()}
            />
          </div>
          <PremiumButton
            variant="primary"
            size="md"
            onClick={trackCase}
            disabled={searching}
            icon={searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          >
            {searching ? 'Connecting...' : 'Track Live'}
          </PremiumButton>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          CNR (Case Number Record) is a unique number assigned to each case. Find it on your case documents.
        </p>
      </PremiumCard>

      {/* Filter */}
      {cases.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
          <div className="flex flex-wrap gap-2">
            {['', 'pending', 'disposed', 'hearing'].map((status) => (
              <PremiumButton
                key={status}
                variant={filterStatus === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status || 'All'}
              </PremiumButton>
            ))}
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="space-y-4">
        <h2 className="text-premium-h2 text-gray-900 dark:text-white">
          Tracked Cases ({filteredCases.length})
        </h2>

        {loading ? (
          <PremiumCard className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading cases...</p>
          </PremiumCard>
        ) : filteredCases.length === 0 ? (
          <PremiumCard className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No cases tracked yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Add a CNR number above to start tracking</p>
          </PremiumCard>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((caseItem) => (
              <PremiumCard key={caseItem.id}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-premium-h3 text-gray-900 dark:text-white truncate">{caseItem.cnrNumber}</h3>
                        <p className="text-premium-body text-gray-600 dark:text-gray-400">{caseItem.caseType || 'Case Type Pending'}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status || 'Pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="truncate">{caseItem.court || 'Court Pending'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span>{caseItem.nextHearing || 'No hearing date'}</span>
                      </div>
                      {caseItem.petitioner && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 sm:col-span-2">
                          <span className="text-gray-400 dark:text-gray-500">vs</span>
                          <span className="truncate">{caseItem.petitioner} vs {caseItem.respondent}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col">
                    <PremiumButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCase(selectedCase?.id === caseItem.id ? null : caseItem)}
                      icon={<Eye className="h-4 w-4" />}
                    />
                    <PremiumButton
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCase(caseItem.id)}
                      icon={<Trash2 className="h-4 w-4 text-rose-500 dark:text-rose-400" />}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedCase?.id === caseItem.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Filing Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseItem.filingDate || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Judge</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseItem.judge || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Petitioner</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseItem.petitioner || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Respondent</p>
                        <p className="font-medium text-gray-900 dark:text-white">{caseItem.respondent || 'Not available'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                      Added on {new Date(caseItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </PremiumCard>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Hearings */}
      {upcomingHearings.length > 0 && (
        <PremiumCard className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <h3 className="text-premium-h3 text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Upcoming Hearings
          </h3>
          <div className="space-y-3">
            {upcomingHearings.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-premium-body font-medium text-gray-900 dark:text-white">{c.cnrNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{c.court}</p>
                </div>
                <div className="text-right">
                  <p className="text-premium-body font-medium text-indigo-600 dark:text-indigo-400">{c.nextHearing}</p>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      )}
    </div>
  )
}
