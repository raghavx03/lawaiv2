'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCase, Case, CaseStatus } from '@/context/CaseContext'
import { toast, Toaster } from 'react-hot-toast'
import { CaseHealthWidget } from '@/components/shared/CaseHealthWidget'
import { 
  ArrowLeft, Briefcase, Calendar, MapPin, User, Phone, Mail,
  FileText, MessageSquare, Scale, Upload, Clock, ChevronRight,
  Edit, Trash2, CheckCircle, AlertCircle, Plus, History, Archive, Lock
} from 'lucide-react'

interface TimelineItem {
  id: string
  type: 'ai_chat' | 'draft' | 'summary' | 'file' | 'hearing' | 'note' | 'created'
  title: string
  description?: string
  createdAt: string
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { cases, activeCase, setActiveCase, loadCases, updateCaseStatus } = useCase()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const caseId = params.id as string

  useEffect(() => {
    if (cases.length > 0) {
      const found = cases.find(c => c.id === caseId)
      if (found) {
        setCaseData(found)
        generateTimeline(found)
      }
      setLoading(false)
    }
  }, [cases, caseId])

  useEffect(() => {
    if (user && cases.length === 0) {
      loadCases()
    }
  }, [user])

  const generateTimeline = (caseItem: Case) => {
    // Generate mock timeline - in production, this would come from API
    const items: TimelineItem[] = [
      {
        id: '1',
        type: 'created',
        title: 'Case added to LAW.AI',
        description: `CNR: ${caseItem.cnrNumber}`,
        createdAt: caseItem.createdAt
      }
    ]

    if (caseItem.nextHearing) {
      items.push({
        id: '2',
        type: 'hearing',
        title: 'Next hearing scheduled',
        description: caseItem.court || 'Court details pending',
        createdAt: new Date().toISOString()
      })
    }

    setTimeline(items.reverse())
  }

  const handleSetActive = () => {
    if (caseData) {
      setActiveCase(caseData)
      toast.success('Case set as active')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this case?')) return
    
    try {
      const response = await fetch(`/api/case-tracker?id=${caseId}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Case removed')
        if (activeCase?.id === caseId) {
          setActiveCase(null)
        }
        await loadCases()
        router.push('/cases')
      }
    } catch (error) {
      toast.error('Failed to remove case')
    }
  }

  const handleStatusChange = async (status: CaseStatus) => {
    await updateCaseStatus(caseId, status)
    setCaseData(prev => prev ? { ...prev, caseStatus: status } : null)
    setShowStatusMenu(false)
    toast.success(`Case ${status.toLowerCase()}`)
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-600'
    const s = status.toLowerCase()
    if (s.includes('pending')) return 'bg-yellow-100 text-yellow-700'
    if (s.includes('disposed') || s.includes('closed')) return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-600'
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'ai_chat': return MessageSquare
      case 'draft': return FileText
      case 'summary': return Scale
      case 'file': return Upload
      case 'hearing': return Calendar
      case 'created': return Briefcase
      case 'status_change': return Archive
      default: return Clock
    }
  }

  const getCaseStatusColor = (status?: CaseStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-700'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-600'
      case 'CLOSED': return 'bg-blue-100 text-blue-700'
      default: return 'bg-green-100 text-green-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Case not found</h2>
        <p className="text-gray-500 mb-6">This case may have been removed or doesn't exist.</p>
        <Link href="/cases">
          <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl">
            Back to Cases
          </button>
        </Link>
      </div>
    )
  }

  const isActive = activeCase?.id === caseData.id

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Link href="/cases">
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors mt-1">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{caseData.cnrNumber}</h1>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(caseData.status)}`}>
                {caseData.status || 'Pending'}
              </span>
              {/* Case Status Badge with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getCaseStatusColor(caseData.caseStatus)}`}
                >
                  {caseData.caseStatus === 'ARCHIVED' && <Archive className="h-3 w-3" />}
                  {caseData.caseStatus === 'CLOSED' && <Lock className="h-3 w-3" />}
                  {caseData.caseStatus || 'OPEN'}
                </button>
                {showStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 min-w-[120px]">
                    {(['OPEN', 'ARCHIVED', 'CLOSED'] as CaseStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                          caseData.caseStatus === status ? 'bg-gray-50 font-medium' : ''
                        }`}
                      >
                        {status === 'ARCHIVED' && <Archive className="h-3.5 w-3.5 text-gray-500" />}
                        {status === 'CLOSED' && <Lock className="h-3.5 w-3.5 text-gray-500" />}
                        {status === 'OPEN' && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isActive && (
                <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                  Active
                </span>
              )}
            </div>
            {(caseData.petitioner || caseData.respondent) && (
              <p className="text-gray-600">
                {caseData.petitioner} vs {caseData.respondent}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isActive && caseData.caseStatus !== 'CLOSED' && (
            <button
              onClick={handleSetActive}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Set Active
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <MapPin className="h-3 w-3" />
            Court
          </div>
          <p className="font-medium text-gray-900 text-sm truncate">{caseData.court || 'Not specified'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Calendar className="h-3 w-3" />
            Next Hearing
          </div>
          <p className="font-medium text-gray-900 text-sm">{caseData.nextHearing || 'Not scheduled'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <FileText className="h-3 w-3" />
            Case Type
          </div>
          <p className="font-medium text-gray-900 text-sm">{caseData.caseType || 'General'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Clock className="h-3 w-3" />
            Added
          </div>
          <p className="font-medium text-gray-900 text-sm">{new Date(caseData.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'documents', label: 'Documents' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Case Health Widget */}
          <CaseHealthWidget />

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'AI Chat', icon: MessageSquare, href: '/ai-assistant', desc: 'Ask about this case' },
                { label: 'Draft', icon: FileText, href: '/drafts', desc: 'Generate document' },
                { label: 'Summarize', icon: Scale, href: '/summarizer', desc: 'Summarize judgment' },
                { label: 'Upload', icon: Upload, href: '#', desc: 'Add files' }
              ].map((action) => (
                <Link key={action.label} href={action.href} onClick={() => !isActive && handleSetActive()}>
                  <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-center">
                    <action.icon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900 text-sm">{action.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Read-only notice for closed cases */}
          {caseData.caseStatus === 'CLOSED' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Lock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Case Closed - Read Only</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This case is closed. You can view all data but cannot make changes. Reopen to edit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">AI-Assisted, Lawyer-Verified</p>
                <p className="text-xs text-blue-700 mt-1">
                  All AI-generated content should be reviewed before use. LAW.AI does not auto-send or auto-file anything.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <History className="h-5 w-5" />
              Case Timeline
            </h3>
          </div>

          {timeline.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-6">
                {timeline.map((item, index) => {
                  const Icon = getTimelineIcon(item.type)
                  return (
                    <div key={item.id} className="relative flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        index === 0 ? 'bg-gray-900' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${index === 0 ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No activity yet</p>
              <p className="text-sm text-gray-400 mt-1">Start working on this case to see timeline</p>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Documents & Files</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700">
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>

          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload files or generate drafts for this case</p>
          </div>
        </div>
      )}

      {/* Data Ownership Notice */}
      <p className="text-xs text-gray-400 text-center mt-8">
        🔒 Your data belongs to you. LAW.AI never trains on your content or shares it with third parties.
      </p>
    </div>
  )
}
