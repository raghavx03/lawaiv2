'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCase, CaseStatus } from '@/context/CaseContext'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Briefcase, Plus, Search, Calendar, MapPin, Clock, 
  ChevronRight, Filter, ArrowUpRight, Users, FileText,
  MessageSquare, AlertCircle, Archive, Lock
} from 'lucide-react'

export default function CasesPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { cases, activeCase, setActiveCase, loadCases, loading, openCases, archivedCases } = useCase()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCaseStatus, setFilterCaseStatus] = useState<'all' | 'open' | 'archived'>('open')

  useEffect(() => {
    if (user) {
      loadCases()
    }
  }, [user])

  const filteredCases = cases.filter(c => {
    const matchesSearch = !searchTerm || 
      c.cnrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.petitioner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.respondent?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || 
      c.status?.toLowerCase().includes(filterStatus.toLowerCase())
    
    // Filter by case status (OPEN/ARCHIVED/CLOSED)
    const matchesCaseStatus = filterCaseStatus === 'all' ||
      (filterCaseStatus === 'open' && (!c.caseStatus || c.caseStatus === 'OPEN')) ||
      (filterCaseStatus === 'archived' && (c.caseStatus === 'ARCHIVED' || c.caseStatus === 'CLOSED'))
    
    return matchesSearch && matchesStatus && matchesCaseStatus
  })

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-600'
    const s = status.toLowerCase()
    if (s.includes('pending')) return 'bg-yellow-100 text-yellow-700'
    if (s.includes('disposed') || s.includes('closed')) return 'bg-green-100 text-green-700'
    if (s.includes('hearing')) return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  const stats = {
    total: cases.length,
    open: openCases.length,
    archived: archivedCases.length,
    upcoming: cases.filter(c => c.nextHearing && new Date(c.nextHearing) >= new Date()).length
  }

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your legal cases in one place</p>
        </div>
        <Link href="/cases/new">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors">
            <Plus className="h-4 w-4" />
            New Case
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Cases', value: stats.total, icon: Briefcase, color: 'text-gray-600' },
          { label: 'Open', value: stats.open, icon: Clock, color: 'text-green-600' },
          { label: 'Archived', value: stats.archived, icon: Archive, color: 'text-gray-500' },
          { label: 'Upcoming Hearings', value: stats.upcoming, icon: Calendar, color: 'text-blue-600' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color} hidden sm:block`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by CNR, party name..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {/* Case Status Filter (OPEN/ARCHIVED) */}
          {(['open', 'archived', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterCaseStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${
                filterCaseStatus === status 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'archived' && <Archive className="h-3.5 w-3.5" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterStatus ? 'No cases found' : 'No cases yet'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {searchTerm || filterStatus 
              ? 'Try adjusting your search or filters' 
              : 'Create your first case to get started'}
          </p>
          <Link href="/cases/new">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors">
              <Plus className="h-4 w-4" />
              Create First Case
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((caseItem) => (
            <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
              <div className={`bg-white border rounded-2xl p-4 sm:p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer ${
                activeCase?.id === caseItem.id ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{caseItem.cnrNumber}</h3>
                        {activeCase?.id === caseItem.id && (
                          <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">Active</span>
                        )}
                      </div>
                      {(caseItem.petitioner || caseItem.respondent) && (
                        <p className="text-sm text-gray-600 truncate">
                          {caseItem.petitioner} vs {caseItem.respondent}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        {caseItem.court && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {caseItem.court}
                          </span>
                        )}
                        {caseItem.nextHearing && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Next: {caseItem.nextHearing}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status || 'Pending'}
                    </span>
                    {caseItem.caseStatus === 'ARCHIVED' && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full flex items-center gap-1">
                        <Archive className="h-3 w-3" />
                        Archived
                      </span>
                    )}
                    {caseItem.caseStatus === 'CLOSED' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Closed
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {cases.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
          <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/case-tracker">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300">
                Track by CNR
              </button>
            </Link>
            <Link href="/drafts">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300">
                Generate Draft
              </button>
            </Link>
            <Link href="/ai-assistant">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300">
                Ask AI
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
