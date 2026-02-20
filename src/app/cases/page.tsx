'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCase, Case, CaseType, CaseStatus, Priority } from '@/context/CaseContext'
import { toast, Toaster } from 'react-hot-toast'
import { 
  Plus, Search, Briefcase, Calendar, MapPin, Clock, 
  Filter, ChevronRight, Scale, AlertTriangle, CheckCircle,
  Loader2, X, Target, Gavel, Users, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { StatCard, PremiumButton, PremiumCard } from '@/components/premium'

const caseTypes: { value: CaseType; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'CRIMINAL', label: 'Criminal' },
  { value: 'CIVIL', label: 'Civil' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'PROPERTY', label: 'Property' },
  { value: 'CONSUMER', label: 'Consumer' },
  { value: 'CHEQUE_BOUNCE', label: 'Cheque Bounce (138 NI)' },
  { value: 'LABOUR', label: 'Labour' },
  { value: 'WRIT', label: 'Writ Petition' },
  { value: 'ARBITRATION', label: 'Arbitration' }
]

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' }
]

export default function CasesPage() {
  const { user, profile } = useAuth()
  const { cases, activeCase, setActiveCase, createCase, loading, loadCases, openCases, archivedCases, urgentCases, upcomingHearings } = useCase()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [creating, setCreating] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    cnrNumber: '',
    caseType: 'GENERAL' as CaseType,
    court: '',
    petitioner: '',
    respondent: '',
    nextHearing: '',
    priority: 'MEDIUM' as Priority,
    notes: ''
  })

  useEffect(() => {
    if (user) {
      loadCases()
    }
  }, [user])

  const handleCreateCase = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a case title')
      return
    }

    setCreating(true)
    try {
      const newCase = await createCase({
        title: formData.title.trim(),
        cnrNumber: formData.cnrNumber.trim() || undefined,
        caseType: formData.caseType,
        court: formData.court.trim() || undefined,
        petitioner: formData.petitioner.trim() || undefined,
        respondent: formData.respondent.trim() || undefined,
        nextHearing: formData.nextHearing || undefined,
        priority: formData.priority,
        notes: formData.notes.trim() || undefined
      })

      if (newCase) {
        toast.success('Case created successfully')
        setShowCreateModal(false)
        setFormData({
          title: '', cnrNumber: '', caseType: 'GENERAL', court: '',
          petitioner: '', respondent: '', nextHearing: '', priority: 'MEDIUM', notes: ''
        })
        setActiveCase(newCase)
      } else {
        toast.error('Failed to create case')
      }
    } catch (error) {
      toast.error('Failed to create case')
    } finally {
      setCreating(false)
    }
  }

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.petitioner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.respondent?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || c.status === filterStatus
    const matchesType = !filterType || c.caseType === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      HEARING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      DISPOSED: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
      ARCHIVED: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
    }
    return colors[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
  }

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-premium-h1 text-slate-900 dark:text-white">My Cases</h1>
              <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-2">
                {activeCase ? `Active: ${activeCase.title}` : 'Manage your legal cases'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded-full">
                {profile?.plan || 'FREE'}
              </span>
              <PremiumButton onClick={() => setShowCreateModal(true)} size="lg">
                <Plus className="h-4 w-4" />
                New Case
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Open Cases" value={openCases.length} icon={<Briefcase className="h-5 w-5" />} color="indigo" />
          <StatCard label="Urgent" value={urgentCases.length} icon={<AlertTriangle className="h-5 w-5" />} color="rose" />
          <StatCard label="Upcoming Hearings" value={upcomingHearings.length} icon={<Calendar className="h-5 w-5" />} color="blue" />
          <StatCard label="Disposed" value={archivedCases.length} icon={<CheckCircle className="h-5 w-5" />} color="emerald" />
        </div>

        {/* Search and Filter */}
        <PremiumCard className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cases..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="HEARING">Hearing</option>
              <option value="DISPOSED">Disposed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="">All Types</option>
              {caseTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </PremiumCard>

        {/* Cases List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                <PremiumCard hoverable className={activeCase?.id === caseItem.id ? 'ring-2 ring-indigo-600 dark:ring-indigo-400' : ''}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${activeCase?.id === caseItem.id ? 'bg-indigo-600 dark:bg-indigo-600' : 'bg-indigo-100 dark:bg-indigo-900/50'}`}>
                        <Scale className={`h-6 w-6 ${activeCase?.id === caseItem.id ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{caseItem.title}</h3>
                          {activeCase?.id === caseItem.id && (
                            <span className="px-2 py-0.5 bg-indigo-600 dark:bg-indigo-600 text-white text-[10px] font-medium rounded">ACTIVE</span>
                          )}
                        </div>
                        {caseItem.cnrNumber && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">CNR: {caseItem.cnrNumber}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(caseItem.status)}`}>{caseItem.status}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(caseItem.priority)}`}>{caseItem.priority}</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">{caseItem.caseType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {caseItem.nextHearing && (
                        <div className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(caseItem.nextHearing).toLocaleDateString('en-IN')}
                        </div>
                      )}
                      {caseItem.court && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{caseItem.court}</span>
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                    </div>
                  </div>
                  {(caseItem.petitioner || caseItem.respondent) && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                      <span>{caseItem.petitioner || 'N/A'}</span>
                      <span className="text-slate-400 dark:text-slate-600">vs</span>
                      <span>{caseItem.respondent || 'N/A'}</span>
                    </div>
                  )}
                </PremiumCard>
              </Link>
            ))}
          </div>
        ) : (
          <PremiumCard className="text-center py-12">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-premium-h2 text-slate-900 dark:text-white mb-2">No Cases Yet</h3>
            <p className="text-premium-body text-slate-600 dark:text-slate-400 mb-6">Create your first case to start using LAW.AI</p>
            <PremiumButton onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create First Case
            </PremiumButton>
          </PremiumCard>
        )}

        {/* Create Case Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <PremiumCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-premium-h2 text-slate-900 dark:text-white">Create New Case</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Case Title <span className="text-rose-500">*</span></label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Ram vs State of Delhi"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">CNR Number</label>
                    <input
                      value={formData.cnrNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnrNumber: e.target.value.toUpperCase() }))}
                      placeholder="DLHC010234562024"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Case Type</label>
                    <select
                      value={formData.caseType}
                      onChange={(e) => setFormData(prev => ({ ...prev, caseType: e.target.value as CaseType }))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                    >
                      {caseTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Court</label>
                  <input
                    value={formData.court}
                    onChange={(e) => setFormData(prev => ({ ...prev, court: e.target.value }))}
                    placeholder="e.g., Delhi High Court"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Petitioner</label>
                    <input
                      value={formData.petitioner}
                      onChange={(e) => setFormData(prev => ({ ...prev, petitioner: e.target.value }))}
                      placeholder="Petitioner name"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Respondent</label>
                    <input
                      value={formData.respondent}
                      onChange={(e) => setFormData(prev => ({ ...prev, respondent: e.target.value }))}
                      placeholder="Respondent name"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Next Hearing</label>
                    <input
                      type="date"
                      value={formData.nextHearing}
                      onChange={(e) => setFormData(prev => ({ ...prev, nextHearing: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
                    >
                      {priorities.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <PremiumButton variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</PremiumButton>
                  <PremiumButton onClick={handleCreateCase} disabled={creating || !formData.title.trim()} isLoading={creating} className="flex-1">Create Case</PremiumButton>
                </div>
              </div>
            </PremiumCard>
          </div>
        )}
      </div>
    </div>
  )
}
