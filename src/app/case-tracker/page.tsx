'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Plus, Briefcase, Calendar, MapPin, Clock, Trash2, RefreshCw, Loader2, Bell, Eye, ChevronDown } from 'lucide-react'

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            Case Tracker
            <span className="flex h-2 w-2 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">LIVE</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time court updates from e-Courts services</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
            {profile?.plan || 'FREE'} Plan
          </span>
          <button
            onClick={fetchCases}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-green-600' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Cases', value: cases.length, icon: Briefcase },
          { label: 'Pending', value: cases.filter(c => c.status?.toLowerCase().includes('pending')).length, icon: Clock },
          { label: 'Upcoming Hearings', value: upcomingHearings.length, icon: Calendar },
          { label: 'Disposed', value: cases.filter(c => c.status?.toLowerCase().includes('disposed')).length, icon: Bell }
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg hidden sm:block">
                <stat.icon className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Case */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Track New Case</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={cnrInput}
              onChange={(e) => setCnrInput(e.target.value.toUpperCase())}
              placeholder="Enter CNR Number (e.g., DLHC010234562024)"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              onKeyDown={(e) => e.key === 'Enter' && trackCase()}
            />
          </div>
          <button
            onClick={trackCase}
            disabled={searching}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Connecting to e-Courts...</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Track Live</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          CNR (Case Number Record) is a unique number assigned to each case. Find it on your case documents.
        </p>
      </div>

      {/* Filter */}
      {cases.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-500">Filter:</span>
          <div className="flex flex-wrap gap-2">
            {['', 'pending', 'disposed', 'hearing'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterStatus === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cases List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Tracked Cases ({filteredCases.length})
        </h2>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center">
            <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No cases tracked yet</p>
            <p className="text-sm text-gray-400 mt-1">Add a CNR number above to start tracking</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{caseItem.cnrNumber}</h3>
                        <p className="text-sm text-gray-500">{caseItem.caseType || 'Case Type Pending'}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status || 'Pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{caseItem.court || 'Court Pending'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>{caseItem.nextHearing || 'No hearing date'}</span>
                      </div>
                      {caseItem.petitioner && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                          <span className="text-gray-400">vs</span>
                          <span className="truncate">{caseItem.petitioner} vs {caseItem.respondent}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col">
                    <button
                      onClick={() => setSelectedCase(selectedCase?.id === caseItem.id ? null : caseItem)}
                      className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteCase(caseItem.id)}
                      className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedCase?.id === caseItem.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Filing Date</p>
                        <p className="font-medium text-gray-900">{caseItem.filingDate || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Judge</p>
                        <p className="font-medium text-gray-900">{caseItem.judge || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Petitioner</p>
                        <p className="font-medium text-gray-900">{caseItem.petitioner || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Respondent</p>
                        <p className="font-medium text-gray-900">{caseItem.respondent || 'Not available'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Added on {new Date(caseItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Hearings */}
      {upcomingHearings.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Upcoming Hearings
          </h3>
          <div className="space-y-3">
            {upcomingHearings.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{c.cnrNumber}</p>
                  <p className="text-sm text-gray-500">{c.court}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">{c.nextHearing}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
